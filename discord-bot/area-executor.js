// URL de l'API (par défaut localhost:3001)
const API_URL = process.env.API_URL || "http://localhost:3001";

/**
 * Fonction helper pour appeler l'API
 */
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

/**
 * Déclenche les AREAs qui ont Discord comme service d'action
 * @param {string} eventType - Type d'événement (messageCreate, guildMemberAdd, etc.)
 * @param {object} eventData - Données de l'événement
 */
export async function triggerDiscordAreas(eventType, eventData) {
  try {
    // Récupérer toutes les AREAs actives avec Discord comme action
    const result = await callAPI("/api/areas");
    
    if (!result.success || !result.data) {
      console.error("Erreur lors de la récupération des AREAs:", result.error);
      return;
    }

    const areas = result.data.filter(
      (area) => area.isActive && area.actionService === "discord"
    );

    if (areas.length === 0) {
      return; // Aucune AREA Discord active
    }

    // Pour chaque AREA Discord, vérifier si elle correspond à l'événement
    for (const area of areas) {
      try {
        // Vérifier si l'AREA correspond au type d'événement
        // Par exemple, si l'actionName est "messageCreate" et eventType est "messageCreate"
        if (area.actionName === eventType || area.actionName === "*") {
          // Exécuter l'AREA
          await executeAreaById(area.id, eventData);
        }
      } catch (error) {
        console.error(`Erreur lors de l'exécution de l'AREA ${area.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Erreur lors du déclenchement des AREAs Discord:", error);
  }
}

/**
 * Exécute une AREA par son ID
 * @param {string} areaId - ID de l'AREA à exécuter
 * @param {object} context - Contexte de l'exécution (données de l'événement)
 * @returns {Promise<object>} Résultat de l'exécution
 */
export async function executeAreaById(areaId, context = {}) {
  try {
    // Appeler l'endpoint d'exécution de l'AREA
    const result = await callAPI(`/api/areas/${areaId}/execute`, "POST", context);

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de l'exécution de l'AREA");
    }

    console.log(`✅ AREA ${areaId} exécutée avec succès`);
    return {
      success: true,
      message: result.message || "AREA exécutée avec succès",
      data: result.data,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de l'AREA ${areaId}:`, error);
    throw error;
  }
}

