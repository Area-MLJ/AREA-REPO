/**
 * area-executor.js
 * Système d'exécution des AREAs
 * Exécute les réactions en fonction des actions déclenchées
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables Supabase manquantes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Exécute une réaction d'une AREA
 */
async function executeReaction(area, eventData = {}) {
  try {
    console.log(`🔄 Exécution de la réaction pour AREA: ${area.name}`);
    console.log(`   Réaction: ${area.reactionService} - ${area.reactionName}`);

    // Exécuter selon le type de réaction
    if (area.reactionService === "Resend" && area.reactionName === "Envoyer un email") {
      if (!resend) {
        throw new Error("Resend API key non configurée");
      }

      // Construire le contenu de l'email
      const emailContent = `
        <h2>AREA déclenchée: ${area.name}</h2>
        <p><strong>Action:</strong> ${area.actionService} - ${area.actionName}</p>
        <p><strong>Description:</strong> ${area.description || "Aucune description"}</p>
        ${eventData.message ? `<p><strong>Message Discord:</strong> ${eventData.message}</p>` : ""}
        ${eventData.author ? `<p><strong>Auteur:</strong> ${eventData.author}</p>` : ""}
        <p><em>Déclenché le ${new Date().toLocaleString("fr-FR")}</em></p>
      `;

      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: process.env.EMAIL_TO,
        subject: `[AREA] ${area.name}`,
        html: emailContent,
      });

      if (result.error) {
        throw new Error(result.error.message || "Erreur Resend");
      }

      console.log(`✅ Email envoyé via Resend`);
      return { success: true, message: "Email envoyé avec succès" };
    }

    // Autres types de réactions peuvent être ajoutés ici
    console.log(`⚠️ Réaction non implémentée: ${area.reactionService} - ${area.reactionName}`);
    return { success: false, message: "Réaction non implémentée" };
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de la réaction:`, error);
    throw error;
  }
}

/**
 * Déclenche les AREAs correspondant à un événement Discord
 */
async function triggerDiscordAreas(eventType, eventData) {
  try {
    console.log(`\n🔔 Événement Discord détecté: ${eventType}`);

    // Récupérer toutes les AREAs actives avec Discord comme action
    const { data: areas, error } = await supabase
      .from("areas")
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name),
        action:service_actions(name),
        reaction_service:services!areas_reaction_service_id_fkey(name),
        reaction:service_reactions(name)
      `)
      .eq("is_active", true)
      .eq("action_service.name", "Discord");

    if (error) {
      console.error("Erreur lors de la récupération des AREAs:", error);
      return;
    }

    if (!areas || areas.length === 0) {
      console.log("   Aucune AREA active avec Discord comme action");
      return;
    }

    console.log(`   ${areas.length} AREA(s) trouvée(s)`);

    // Filtrer les AREAs selon le type d'événement
    const matchingAreas = areas.filter((area) => {
      const actionName = area.action?.name || "";
      
      // Mapper les événements Discord aux actions
      if (eventType === "messageCreate" && actionName.includes("Nouveau message")) {
        return true;
      }
      if (eventType === "guildMemberAdd" && actionName.includes("Utilisateur rejoint")) {
        return true;
      }
      return false;
    });

    if (matchingAreas.length === 0) {
      console.log("   Aucune AREA ne correspond à cet événement");
      return;
    }

    console.log(`   ${matchingAreas.length} AREA(s) correspondante(s)`);

    // Exécuter chaque AREA correspondante
    for (const area of matchingAreas) {
      try {
        const formattedArea = {
          id: area.id,
          name: area.name,
          description: area.description,
          actionService: area.action_service?.name || "Unknown",
          actionName: area.action?.name || "Unknown",
          reactionService: area.reaction_service?.name || "Unknown",
          reactionName: area.reaction?.name || "Unknown",
        };

        // Exécuter la réaction
        await executeReaction(formattedArea, eventData);

        // Mettre à jour last_triggered
        await supabase
          .from("areas")
          .update({ last_triggered: new Date().toISOString() })
          .eq("id", area.id);

        console.log(`✅ AREA "${area.name}" exécutée avec succès`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de l'AREA "${area.name}":`, error);
        // Continuer avec les autres AREAs même si une échoue
      }
    }
  } catch (error) {
    console.error("Erreur lors du déclenchement des AREAs:", error);
  }
}

/**
 * Exécute une AREA spécifique par son ID
 */
async function executeAreaById(areaId, eventData = {}) {
  try {
    const { data: area, error } = await supabase
      .from("areas")
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name),
        action:service_actions(name),
        reaction_service:services!areas_reaction_service_id_fkey(name),
        reaction:service_reactions(name)
      `)
      .eq("id", areaId)
      .eq("is_active", true)
      .single();

    if (error || !area) {
      throw new Error("AREA non trouvée ou inactive");
    }

    const formattedArea = {
      id: area.id,
      name: area.name,
      description: area.description,
      actionService: area.action_service?.name || "Unknown",
      actionName: area.action?.name || "Unknown",
      reactionService: area.reaction_service?.name || "Unknown",
      reactionName: area.reaction?.name || "Unknown",
    };

    const result = await executeReaction(formattedArea, eventData);

    // Mettre à jour last_triggered
    await supabase
      .from("areas")
      .update({ last_triggered: new Date().toISOString() })
      .eq("id", areaId);

    return result;
  } catch (error) {
    console.error("Erreur lors de l'exécution de l'AREA:", error);
    throw error;
  }
}

// Exports pour utilisation dans d'autres fichiers
export { triggerDiscordAreas, executeAreaById };

