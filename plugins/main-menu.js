import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';
import axios from 'axios';

const cooldowns = new Map();
const ultimoMenuEnviado = new Map();

const newsletterJid = '120363422310218834@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ і𝗍sᥙkі ᥒᥲkᥲᥒ᥆\'s 𝐒ervice';
const packname = '˚і𝗍sᥙkі ᥒᥲkᥲᥒ᥆ -bot';

const GITHUB_REPO_OWNER = 'Emmax08';
const GITHUB_REPO_NAME = 'mᥲríᥲ k᥆ȷᥙ᥆-Bot-MX';
const GITHUB_BRANCH = 'main';

let handler = async (m, { conn, usedPrefix }) => {
  let enlacesMultimedia;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    const dbRaw = fs.readFileSync(dbPath);
    enlacesMultimedia = JSON.parse(dbRaw).links;
  } catch (e) {
    console.error("Error al leer src/database/db.json:", e);
    return conn.reply(m.chat, 'Error al leer la base de datos de medios.', m);
  }

  if (m.quoted?.id && m.quoted?.fromMe) return;

  const idChat = m.chat;
  const ahora = Date.now();
  const tiempoEspera = 5 * 60 * 1000;

  const ultimoUso = cooldowns.get(idChat) || 0;

  if (ahora - ultimoUso < tiempoEspera) {
    const tiempoRestanteMs = tiempoEspera - (ahora - ultimoUso);
    const minutos = Math.floor(tiempoRestanteMs / 60000);
    const segundos = Math.floor((tiempoRestanteMs % 60000) / 1000);
    const ultimo = ultimoMenuEnviado.get(idChat);
    return await conn.reply(
      idChat,
      `@${m.sender.split('@')[0]} cálmate amigo! 👑 Debes esperar para volver a usar el menú.\nTiempo restante: *${minutos}m ${segundos}s*`,
      ultimo?.message || m,
      { mentions: [m.sender] }
    );
  }

  let nombre;
  try {
    nombre = await conn.getName(m.sender);
  } catch {
    nombre = 'Usuario';
  }

  const esPrincipal = conn.user.jid === global.conn.user.jid;
  const numeroBot = conn.user.jid.split('@')[0];
  const numeroPrincipal = global.conn?.user?.jid?.split('@')[0] || "Desconocido";
  const totalComandos = Object.keys(global.plugins || {}).length;
  const tiempoActividad = clockString(process.uptime() * 1000);
  const totalRegistros = Object.keys(global.db?.data?.users || {}).length;
  const horaCDMX = moment().tz("America/Mexico_City").format('h:mm A');

  const videoGif = enlacesMultimedia.video[Math.floor(Math.random() * enlacesMultimedia.video.length)];
  const miniaturaRandom = enlacesMultimedia.imagen[Math.floor(Math.random() * enlacesMultimedia.imagen.length)];

  const redes = 'https://whatsapp.com/channel/0029Vb60E6xLo4hbOoM0NG3D';

  const emojis = {
    'main': '🪽', 'tools': '🛠️', 'audio': '🎧', 'group': '👥',
    'owner': '👑', 'fun': '🎮', 'info': 'ℹ️', 'internet': '🌐',
    'downloads': '⬇️', 'admin': '🧰', 'anime': '✨', 'nsfw': '🔞',
    'search': '🔍', 'sticker': '🖼️', 'game': '🕹️', 'premium': '💎', 'bot': '🤖'
  };

  let grupos = {};
  for (let plugin of Object.values(global.plugins || {})) {
    if (!plugin.help || !plugin.tags) continue;
    for (let tag of plugin.tags) {
      if (!grupos[tag]) grupos[tag] = [];
      for (let help of plugin.help) {
        if (/^\$|^=>|^>/.test(help)) continue;
        grupos[tag].push(`${usedPrefix}${help}`);
      }
    }
  }

  for (let tag in grupos) {
    grupos[tag].sort((a, b) => a.localeCompare(b));
  }

  const secciones = Object.entries(grupos).map(([tag, cmds]) => {
    const emoji = emojis[tag] || '📁';
    return `[${emoji} ${tag.toUpperCase()}]\n` + cmds.map(cmd => `> ${cmd}`).join('\n');
  }).join('\n\n');

  let localVersion = 'N/A';
  let serverVersion = 'N/A';
  let updateStatus = 'Desconocido';

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonRaw);
    localVersion = packageJson.version || 'N/A';
  } catch (error) {
    console.error("Error al leer la versión local:", error.message);
    localVersion = 'Error';
  }

  try {
    const githubPackageJsonUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/package.json`;
    const response = await axios.get(githubPackageJsonUrl);
    const githubPackageJson = response.data;
    serverVersion = githubPackageJson.version || 'N/A';

    if (localVersion !== 'N/A' && serverVersion !== 'N/A') {
      updateStatus = (localVersion === serverVersion)
        ? '✅ En última versión'
        : `⚠️ Actualización disponible. Actualiza con *${usedPrefix}update*`;
    }
  } catch (error) {
    console.error("Error al obtener versión remota:", error.message);
    serverVersion = 'Error';
    updateStatus = '❌ No se pudo verificar la actualización';
  }

  const encabezado = `
👑 |--- *і𝗍sᥙkі ᥒᥲkᥲᥒ᥆-Bot | * ---| 🪽
| 👤 *Usuario:* ${nombre}
| 🌎 *Hora CDMX:* ${horaCDMX}
|-------------------------------------------|
| 🚀 *VERSION DEL BOT*
| ➡️ *Local:* ${localVersion}
| ➡️ *Servidor:* ${serverVersion}
| 📊 *Estado:* ${updateStatus}
|-------------------------------------------|
| 🤖 *Bot:* ${esPrincipal ? 'Principal' : `Sub-Bot | Principal: wa.me/${numeroPrincipal}`}
| 📦 *Comandos:* ${totalComandos}
| ⏱️ *Tiempo Activo:* ${tiempoActividad}
| 👥 *Usuarios Reg:* ${totalRegistros}
| 👑 *Dueño:* wa.me/${global.owner?.[0]?.[0] || "No definido"}
|-------------------------------------------|`.trim();

  const textoFinal = `${encabezado}\n\n${secciones}\n\n*${packname}*`;

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: '👑 Menú de Comandos | mᥲríᥲ k᥆ȷᥙ᥆-Bot 🪽',
      thumbnailUrl: miniaturaRandom,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  let msgEnviado;
  try {
    msgEnviado = await conn.sendMessage(idChat, {
      video: { url: videoGif },
      gifPlayback: true,
      caption: textoFinal,
      contextInfo
    }, { quoted: m });
  } catch (e) {
    console.error("Error al enviar el menú con video:", e);
    msgEnviado = await conn.reply(idChat, textoFinal, m, { contextInfo });
  }

  cooldowns.set(idChat, ahora);
  ultimoMenuEnviado.set(idChat, {
    timestamp: ahora,
    message: msgEnviado
  });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}