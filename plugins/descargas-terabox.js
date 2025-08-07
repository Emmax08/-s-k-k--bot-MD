import axios from 'axios';
import fetch from 'node-fetch'; // Required for getBuffer in some setups if axios is not used for all fetches

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
    return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un archivo de Terabox para iniciar la extracción.`, m, { contextInfo, quoted: m });
  }

  m.react('🔄'); // Processing reaction
  conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción Terabox, Proxy ${name}.* Aguarda, la carga de datos está siendo procesada.`, m, { contextInfo, quoted: m });

  try {
    const result = await terabox(text);

    if (!result || result.length === 0) {
      await m.react('❌'); // Error reaction
      return conn.reply(m.chat, `❌ *Carga de datos fallida, Proxy ${name}.*\nNo se encontraron archivos válidos en la URL proporcionada. Verifica el enlace.`, m, { contextInfo, quoted: m });
    }

    for (let i = 0; i < result.length; i++) {
      const { fileName, type, thumb, url } = result[i];

      if (!fileName || !url) {
        console.error('Error: Datos del archivo Terabox incompletos', { fileName, url });
        conn.reply(m.chat, `⚠️ *Anomalía de datos, Proxy ${name}.*\nUn archivo de la lista no pudo ser procesado correctamente (nombre o URL faltante).`, m, { contextInfo, quoted: m });
        continue;
      }

      const caption = `
╭━━━━[ 𝚃𝚎𝚛𝚊𝚋𝚘𝚡 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝙲𝚊𝚛𝚐𝚊 𝙰𝚜𝚎𝚐𝚞𝚛𝚊𝚍𝚊 ]━━━━⬣
📄 *Designación de Archivo:* ${fileName}
📂 *Formato de Contenido:* ${type || 'Desconocido'}
🔗 *Enlace de Origen:* ${text}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

      console.log(`Intentando enviar archivo: ${fileName}, URL: ${url}`);

      try {
        await conn.sendFile(m.chat, url, fileName, caption, m, false, {
          thumbnail: thumb ? await getBuffer(thumb) : null // Ensure getBuffer is defined or imported
        });
        await m.react('✅'); // React to each successful file send
      } catch (fileSendError) {
        console.error(`Error al enviar el archivo "${fileName}":`, fileSendError);
        conn.reply(m.chat, `❌ *Fallo en la transmisión de archivo, Proxy ${name}.*\nNo pude enviar "${fileName}". Detalles: ${fileSendError.message}.`, m, { contextInfo, quoted: m });
        await m.react('❌'); // React to each failed file send
      }
    }
  } catch (err) {
    console.error('Error general al descargar Terabox:', err);
    await m.react('❌'); // React to general failure
    conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación Terabox, Proxy ${name}.*\nNo pude completar la extracción. Verifica el enlace o informa del error.\nDetalles: ${err.message || err}`, m, { contextInfo, quoted: m });
  }
};

handler.help = ["terabox *<url>*"];
handler.tags = ["dl"];
handler.command = ['terabox', 'tb'];
handler.group = true;
handler.register = true;
handler.coin = 5;

export default handler;

// --- Funciones Auxiliares ---

async function terabox(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const response1 = await axios.post('https://teradl-api.dapuntaratya.com/generate_file', {
        mode: 1,
        url: url
      });

      const data1 = response1.data;
      if (!data1.list || data1.list.length === 0) {
        return reject(new Error('No se encontraron archivos en la respuesta inicial.'));
      }

      const array = [];
      for (const x of data1.list) {
        try {
          const response2 = await axios.post('https://teradl-api.dapuntaratya.com/generate_link', {
            js_token: data1.js_token,
            cookie: data1.cookie,
            sign: data1.sign,
            timestamp: data1.timestamp,
            shareid: data1.shareid,
            uk: data1.uk,
            fs_id: x.fs_id
          });

          const dl = response2.data;

          if (!dl.download_link || !dl.download_link.url_1) {
            console.error('Error: Enlace de descarga no encontrado para:', x.name, dl);
            continue; // Skip this file but continue with others
          }

          array.push({
            fileName: x.name,
            type: x.type,
            thumb: x.image,
            url: dl.download_link.url_1
          });
        } catch (innerError) {
          console.error(`Error al generar enlace para ${x.name}:`, innerError.response ? innerError.response.data : innerError.message);
          // Don't reject the whole promise, just skip this file
        }
      }
      resolve(array);
    } catch (e) {
      console.error('Error en la API Terabox (general):', e.response ? e.response.data : e.message);
      reject(new Error(`Fallo en la comunicación con la API de Terabox: ${e.response ? JSON.stringify(e.response.data) : e.message}`));
    }
  });
}

// Helper function to get buffer (remains the same)
async function getBuffer(url) {
  try {
    const res = await axios({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    console.error('Error al obtener el buffer de la miniatura:', err);
    return null;
  }
}
