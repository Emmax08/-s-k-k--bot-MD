import fetch from 'node-fetch';
import yts from 'yt-search'; // Not used in the original logic, but kept if other parts of your bot use it.

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
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un video de TikTok para extraer su audio.`, m, { contextInfo, quoted: m });
    }

    conn.sendMessage(m.chat, { react: { text: "🔄", key: m.key } }); // Changed emoji to '🔄' for consistency
    conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción de audio de TikTok, Proxy ${name}.* Aguarda, el flujo de datos está siendo procesado.`, m, { contextInfo, quoted: m });

    try {
        let resApi = await fetch(`https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(text)}`);

        if (!resApi.ok) {
            await m.react('❌'); // Error reaction
            throw `❌ *Fallo en la transmisión de datos, Proxy ${name}.*\nCódigo de estado de la API: ${resApi.status}.`;
        }

        let dp = await resApi.json();

        if (!dp.results || !dp.results.audio) {
            await m.react('❌'); // Error reaction
            throw `❌ *Carga de audio fallida, Proxy ${name}.*\nNo se pudo obtener el audio del enlace de TikTok. Verifica la URL.`;
        }

        const audioUrl = dp.results.audio;
        const videoTitle = dp.results.title || 'Audio de TikTok';
        const thumbnailUrl = dp.results.thumbnail;

        // Fetch thumbnail buffer for externalAdReply
        let thumbnailBuffer = null;
        if (thumbnailUrl) {
            try {
                thumbnailBuffer = (await conn.getFile(thumbnailUrl)).data;
            } catch (thumbError) {
                console.error('Error al obtener la miniatura:', thumbError);
                // Continue without thumbnail if it fails
            }
        }

        const doc = {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            fileName: `${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`, // Sanitize filename
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2, // Audio type
                    mediaUrl: text, // Link to the original TikTok video
                    title: `🎵 ${videoTitle}`, // Title of the audio/video
                    body: `Extraído por Ellen Joe's Service`, // Custom body
                    sourceUrl: text, // Source of the original content
                    thumbnail: thumbnailBuffer // Use the fetched thumbnail buffer
                }
            }
        };

        await conn.sendMessage(m.chat, doc, { quoted: m });
        await m.react('✅'); // Success reaction

    } catch (error) {
        console.error("Error al procesar TikTok MP3:", error);
        await m.react('❌'); // Error reaction
        conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación de TikTok MP3, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${error.message}`, m, { contextInfo, quoted: m });
    }
};

handler.help = ['tiktokmp3 <url>'];
handler.tags = ['dl'];
handler.command = ['tiktokmp3', 'ttmp3'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;
