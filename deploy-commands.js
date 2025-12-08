import { REST, Routes } from "discord.js";
import "dotenv/config";

const commands = [
  {
    name: "sendmail",
    description: "Envoie un email via Resend",
    options: [
      {
        name: "content",
        description: "Contenu du message à envoyer par email",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "areas",
    description: "Liste toutes vos AREAs",
  },
  {
    name: "area",
    description: "Affiche les détails d'une AREA",
    options: [
      {
        name: "id",
        description: "ID de l'AREA à afficher",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "trigger",
    description: "Déclenche une AREA",
    options: [
      {
        name: "id",
        description: "ID de l'AREA à déclencher",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "toggle",
    description: "Active ou désactive une AREA",
    options: [
      {
        name: "id",
        description: "ID de l'AREA à activer/désactiver",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "stats",
    description: "Affiche les statistiques de vos AREAs",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log("Déploiement des commandes slash...");
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
    { body: commands }
  );
  console.log("Commandes deployées !");
} catch (e) {
  console.error(e);
}

