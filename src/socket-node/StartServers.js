import { fork } from 'child_process';
import path from 'path';

// Récupérer le répertoire actuel
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Liste des serveurs avec leurs chemins relatifs
const servers = [
  path.join(__dirname, "serverVideo.cjs"),
  path.join(__dirname, "serverMessages.cjs"),
  path.join(__dirname, "serverNotification.cjs"),
  path.join(__dirname, "serverOnlineUsers.cjs"),
  path.join(__dirname, "server.cjs"),
];

// Démarrer chaque serveur
servers.forEach((server) => {
  const process = fork(server); // Lance chaque serveur
  console.log(`Lancement de ${server}...`);
  process.on("exit", (code) => {
    console.log(`${server} s'est arrêté avec le code ${code}`);
  });
});
