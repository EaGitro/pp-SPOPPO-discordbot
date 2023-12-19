const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pittari')
        .setDescription('何とピッタリゲームを始める🐦'),
    async execute(interaction) {
        // const target = interaction.options.getUser('target');
        const target_list = [];

		const add_button = new ButtonBuilder()
			.setCustomId('add')
			.setLabel('参加する')
			.setStyle(ButtonStyle.Success);

		const delete_button = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('離脱する')
			.setStyle(ButtonStyle.Danger);

        const start_button = new ButtonBuilder()
			.setCustomId('start')
			.setLabel('ゲーム開始！')
			.setStyle(ButtonStyle.Primary);

        const clear_button = new ButtonBuilder()
			.setCustomId('clear')
			.setLabel('参加者をクリアする')
			.setStyle(ButtonStyle.Secondary);


		const row = new ActionRowBuilder()
			.addComponents(add_button, delete_button, start_button, clear_button);

        
        // 最初の宣言の設定
        const response = await interaction.reply({
            content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！`,
            components: [row],
        });
        const collector = await response.createMessageComponentCollector({ componentType: ComponentType.Button, max: 810, time: 60_000 }); // maxはハト(810)です🐦

		
        // 処理コード(イベント:collectの処理を発動する)
        collector.on('collect', async i => {
            try {
                if (i.customId === 'add') {
                    if (target_list.indexOf(i.user.displayName) === -1) target_list.push(i.user.displayName); // 重複チェック→既にあったら入れない
                    await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n${i.user.displayName}が参加しました(参加人数:${target_list.length})`, components: [row] });
                } else if (i.customId === 'cancel') {
                    target_list.splice(target_list.indexOf(i.user.displayName), 1); // 押した人の名前のみピンポイントで消す
                    await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n${i.user.displayName}が離脱しました(参加人数:${target_list.length})`, components: [row] });
                } else if (i.customId === 'start') {
                    await i.update({ content: 'ゲームを開始します！', components: [] });
                } else if (i.customId === 'clear') {
                    target_list.splice(0); // 要素を全削除
                    await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n参加者を一旦クリアします！(参加人数:${target_list.length})`, components: [row] });
                }
            } catch (e) {
                await i.update({ content: e, components: [] });
            }
        });
    },
};