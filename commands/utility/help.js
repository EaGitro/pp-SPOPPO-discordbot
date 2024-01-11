const { SlashCommandBuilder } = require('discord.js');

const igyoEmoji = "<:igyo:1097381858938994748>"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Spoppoの説明をします🐦'),
        
    async execute(interaction) {
        await interaction.reply(`
        Spoppo ゲーム説明\n\nSpoppoとは:\n最初にゴールとして設定した数値ピッタリを目指して得点を競い合うゲーム。\n
        \nあそびかた:\n1. プレイヤーの中から質問者と回答者が決められるので質問者は回答者に0以上の数値で答えられる質問をする。\n2. 回答者が答えた数値が質問者の得点となる。\n以上を繰り返し、得点がゴール値に最も近づいた人の勝利。\nただし、プレイヤーの得点がゴール値を上回ってしまった場合そのプレイヤーは脱落となる。\n
        \nその他ルール:\n回答者は質問者の質問の変更を要請することができる。\nプレイヤーは「stop」と言うことで以降の質問者のターンをスキップすることができ、得点をそこで止めておくことができる。\n
        \n全プレイヤーが脱落orストップorゴール値ピッタリの状態になったときゲームは終了となり、ランキングが発表される。
        `);
    },
};