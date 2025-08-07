//código creado por Dioneibi-rip
//modificado por nevi-dev
import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏᴇ\'s 𝐒ervice';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender); // Identificando al Proxy

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
      title: 'Ellen Joe: Pista localizada. 🦈',
      body: `Procesando solicitud para el/la Proxy ${name}...`,
      thumbnail: icons, // Asegúrate de que 'icons' y 'redes' estén definidos globalmente o pasados
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🦈 *Rastro frío, Proxy ${name}.* Necesito un identificador de video para proceder. Dame el enlace.\n\n_Ejemplo: ${usedPrefix + command} https://youtube.com/watch?v=xxxxxxxxxxx_`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `🔄 *Decodificando la señal, Proxy ${name}.* Aguarda. La presa está al alcance.`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];
    const api = `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    const json = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(
        m.chat,
        `❌ *Extracción fallida, Proxy ${name}.*\nEl objetivo se ha escapado o la señal es inestable. Razón: ${json.message || 'Respuesta inválida del servidor.'}`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const {
      title,
      description,
      timestamp,
      views,
      author,
    } = json.result.metadata;

    const {
      url: downloadURL,
      quality,
      filename
    } = json.result.download;

    const videoRes = await fetch(downloadURL);
    const videoBuffer = await videoRes.buffer();

    await conn.sendMessage(
      m.chat,
      {
        video: videoBuffer,
        caption:
`╭━━━━[ 𝚈𝚃𝙼𝙿𝟺 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙿𝚛𝚎𝚜𝚊 𝙲𝚊𝚙𝚝𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
📹 *Designación:* ${title}
🧑‍💻 *Fuente Operacional:* ${author?.name || 'Desconocida'}
🕒 *Duración del Flujo:* ${timestamp}
📅 *Fecha de Registro:* ${json.result.metadata.ago}
👁️ *Registros de Observación:* ${views.toLocaleString()}
🎞️ *Calidad de Transmisión:* ${quality}
📄 *Manifiesto de Carga:*
${description}
╰━━━━━━━━━━━━━━━━━━⬣`,
        mimetype: 'video/mp4',
        fileName: filename
      },
      { contextInfo, quoted: m }
    );
  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `⚠️ *Anomalía detectada, Proxy ${name}.*\nNo pude asegurar la carga de video. Repórtalo si persiste.\nDetalles: ${e.message}`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp4'].map(v => v + ' <enlace>');
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'ytvideo', 'ytmp4dl'];
handler.register = true;
handler.limit = true;
handler.coin = 3;

export default handler;
