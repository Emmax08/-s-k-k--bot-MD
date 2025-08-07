import axios from 'axios';

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

let enviando = false; // Flag para controlar envíos concurrentes

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
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
            thumbnail: icons, // Asegúrate de que 'icons' y 'redes' estén definidos globalmente
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (!args || !args[0]) {
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un video o imagen de X/Twitter para iniciar la extracción.`, m, { contextInfo, quoted: m });
    }

    if (enviando) {
        return conn.reply(m.chat, `⚠️ *Transmisión en curso, Proxy ${name}.* Ya estoy procesando una solicitud. Espera un momento antes de enviar otra.`, m, { contextInfo, quoted: m });
    }
    
    enviando = true; // Activar el flag de envío

    try {
        m.react('🔄'); // Reacción de procesamiento
        conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción de X/Twitter, Proxy ${name}.* Aguarda, la carga visual está siendo procesada.`, m, { contextInfo, quoted: m });

        const apiResponse = await axios.get(`https://delirius-apiofc.vercel.app/download/twitterdl?url=${args[0]}`);
        const res = apiResponse.data;

        if (!res || !res.media || res.media.length === 0) {
            enviando = false;
            await m.react('❌'); // Reacción de error
            throw `❌ *Carga visual fallida, Proxy ${name}.*\nNo se pudo obtener el contenido de X/Twitter o el enlace no es válido.`;
        }

        // Determinar el tipo y URL del medio
        const mediaUrl = res.media[0].url;
        const mediaType = res.type;
        const originalUrl = args[0]; // La URL original proporcionada por el usuario

        const caption = `
╭━━━━[ 𝚇/𝚃𝚠𝚒𝚝𝚝𝚎𝚛 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝚅𝚒𝚜𝚞𝚊𝚕 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
${mediaType === 'video' ? '📹' : '🖼️'} *Tipo de Contenido:* ${mediaType === 'video' ? 'Video' : 'Imagen'}
${res.caption ? `📝 *Manifiesto de Carga:* ${res.caption}\n` : ''}🔗 *Enlace de Origen:* ${originalUrl}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption: caption }, { quoted: m });
        } else if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption: caption }, { quoted: m });
        } else {
             enviando = false;
             await m.react('❌'); // Reacción de error
             throw `⚠️ *Formato de Contenido Desconocido, Proxy ${name}.*\nEl tipo de archivo de X/Twitter no pudo ser identificado.`;
        }

        enviando = false; // Desactivar el flag de envío
        await m.react('✅'); // Reacción de éxito

    } catch (error) {
        enviando = false; // Asegurar que el flag se resetee en caso de error
        console.error("Error al procesar X/Twitter:", error);
        await m.react('❌'); // Reacción de error
        conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación de X/Twitter, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${error.message || error}`, m, { contextInfo, quoted: m });
    }
};

handler.help = ['twitter <url>'];
handler.tags = ['dl'];
handler.command = ['x', 'xdl', 'dlx', 'twdl', 'tw', 'twt', 'twitter'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;
