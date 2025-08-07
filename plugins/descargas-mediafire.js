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
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un archivo de MediaFire para iniciar la extracción.`, m, { contextInfo, quoted: m });
    }

    conn.sendMessage(m.chat, { react: { text: "🔄", key: m.key } }); // Changed emoji to '🔄' for consistency
    conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción MediaFire, Proxy ${name}.* Aguarda, la carga de datos está siendo procesada.`, m, { contextInfo, quoted: m });

    try {
        let res = await fetch(`https://api.agatz.xyz/api/mediafire?url=${text}`);

        if (!res.ok) {
            await m.react('❌'); // Error reaction
            throw `❌ *Fallo en la transmisión de datos, Proxy ${name}.*\nCódigo de estado de la API: ${res.status}.`;
        }

        let json = await res.json();

        // Check if data is available and not empty
        if (!json.data || json.data.length === 0 || !json.data[0].link) {
            await m.react('❌'); // Error reaction
            throw `❌ *Carga de datos fallida, Proxy ${name}.*\nNo se pudo obtener el contenido de MediaFire o el enlace no es válido.`;
        }

        const fileData = json.data[0];

        const caption = `
╭━━━━[ 𝙼𝚎𝚍𝚒𝚊𝙵𝚒𝚛𝚎 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
📦 *Designación de Archivo:* ${fileData.nama}
⚖️ *Tamaño de Carga:* ${fileData.size}
📂 *Tipo de Contenido:* ${fileData.mime}
🔗 *Enlace de Origen:* ${text}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;
        // Assuming 'dev' is a variable for developer info, include if defined
        if (typeof dev !== 'undefined') {
            caption += `\n\n> ${dev}`;
        }

        await conn.sendFile(m.chat, fileData.link, fileData.nama, caption, m);
        await m.react('✅'); // Success reaction

    } catch (error) {
        console.error("Error al procesar MediaFire:", error);
        await m.react('❌'); // Error reaction
        conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación MediaFire, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${error.message}`, m, { contextInfo, quoted: m });
    }
}

handler.help = ['mediafire <url>'];
handler.tags = ['descargas'];
handler.command = ['mf', 'mediafire'];
handler.coin = 10;
handler.register = true;
handler.group = true;

export default handler;
