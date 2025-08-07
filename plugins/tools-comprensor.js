import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`❌ *Responde a una imagen o envía una imagen con el comando* _.comprimir_`);
  }

  try {
    const media = await q.download();
    const inputPath = path.join('./temp', `${Date.now()}_input.jpg`);
    const outputPath = path.join('./temp', `${Date.now()}_compressed.jpg`);

    // Asegura carpeta temporal
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    // Guardar imagen original
    fs.writeFileSync(inputPath, media);

    // Comprimir con Sharp
    await sharp(inputPath)
      .jpeg({ quality: 20 }) // Puedes ajustar la calidad aquí
      .toFile(outputPath);

    // Enviar imagen comprimida
    await conn.sendFile(
      m.chat,
      outputPath,
      'comprimida.jpg',
      `🎯 *¡Imagen comprimida!*\n✨ *Calidad optimizada con éxito*\n🔧 *by 🦈Ellen Joe Bot🦈*`,
      m
    );

    // Eliminar archivos temporales
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error(err);
    m.reply(`❌ *Ocurrió un error al intentar comprimir la imagen.*\n\n🪵 *Error:* ${err.message}`);
  }
};

handler.help = ['comprimir'];
handler.tags = ['herramientas'];
handler.command =  ['compress', 'comprimir']

export default handler;
