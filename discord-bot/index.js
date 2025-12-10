import { Client, GatewayIntentBits, Events, EmbedBuilder } from "discord.js";
import { Resend } from "resend";
import { triggerDiscordAreas, executeAreaById } from "./area-executor.js";
import "dotenv/config";

// URL de l'API (par défaut localhost:3001)
const API_URL = process.env.API_URL || "http://localhost:3001";

// Vérification des variables d'environnement au démarrage
const requiredEnvVars = ["DISCORD_TOKEN"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

if (missingVars.length > 0) {
  console.error(
    "❌ Variables d'environnement manquantes:",
    missingVars.join(", ")
  );
  console.error("Assurez-vous d'avoir un fichier .env avec toutes les variables requises.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Fonction helper pour appeler l'API
async function callAPI(endpoint, method = "GET", body = null) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } catch (error) {
    console.error(`Erreur API ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

// Quand le bot est prêt
client.once(Events.ClientReady, () => {
  console.log(`Bot connecté: ${client.user.tag}`);
  console.log(`API URL: ${API_URL}`);
  if (resend) {
    console.log(`Email FROM: ${process.env.EMAIL_FROM}`);
    console.log(`Email TO: ${process.env.EMAIL_TO}`);
  }
});

// Gestion des interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Commande sendmail
  if (interaction.commandName === "sendmail") {
    if (!resend) {
      await interaction.reply("❌ Service email non configuré.");
      return;
    }

    const content = interaction.options.getString("content");

    if (!content) {
      await interaction.reply("❌ Le contenu ne peut pas être vide.");
      return;
    }

    await interaction.reply("📨 Envoi de l'email en cours...");

    try {
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: "Message Discord",
        html: `<p>${content}</p>`,
      });

      if (result.error) {
        throw new Error(result.error.message || "Erreur lors de l'envoi");
      }

      await interaction.editReply("✔️ Email envoyé avec succès !");
    } catch (err) {
      let errorMessage = "❌ Erreur lors de l'envoi de l'email.";
      if (err.message) {
        errorMessage += `\n\nDétails: ${err.message}`;
      }
      await interaction.editReply(errorMessage);
    }
    return;
  }

  // Commande areas - Liste toutes les AREAs
  if (interaction.commandName === "areas") {
    await interaction.deferReply();

    const result = await callAPI("/api/areas");

    if (!result.success) {
      await interaction.editReply("❌ Erreur lors de la récupération des AREAs.");
      return;
    }

    const areas = result.data || [];
    if (areas.length === 0) {
      await interaction.editReply("📭 Aucune AREA trouvée.");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🤖 Vos AREAs")
      .setColor(0x0a4a0e)
      .setDescription(
        areas
          .map(
            (area, idx) =>
              `**${idx + 1}.** ${area.isActive ? "🟢" : "🔴"} **${area.name}**\n` +
              `   ID: \`${area.id}\`\n` +
              `   ${area.actionService} → ${area.reactionService}`
          )
          .join("\n\n")
      )
      .setFooter({ text: `Total: ${areas.length} AREA(s)` });

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Commande area - Détails d'une AREA
  if (interaction.commandName === "area") {
    await interaction.deferReply();

    const areaId = interaction.options.getString("id");
    const result = await callAPI(`/api/areas/${areaId}`);

    if (!result.success || !result.data) {
      await interaction.editReply(`❌ AREA avec l'ID \`${areaId}\` non trouvée.`);
      return;
    }

    const area = result.data;
    const embed = new EmbedBuilder()
      .setTitle(`🤖 ${area.name}`)
      .setColor(area.isActive ? 0x10b981 : 0x8b8980)
      .setDescription(area.description)
      .addFields(
        {
          name: "📥 Action",
          value: `${area.actionService}\n*${area.actionName}*`,
          inline: true,
        },
        {
          name: "📤 Réaction",
          value: `${area.reactionService}\n*${area.reactionName}*`,
          inline: true,
        },
        {
          name: "Status",
          value: area.isActive ? "🟢 Active" : "🔴 Inactive",
          inline: true,
        }
      )
      .setFooter({ text: `ID: ${area.id}` });

    if (area.lastTriggered) {
      embed.addFields({
        name: "⏰ Dernière exécution",
        value: new Date(area.lastTriggered).toLocaleString("fr-FR"),
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Commande trigger - Déclenche une AREA
  if (interaction.commandName === "trigger") {
    await interaction.deferReply();

    const areaId = interaction.options.getString("id");
    
    try {
      // Exécuter l'AREA directement
      const result = await executeAreaById(areaId, {
        message: `Déclenché manuellement par ${interaction.user.tag}`,
        author: interaction.user.tag,
      });

      const areaResult = await callAPI(`/api/areas/${areaId}`);
      const area = areaResult.data;

      const embed = new EmbedBuilder()
        .setTitle("✅ AREA exécutée !")
        .setColor(0x10b981)
        .setDescription(result.message || "AREA exécutée avec succès")
        .addFields(
          {
            name: "📥 Action",
            value: `${area.actionService} - ${area.actionName}`,
            inline: true,
          },
          {
            name: "📤 Réaction",
            value: `${area.reactionService} - ${area.reactionName}`,
            inline: true,
          }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply(
        `❌ Erreur: ${error.message || "Impossible d'exécuter l'AREA"}`
      );
    }
    return;
  }

  // Commande toggle - Active/désactive une AREA
  if (interaction.commandName === "toggle") {
    await interaction.deferReply();

    const areaId = interaction.options.getString("id");
    const result = await callAPI(`/api/areas/${areaId}/toggle`, "POST");

    if (!result.success) {
      await interaction.editReply(
        `❌ Erreur: ${result.error || "Impossible de modifier l'AREA"}`
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(
        result.data.isActive ? "🟢 AREA activée" : "🔴 AREA désactivée"
      )
      .setColor(result.data.isActive ? 0x10b981 : 0x8b8980)
      .setDescription(`**${result.data.name}**`)
      .setFooter({ text: result.message });

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Commande stats - Statistiques
  if (interaction.commandName === "stats") {
    await interaction.deferReply();

    const result = await callAPI("/api/stats");

    if (!result.success) {
      await interaction.editReply("❌ Erreur lors de la récupération des stats.");
      return;
    }

    const stats = result.data;
    const embed = new EmbedBuilder()
      .setTitle("📊 Statistiques des AREAs")
      .setColor(0x0a4a0e)
      .addFields(
        {
          name: "📦 Total",
          value: `${stats.total}`,
          inline: true,
        },
        {
          name: "🟢 Actives",
          value: `${stats.active}`,
          inline: true,
        },
        {
          name: "🔴 Inactives",
          value: `${stats.inactive}`,
          inline: true,
        }
      );

    await interaction.editReply({ embeds: [embed] });
    return;
  }
});

// Écouter les nouveaux messages pour déclencher les AREAs
client.on(Events.MessageCreate, async (message) => {
  // Ignorer les messages du bot lui-même
  if (message.author.bot) return;

  // Déclencher les AREAs Discord → ...
  await triggerDiscordAreas("messageCreate", {
    message: message.content,
    author: message.author.tag,
    channel: message.channel.name,
    guild: message.guild?.name,
  });
});

// Écouter les nouveaux membres qui rejoignent
client.on(Events.GuildMemberAdd, async (member) => {
  // Déclencher les AREAs Discord → ...
  await triggerDiscordAreas("guildMemberAdd", {
    user: member.user.tag,
    guild: member.guild.name,
  });
});

client.login(process.env.DISCORD_TOKEN);

