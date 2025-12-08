/**
 * API Server pour connecter le bot Discord au site web
 * Expose les AREAs et permet de les déclencher
 * Utilise Supabase comme base de données
 */

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const app = express();
const PORT = process.env.API_PORT || 3001;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variables Supabase manquantes dans .env");
  console.error("   SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) sont requis");
  process.exit(1);
}

// Client Supabase avec service role key pour bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(express.json());

// Routes API

// GET /api/areas - Liste toutes les AREAs
app.get("/api/areas", async (req, res) => {
  try {
    const userId = req.query.user_id; // Optionnel : filtrer par utilisateur

    let query = supabase
      .from("areas")
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name, icon),
        reaction_service:services!areas_reaction_service_id_fkey(name, icon),
        action:service_actions(name),
        reaction:service_reactions(name)
      `);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Formater les données pour correspondre à l'ancien format
    const formattedAreas = (data || []).map((area) => ({
      id: area.id,
      name: area.name,
      description: area.description,
      isActive: area.is_active,
      actionService: area.action_service?.name || "Unknown",
      actionName: area.action?.name || "Unknown",
      reactionService: area.reaction_service?.name || "Unknown",
      reactionName: area.reaction?.name || "Unknown",
      createdAt: area.created_at,
      lastTriggered: area.last_triggered,
      userId: area.user_id,
    }));

    res.json({
      success: true,
      data: formattedAreas,
      count: formattedAreas.length,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/areas/:id - Récupère une AREA spécifique
app.get("/api/areas/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("areas")
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name, icon),
        reaction_service:services!areas_reaction_service_id_fkey(name, icon),
        action:service_actions(name),
        reaction:service_reactions(name)
      `)
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: "AREA non trouvée",
      });
    }

    const formattedArea = {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.is_active,
      actionService: data.action_service?.name || "Unknown",
      actionName: data.action?.name || "Unknown",
      reactionService: data.reaction_service?.name || "Unknown",
      reactionName: data.reaction?.name || "Unknown",
      createdAt: data.created_at,
      lastTriggered: data.last_triggered,
      userId: data.user_id,
    };

    res.json({
      success: true,
      data: formattedArea,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/areas/:id/trigger - Déclenche une AREA
app.post("/api/areas/:id/trigger", async (req, res) => {
  try {
    // Importer le module d'exécution
    const { executeAreaById } = await import("./area-executor.js");

    // Exécuter l'AREA
    const result = await executeAreaById(req.params.id, req.body.eventData || {});

    // Récupérer l'AREA mise à jour pour la réponse
    const { data: area } = await supabase
      .from("areas")
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name, icon),
        reaction_service:services!areas_reaction_service_id_fkey(name, icon),
        action:service_actions(name),
        reaction:service_reactions(name)
      `)
      .eq("id", req.params.id)
      .single();

    const formattedArea = {
      id: area.id,
      name: area.name,
      description: area.description,
      isActive: area.is_active,
      actionService: area.action_service?.name || "Unknown",
      actionName: area.action?.name || "Unknown",
      reactionService: area.reaction_service?.name || "Unknown",
      reactionName: area.reaction?.name || "Unknown",
      createdAt: area.created_at,
      lastTriggered: area.last_triggered,
      userId: area.user_id,
    };

    res.json({
      success: true,
      message: result.message || `AREA "${area.name}" exécutée avec succès`,
      data: formattedArea,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/areas/:id/toggle - Active/désactive une AREA
app.post("/api/areas/:id/toggle", async (req, res) => {
  try {
    // Récupérer l'AREA actuelle
    const { data: area, error: fetchError } = await supabase
      .from("areas")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !area) {
      return res.status(404).json({
        success: false,
        error: "AREA non trouvée",
      });
    }

    // Toggle is_active
    const { data: updatedArea, error: updateError } = await supabase
      .from("areas")
      .update({ is_active: !area.is_active })
      .eq("id", req.params.id)
      .select(`
        *,
        action_service:services!areas_action_service_id_fkey(name, icon),
        reaction_service:services!areas_reaction_service_id_fkey(name, icon),
        action:service_actions(name),
        reaction:service_reactions(name)
      `)
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour:", updateError);
      return res.status(500).json({
        success: false,
        error: updateError.message,
      });
    }

    const formattedArea = {
      id: updatedArea.id,
      name: updatedArea.name,
      description: updatedArea.description,
      isActive: updatedArea.is_active,
      actionService: updatedArea.action_service?.name || "Unknown",
      actionName: updatedArea.action?.name || "Unknown",
      reactionService: updatedArea.reaction_service?.name || "Unknown",
      reactionName: updatedArea.reaction?.name || "Unknown",
      createdAt: updatedArea.created_at,
      lastTriggered: updatedArea.last_triggered,
      userId: updatedArea.user_id,
    };

    res.json({
      success: true,
      message: `AREA ${updatedArea.is_active ? "activée" : "désactivée"}`,
      data: formattedArea,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/stats - Statistiques des AREAs
app.get("/api/stats", async (req, res) => {
  try {
    const userId = req.query.user_id; // Optionnel : filtrer par utilisateur

    let query = supabase.from("areas").select("id, is_active");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    const areas = data || [];
    const stats = {
      total: areas.length,
      active: areas.filter((a) => a.is_active).length,
      inactive: areas.filter((a) => !a.is_active).length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/services - Liste tous les services
app.get("/api/services", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        actions:service_actions(*),
        reactions:service_reactions(*)
      `)
      .order("name");

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Formater les données
    const formattedServices = (data || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      icon: service.icon,
      category: service.category,
      isConnected: service.is_active, // is_active dans la DB = isConnected dans le frontend
      actions: service.actions || [],
      reactions: service.reactions || [],
    }));

    res.json({
      success: true,
      data: formattedServices,
      count: formattedServices.length,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/services/:id/toggle - Active/désactive un service
app.post("/api/services/:id/toggle", async (req, res) => {
  try {
    // Récupérer le service actuel
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !service) {
      return res.status(404).json({
        success: false,
        error: "Service non trouvé",
      });
    }

    // Toggle is_active
    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", req.params.id)
      .select(`
        *,
        actions:service_actions(*),
        reactions:service_reactions(*)
      `)
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour:", updateError);
      return res.status(500).json({
        success: false,
        error: updateError.message,
      });
    }

    const formattedService = {
      id: updatedService.id,
      name: updatedService.name,
      description: updatedService.description,
      icon: updatedService.icon,
      category: updatedService.category,
      isConnected: updatedService.is_active,
      actions: updatedService.actions || [],
      reactions: updatedService.reactions || [],
    };

    res.json({
      success: true,
      message: `Service ${updatedService.is_active ? "activé" : "désactivé"}`,
      data: formattedService,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API server is running",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server démarré sur http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   GET  /api/areas - Liste toutes les AREAs`);
  console.log(`   GET  /api/areas/:id - Récupère une AREA`);
  console.log(`   POST /api/areas/:id/trigger - Déclenche une AREA`);
  console.log(`   POST /api/areas/:id/toggle - Active/désactive une AREA`);
  console.log(`   GET  /api/stats - Statistiques`);
  console.log(`   GET  /api/services - Liste tous les services`);
  console.log(`   POST /api/services/:id/toggle - Active/désactive un service`);
  console.log(`✅ Connecté à Supabase: ${supabaseUrl}`);
});

