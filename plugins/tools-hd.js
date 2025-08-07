import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const rwait = "⏳";  // Emoji espera
const done = "✅";   // Emoji listo
const error = "❌";  // Emoji error
const emoji = "❕";  // Emoji info
const ellen = "🦈 Ellen Joe aquí... *ugh* que flojera~";

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : null;
  if (!q) return conn.reply(m.chat, `${ellen}\n${emoji} ¿Me haces trabajar sin darme una imagen? No, gracias… responde a una imagen primero.`, m);
  let mime = (q.msg || q).mimetype || '';
  if (!mime || !mime.startsWith("image/")) return conn.reply(m.chat, `${ellen}\n${emoji} Eso no es una imagen… ¿acaso me quieres ver bostezar?`, m);

  await m.react(rwait);

  try {
    let media = await q.download();
    if (!media || media.length === 0) throw new Error("Ni siquiera puedo descargar eso…");

    let urlCatbox = await catbox(media);
    if (!urlCatbox || !urlCatbox.startsWith("http")) throw new Error("El servidor está de flojera como yo… no pude subir la imagen.");

    let apiUpscaleUrl = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(urlCatbox)}&apikey=stellar-o7UYR5SC`;

    let resUpscale = await fetch(apiUpscaleUrl);
    if (!resUpscale.ok) throw new Error("La API de HD se rindió, igual que yo después de 5 minutos de esfuerzo.");

    let bufferHD = Buffer.from(await resUpscale.arrayBuffer());

    let textoEllen = `
🦈 *Listo… aquí tienes tu imagen en HD...*
> Aunque sinceramente, no sé por qué me haces gastar energía en esto…
> Supongo que ahora puedes ver cada pixel, feliz, ¿no?

💤 *Ahora… ¿puedo volver a mi siesta?*
`;

    await conn.sendMessage(m.chat, {
      image: bufferHD,
      caption: textoEllen.trim()
    }, { quoted: m });

    await m.react(done);
  } catch (e) {
    console.error(e);
    await m.react(error);
    return conn.reply(m.chat, `${ellen}\n⚠️ Algo salió mal… y no, no fue mi culpa… probablemente.\n\n*Error:* ${e.message}`, m);
  }
};

handler.help = ['hd'];
handler.tags = ['ai'];
handler.command = ['hd'];
export default handler;