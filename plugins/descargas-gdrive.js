import fg from 'api-dylux'; // Asegúrate de que 'api-dylux' esté correctamente instalado

// --- Constantes y Configuración de Transmisión (Estilo Ellen Joe) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

let free = 100; // Límite para usuarios estándar en MB
let prem = 500; // Límite para usuarios premium/propietarios en MB

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems }) => {
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

    if (!args[0]) {
        return conn.reply(
            m.chat,
            `🦈 *Rastro frío, Proxy ${name}.* Necesito un identificador de archivo de Google Drive para proceder.\n\n_Ejemplo: ${usedPrefix + command} [tu_enlace_GoogleDrive_aquí]_`,
            m,
            { contextInfo, quoted: m }
        );
    }

    m.react('🔄'); // Reacción de procesamiento

    try {
        let res = await fg.GDriveDl(args[0]);

        // Convertir límites a bytes para comparación
        let limitBytes = (isPrems || isOwner ? prem : free) * 1024 * 1024;
        let isLimit = limitBytes < res.fileSizeB;

        // Formatear tamaño del archivo para el mensaje
        const formattedFileSize = formatBytes(res.fileSizeB);

        let responseCaption = `
╭━━━━[ 𝙶𝚘𝚘𝚐𝚕𝚎 𝙳𝚛𝚒𝚟𝚎 𝙳𝚎𝚌𝚘𝚍𝚎𝚍 ]━━━━⬣
📦 *Designación de Archivo:* ${res.fileName}
📏 *Tamaño de Carga:* ${formattedFileSize}
`;

        if (isLimit) {
            const currentLimitMB = isPrems || isOwner ? prem : free;
            responseCaption += `⚠️ *Alerta: Límite de transmisión excedido.*
        *Su límite:* ${currentLimitMB}MB
        *Tamaño del archivo:* ${formattedFileSize}
        _Solo Proxys con autorización de Nivel Élite pueden acceder a cargas más grandes._
        `;
        }

        responseCaption += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.reply(m.chat, responseCaption, m, { contextInfo, quoted: m });

        if (!isLimit) {
            await conn.sendMessage(m.chat, {
                document: { url: res.downloadUrl },
                fileName: res.fileName,
                mimetype: res.mimetype
            }, { quoted: m });
            m.react('✅'); // Reacción de éxito
        } else {
            // Si el archivo excede el límite, aún se puede informar al usuario.
            m.react('❌'); // Reacción de fallo por límite
        }

    } catch (error) {
        console.error("Error al procesar Google Drive:", error);
        conn.reply(
            m.chat,
            `❌ *Anomalía crítica, Proxy ${name}.*\nNo pude asegurar la carga desde Google Drive. Verifica el enlace o intenta de nuevo.\nDetalles: ${error.message}`,
            m,
            { contextInfo, quoted: m }
        );
        m.react('❌'); // Reacción de fallo general
    }
}

handler.help = ['gdrive'].map(v => v + ' <link>');
handler.tags = ['descargas'];
handler.command = ['gdrive', 'drive'];
handler.group = true;
handler.register = true;
handler.coin = 5;

export default handler;

// Función para formatear bytes, si no está ya definida en otro lugar
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
