import axios from 'axios';
// Destructuring generateWAMessageContent, generateWAMessageFromContent, proto directly from baileys
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import("@whiskeysockets/baileys"))["default"];

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
    return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito un término de búsqueda para localizar imágenes en Pinterest.`, m, { contextInfo, quoted: m });
  }

  await m.react('🔄'); // Processing reaction
  conn.reply(m.chat, `🔄 *Iniciando protocolo de barrido en Pinterest, Proxy ${name}.* Aguarda, la carga visual está siendo procesada.`, m, { contextInfo, quoted: m });

  async function getImageMessage(imageUrl) {
    const { imageMessage } = await generateWAMessageContent({
      'image': { 'url': imageUrl }
    }, { 'upload': conn.waUploadToServer });
    return imageMessage;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    let { data: apiResponse } = await axios.get(
      `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(text)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(text)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`
    );

    let imageUrls = apiResponse.resource_response.data.results.map(item => item.images.orig.url);
    shuffleArray(imageUrls); // Shuffle the results
    let selectedImages = imageUrls.splice(0, 5); // Take up to 5 images

    if (selectedImages.length === 0) {
      await m.react('❌'); // Error reaction
      return conn.reply(m.chat, `❌ *Carga visual fallida, Proxy ${name}.*\nNo se encontraron imágenes en Pinterest para "${text}".`, m, { contextInfo, quoted: m });
    }

    let carouselCards = [];
    let imageCounter = 1;

    for (let imageUrl of selectedImages) {
      carouselCards.push({
        'body': proto.Message.InteractiveMessage.Body.fromObject({
          'text': `Imagen de ${text} - ${imageCounter++}`
        }),
        'footer': proto.Message.InteractiveMessage.Footer.fromObject({
          'text': `Procesado por Ellen Joe's Service` // Custom footer
        }),
        'header': proto.Message.InteractiveMessage.Header.fromObject({
          'title': '',
          'hasMediaAttachment': true,
          'imageMessage': await getImageMessage(imageUrl)
        }),
        'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          'buttons': [{
            'name': "cta_url",
            'buttonParamsJson': JSON.stringify({
              "display_text": "Ver en Pinterest 🔗",
              "url": `https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}`,
              "merchant_url": `https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}`
            })
          }]
        })
      });
    }

    const carouselMessage = generateWAMessageFromContent(m.chat, {
      'viewOnceMessage': {
        'message': {
          'messageContextInfo': {
            'deviceListMetadata': {},
            'deviceListMetadataVersion': 2
          },
          'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
            'body': proto.Message.InteractiveMessage.Body.create({
              'text': `╭━━━━[ 𝙿𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝 𝙳𝚎𝚌𝚘𝚍𝚎𝚍: 𝚁𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜 𝚅𝚒𝚜𝚞𝚊𝚕𝚎𝚜 ]━━━━⬣\n🖼️ *Término de Búsqueda:* ${text}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
            }),
            'footer': proto.Message.InteractiveMessage.Footer.create({
              'text': "⪛✰ Barrido de Pinterest - Ellen Joe's Service ✰⪜"
            }),
            'header': proto.Message.InteractiveMessage.Header.create({
              'hasMediaAttachment': false
            }),
            'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              'cards': carouselCards
            })
          })
        }
      }
    }, { 'quoted': m });

    await m.react('✅'); // Success reaction
    await conn.relayMessage(m.chat, carouselMessage.message, { 'messageId': carouselMessage.key.id });

  } catch (error) {
    console.error("Error al procesar Pinterest search:", error);
    await m.react('❌'); // Error reaction
    conn.reply(m.chat, `⚠️ *Anomalía crítica en la operación de Pinterest, Proxy ${name}.*\nNo pude completar la búsqueda. Verifica el término o informa del error.\nDetalles: ${error.message}`, m, { contextInfo, quoted: m });
  }
};

handler.help = ["pinterest <término>"];
handler.tags = ["descargas"];
handler.coin = 1;
handler.group = true;
handler.register = true;
handler.command = ['pinterest', 'pin'];

export default handler;
