import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) {
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un video o imagen de Pinterest para iniciar la extracción.`, m, { contextInfo, quoted: m });
    }

    conn.sendMessage(m.chat, { react: { text: "🔄", key: m.key } }); // Changed emoji to '🔄' for consistency
    conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción Pinterest, Proxy ${name}.* Aguarda, la carga visual está siendo procesada.`, m, { contextInfo, quoted: m });

    try {
        let res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${text}`);
        if (!res.ok) {
            await m.react('❌'); // Error reaction
            throw `❌ *Fallo en la transmisión de datos, Proxy ${name}.*\nCódigo de estado de la API: ${res.status}.`;
        }

        let json = await res.json();

        if (!json.data || !json.data.result) {
            await m.react('❌'); // Error reaction
            throw `❌ *Carga visual fallida, Proxy ${name}.*\nNo se pudo obtener el contenido de Pinterest.`;
        }

        const mediaUrl = json.data.result;
        const originalUrl = json.data.url;
        const isVideo = mediaUrl.endsWith('.mp4');
        const fileExtension = isVideo ? 'mp4' : 'jpg'; // Assuming it's either video or image

        const caption = `
╭━━━━[ 𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝚅𝚒𝚜𝚞𝚊𝚕 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
${isVideo ? '📹' : '🖼️'} *Tipo de Contenido:* ${isVideo ? 'Video' : 'Imagen'}
🔗 *Enlace de Origen:* ${originalUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        if (isVideo) {
            await conn.sendFile(m.chat, mediaUrl, `pinterest_video.${fileExtension}`, caption, m, null, { contextInfo, quoted: m });
        } else {
            await conn.sendFile(m.chat, mediaUrl, `pinterest_image.${fileExtension}`, caption, m, null, { contextInfo, quoted: m });
        }

        await m.react('✅'); // Success reaction

    } catch (error) {
        console.error("Error al procesar Pinterest:", error);
        await m.react('❌'); // Error reaction
        conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación Pinterest, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${error.message}`, m, { contextInfo, quoted: m });
    }
};

handler.help = ['pinvid *<link>*'];
handler.tags = ['descargas'];
handler.command = ['pinvideo', 'pinvid', 'pinterestdl', 'pinterest']; // Added more commands for discoverability
handler.premium = false; // Check if this is intended for free users
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;
