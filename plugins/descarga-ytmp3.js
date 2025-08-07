//código creado por Dioneibi-rip
//modificado por nevi-dev
import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏᴇ\'s 𝐒ervice';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender); // Identificando al Proxy
  const emoji = '🎵'; // Manteniendo el emoji de música

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
      title: 'Ellen Joe: Pista localizada. 🦈', // Título actualizado
      body: `Procesando solicitud para el/la Proxy ${name}...`, // Cuerpo actualizado
      thumbnail: global.icono, // Asegúrate de que 'icons' y 'redes' estén definidos globalmente o pasados
      sourceUrl: global.redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *Rastro frío, Proxy ${name}.* Necesito un identificador de audio para proceder. Dame el enlace.\n\n_Ejemplo: ${usedPrefix + command} https://youtu.be/KHgllosZ3kA`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `🔄 *Decodificando la señal de audio, Proxy ${name}.* Aguarda. El flujo de datos está siendo asegurado.`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];
    const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(
        m.chat,
        `❌ *Extracción de audio fallida, Proxy ${name}.*\nEl objetivo se ha escapado o la señal es inestable. Razón: ${json.message || 'Respuesta inválida del servidor.'}`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // Metadata
    const meta = json.result.metadata;
    const title = meta.title;
    const description = meta.description;
    const timestamp = meta.timestamp;
    const views = meta.views.toLocaleString();
    const ago = meta.ago;
    const authorName = meta.author?.name || 'Desconocido';
    // Download info
    const downloadURL = json.result.download.url;
    const quality = json.result.download.quality;
    const filename = json.result.download.filename;

    const audioRes = await fetch(downloadURL);
    const audioBuffer = await audioRes.buffer();

    // Caption con estilo Ellen Joe
    const caption = `
╭━━━━[ 𝚈𝚃𝙼𝙿𝟹 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙵𝚕𝚞𝚓𝚘 𝙰𝚞𝚍𝚒𝚘 𝚂𝚎𝚐𝚞𝚛𝚘 ]━━━━⬣
📌 *Designación de Audio:* ${title}
👤 *Fuente Operacional:* ${authorName}
⏱️ *Duración del Flujo:* ${timestamp}
📅 *Fecha de Registro:* ${ago}
👁️ *Registros de Observación:* ${views}
🎚️ *Calidad de Transmisión:* ${quality}
📄 *Manifiesto de Carga (Descripción):*
${description}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

    // Enviar audio
    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: filename,
        ptt: false, // Mantener ptt en false a menos que se solicite un mensaje de voz
        caption
      },
      { contextInfo, quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `⚠️ *Anomalía detectada, Proxy ${name}.*\nNo pude asegurar la carga de audio. Repórtalo si persiste.\nDetalles: ${e.message}`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp3'].map(v => v + ' <link>');
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'ytaudio', 'mp3'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;
