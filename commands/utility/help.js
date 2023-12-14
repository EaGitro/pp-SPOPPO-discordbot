const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Spoppoの説明をします🐦'),
        
    async execute(interaction) {
        await interaction.reply(`
        Spoppo ゲーム説明：\n\n1. 最初に参加プレイヤーを決定する\n2. 順番をランダムで決める\n3. 最初に宣言するゴール値を代表プレイヤーに決めさせる\n4. 順番①から順番②の人に、回答が0以上の整数となる質問をし、回答してもらう。この時、回答者は質問の変更を要請することができ、その場合は質問がやり直しとなる\n5. 回答者から回答をもらったら、その数値を自分の得点とする\n6. 手順4,5を繰り返して、手順3で決めたゴールに最も近づいた人が優勝する。ただし、ゴールに近い得点を得た人は任意のタイミングで質問権をストップさせることができ、以降の順番が来ても回答しないでおくことができる\n7. もし得点が手順3のゴール値を超えてしまった場合、その人はゲーム脱落となる
        `);
    },
};