import yts from 'yt-search'

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

var handler = async (m, { text, conn, args, command, usedPrefix }) => {
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
            thumbnail: global.icono, // Ensure 'icons' and 'redes' are globally defined
            sourceUrl: global.redes,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (!text) {
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito un término de búsqueda para iniciar el barrido en YouTube.`, m, { contextInfo, quoted: m });
    }

    conn.reply(m.chat, `🔄 *Iniciando protocolo de barrido en YouTube, Proxy ${name}.* Aguarda, la carga de datos está siendo procesada.`, m, { contextInfo, quoted: m });
    await m.react('🔄'); // Processing reaction

    try {
        let results = await yts(text);
        let videos = results.videos; // Use results.videos for video specific results

        if (!videos || videos.length === 0) {
            await m.react('❌'); // Error reaction
            return conn.reply(m.chat, `❌ *Carga de datos fallida, Proxy ${name}.*\nNo se encontraron videos para "${text}". Verifica el término de búsqueda.`, m, { contextInfo, quoted: m });
        }

        // Filter out non-video results and format the output
        let teks = videos.map(v => {
            return `
╭━━━━[ 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜 𝚅𝚒𝚜𝚞𝚊𝚕𝚎𝚜 ]━━━━⬣
📹 *Título:* ${v.title}
👤 *Canal:* ${v.author.name}
⏱️ *Duración:* ${v.timestamp}
🗓️ *Publicado:* ${v.ago}
👁️ *Vistas:* ${v.views.toLocaleString()}
🔗 *Enlace:* ${v.url}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;
        }).join('\n\n••••••••••••••••••••••••••••••••••••\n\n');

        // Send the first video's thumbnail with the formatted text
        // Ensure fkontak is defined globally if used for contact card
        await conn.sendFile(m.chat, videos[0].thumbnail, 'yts.jpeg', teks, m, false, { contextInfo });
        await m.react('✅'); // Success reaction

    } catch (error) {
        console.error("Error al procesar YouTube search:", error);
        await m.react('❌'); // Error reaction
        conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación de YouTube, Proxy ${name}.*\nNo pude completar la búsqueda. Verifica el término o informa del error.\nDetalles: ${error.message}`, m, { contextInfo, quoted: m });
    }
}

handler.help = ['ytsearch <búsqueda>'];
handler.tags = ['buscador'];
handler.command = ['ytbuscar', 'ytsearch', 'yts'];
handler.register = true;
handler.coin = 1;

export default handler;
