import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(" ");
  if (!text) {
    return conn.reply(m.chat, `⚠️ *Tienes que escribir el nombre del anime a buscar.*\n\n*Ejemplo:* ${usedPrefix + command} kimetsu no yaiba`, m);
  }

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=5`);
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      return conn.reply(m.chat, `❌ *No se encontraron resultados para:* ${text}`, m);
    }

    for (let anime of json.data) {
      let title = anime.title || 'Título desconocido';
      let url = anime.url || '';
      let image = anime.images?.jpg?.image_url || '';
      let synopsis = anime.synopsis || 'Sin descripción.';
      let type = anime.type || 'Desconocido';
      let episodes = anime.episodes || '???';
      let score = anime.score || 'N/A';

      let caption = `🎌 *${title}*\n\n📺 Tipo: ${type}\n🎞️ Episodios: ${episodes}\n⭐ Puntuación: ${score}\n\n📝 ${synopsis}\n\n🌐 ${url}`;

      await conn.sendMessage(m.chat, {
        image: { url: image },
        caption,
        footer: '🔍 Resultados de búsqueda Anime',
        buttons: [
          {
            buttonId: `${usedPrefix}animeinfo ${url}`,
            buttonText: { displayText: '📘 Info Detallada' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m });

      await new Promise(resolve => setTimeout(resolve, 1000)); // espera un poco para no hacer flood
    }

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `❌ *Ocurrió un error al buscar el anime.*\n\nDetalles: ${e.message}`, m);
  }
};

handler.command = ['animes']
handler.help = ['animesearch <nombre>'];
handler.tags = ['anime'];

export default handler;