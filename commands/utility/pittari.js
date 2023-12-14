const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pittari')
        .setDescription('何とピッタリゲームを始める'),
    async execute(interaction) {
        await interaction.reply(`
            何とピッタリゲームを始めます！\nゲーム説明：\nあなたは、ハトです🐦
        `);
    },
};