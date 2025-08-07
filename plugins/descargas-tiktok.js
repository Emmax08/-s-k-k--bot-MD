import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏᴇ\'s 𝐒ervice';

var handler = async (m, { conn, args, usedPrefix, command }) => {
    const name = conn.getName(m.sender); // Identificando al Proxy
    const emoji = '🎶'; // Emoji para la operación de TikTok, puedes elegir otro si prefieres '🎥'

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

    if (!args[0]) {
        return conn.reply(
            m.chat,
            `${emoji} *Rastro frío, Proxy ${name}.* Necesito un identificador de TikTok para proceder.\n\n_Ejemplo: ${usedPrefix + command} [tu_enlace_TikTok_aquí]`,
            m,
            { contextInfo, quoted: m }
        );
    }

    try {
        await conn.reply(
            m.chat,
            `🔄 *Iniciando protocolo de extracción de TikTok, Proxy ${name}.* Aguarda, la transmisión está en curso.`,
            m,
            { contextInfo, quoted: m }
        );

        const tiktokData = await tiktokdl(args[0]);

        if (!tiktokData || !tiktokData.data || !tiktokData.data.play) {
            return conn.reply(
                m.chat,
                `❌ *Fallo en la extracción de TikTok, Proxy ${name}.*\nLa señal es débil o el objetivo ha sido eliminado.`,
                m,
                { contextInfo, quoted: m }
            );
        }

        const videoURL = tiktokData.data.play;
        const metadata = tiktokData.data;

        // Construir el caption con la información disponible
        const caption = `
╭━━━━[ 𝚃𝚒𝚔𝚃𝚘𝚔 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝚅𝚒𝚍𝚎𝚘 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
📹 *Designación:* ${metadata.title || 'Sin título'}
🧑‍💻 *Fuente Operacional:* ${metadata.author?.nickname || 'Desconocido'}
⏱️ *Duración del Flujo:* ${metadata.duration ? `${Math.floor(metadata.duration / 60)}m ${metadata.duration % 60}s` : 'N/A'}
❤️ *Impacto Registrado:* ${metadata.digg_count ? metadata.digg_count.toLocaleString() : 'N/A'} (Me gusta)
💬 *Comunicación Anexa:* ${metadata.comment_count ? metadata.comment_count.toLocaleString() : 'N/A'} (Comentarios)
🔗 *URL Original:* ${args[0]}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        if (videoURL) {
            await conn.sendFile(
                m.chat,
                videoURL,
                "tiktok.mp4",
                caption,
                m,
                null,
                { contextInfo, quoted: m }
            );
            m.react('✅'); // Reacción de éxito
        } else {
            return conn.reply(
                m.chat,
                `❌ *Error de Transmisión, Proxy ${name}.*\nNo se pudo obtener una URL de descarga válida.`,
                m,
                { contextInfo, quoted: m }
            );
        }
    } catch (error) { // Cambiado 'error1' a 'error' para mejor práctica
        console.error("Error al procesar TikTok:", error);
        return conn.reply(
            m.chat,
            `⚠️ *Anomalía crítica en la operación de TikTok, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${error.message}`,
            m,
            { contextInfo, quoted: m }
        );
    }
};

handler.help = ['tiktok'].map((v) => v + ' *<link>*');
handler.tags = ['descargas'];
handler.command = ['tiktok', 'tt'];
handler.group = true;
handler.register = true;
handler.coin = 2; // Mantener costo de coin
handler.limit = true; // Mantener uso de límite

export default handler;

// Función para obtener datos de TikTok (sin cambios)
async function tiktokdl(url) {
    let tikwm = `https://www.tikwm.com/api/?url=${url}&hd=1`; // Agregado &hd=1 para intentar HD
    let response = await (await fetch(tikwm)).json();
    return response;
}
