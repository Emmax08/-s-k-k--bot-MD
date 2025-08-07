let handler = async (m, { conn, participants, usedPrefix, command }) => {
    // Check if a message is quoted for deletion
    if (!m.quoted) {
        return conn.reply(m.chat, `${emoji} Por favor, cita el mensaje que deseas eliminar y cuyo remitente deseas expulsar.`, m);
    }

    let userToKick = m.quoted.sender; // The sender of the quoted message

    // --- Kick Logic ---
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'; // Assuming global.owner is defined

    if (userToKick === conn.user.jid) {
        return conn.reply(m.chat, `${emoji2} No puedo eliminar el bot del grupo.`, m);
    }
    if (userToKick === ownerGroup) {
        return conn.reply(m.chat, `${emoji2} No puedo eliminar al propietario del grupo.`, m);
    }
    if (userToKick === ownerBot) {
        return conn.reply(m.chat, `${emoji2} No puedo eliminar al propietario del bot.`, m);
    }

    // --- Delete Logic ---
    try {
        let delet = m.message.extendedTextMessage.contextInfo.participant;
        let bang = m.message.extendedTextMessage.contextInfo.stanzaId;
        // Attempt to delete message properly (as an admin)
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }});
    } catch (e) {
        // Fallback for older message types or if direct deletion fails
        await conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
    }

    // --- Perform Kick ---
    await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove');
    conn.reply(m.chat, `¡Mensaje eliminado y usuario expulsado!`, m); // Confirmation message
};

handler.help = ['kickdel'];
handler.tags = ['grupo'];
handler.command = ['kickdel'];
handler.group = true;       // Command only works in groups
handler.admin = true;       // Only group admins can use
handler.botAdmin = true;    // Bot must be a group admin

export default handler;
