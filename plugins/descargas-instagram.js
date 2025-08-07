import { igdl } from 'ruhend-scraper';

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

const handler = async (m, { args, conn }) => {
  const name = conn.getName(m.sender); // Identifying the Proxy

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
      thumbnail: icons, // Ensure 'icons' and 'redes' are globally defined
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un post de Instagram para iniciar la extracción.`, m, { contextInfo, quoted: m });
  }

  try {
    await m.react('🔄'); // Changed emoji to '🔄' for consistency
    conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción de Instagram, Proxy ${name}.* Aguarda, la carga visual está siendo procesada.`, m, { contextInfo, quoted: m });

    const res = await igdl(args[0]);
    const data = res.data;

    if (!data || data.length === 0) {
      await m.react('❌'); // Error reaction
      return conn.reply(m.chat, `❌ *Carga visual fallida, Proxy ${name}.*\nNo se encontraron resultados válidos para el enlace de Instagram.`, m, { contextInfo, quoted: m });
    }

    for (let i = 0; i < data.length; i++) {
      const media = data[i];
      const isVideo = media.type === 'video';
      const fileExtension = isVideo ? 'mp4' : 'jpg';

      const caption = `
╭━━━━[ 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝚅𝚒𝚜𝚞𝚊𝚕 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
${isVideo ? '📹' : '🖼️'} *Tipo de Contenido:* ${isVideo ? 'Video' : 'Imagen'}
${data.length > 1 ? `🔢 *Parte:* ${i + 1}/${data.length}\n` : ''}🔗 *Enlace de Origen:* ${args[0]}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

      try {
        if (isVideo) {
          await conn.sendMessage(m.chat, { video: { url: media.url }, caption: caption, fileName: `instagram_video_${i + 1}.${fileExtension}`, mimetype: 'video/mp4' }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { image: { url: media.url }, caption: caption, fileName: `instagram_image_${i + 1}.${fileExtension}`, mimetype: 'image/jpeg' }, { quoted: m });
        }
      } catch (sendError) {
        console.error(`Error al enviar el archivo ${i + 1} de Instagram:`, sendError);
        conn.reply(m.chat, `⚠️ *Anomalía en la transmisión de archivo ${i + 1}, Proxy ${name}.*\nNo pude enviar el contenido. Detalles: ${sendError.message}`, m, { contextInfo, quoted: m });
      }
    }
    await m.react('✅'); // Success reaction for the whole operation

  } catch (e) {
    console.error("Error al procesar Instagram:", e);
    await m.react('❌'); // Error reaction
    conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación de Instagram, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${e.message || e}`, m, { contextInfo, quoted: m });
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram <url>', 'ig <url>'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;
