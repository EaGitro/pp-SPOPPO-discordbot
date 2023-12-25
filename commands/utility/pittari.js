const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
let target_list_copy = [];
let GOAL = 0;

// 配列をシャッフルする関数
function shuffle(array) {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

// シャッフルされた配列が元の配列と同じ順序でないかチェックする関数
function isValidOrder(original, shuffled) {
    for (let i = 0; i < original.length; i++) {
      if (original[i] === shuffled[i]) {
        return false;
      }
    }
    return true;
}

// 質問順リストを生成する関数
function question_order_list_generator(target_list) {
    if (target_list.length === 1) {
        if (target_list_copy.includes(target_list[0])) target_list_copy.splice(target_list_copy.indexOf(target_list[0]), 1);
        let questionOrder = [];
        questionOrder.push({
            questioner: target_list[0],
            responder: shuffle(target_list_copy)[0]
        });
        return questionOrder;
    }

    let shuffledList = shuffle(target_list);
  
    while (!isValidOrder(target_list, shuffledList)) {
      shuffledList = shuffle(target_list);
    }
  
    let questionOrder = [];
  
    for (let i = 0; i < target_list.length; i++) {
      questionOrder.push({
        questioner: target_list[i],
        responder: shuffledList[i]
      });
    }
  
    return questionOrder;
}

// 結果発表の処理
// 課題：順位の表示、ランキング順に表示
function result(interaction, client, target_scores) {
    let safe_list = [];
    let dobon_list = []; // ドボンの人達
    for (let key in target_scores) {
        if (target_scores[key] <= GOAL) { // ゴール値以下
            safe_list.push(`${key}：${target_scores[key]}`);
        } else { // ゴール値より大きい(ドボン)
            dobon_list.push(`${key}：${target_scores[key]}`);
        }
    }
    
    interaction.followUp({
        content: `ゲーム終了！\n結果発表！！！\n\nピッタリランキング：\n${safe_list.join('\n')}\n\nドボンランキング：\n${dobon_list.join('\n')}\n\nお疲れ様でした🐦`
    });

    return client.destroy();
}

// ゲーム本編の処理関数 ------------------------------------------------------------------------
// 課題：ピッタリの時の処理、みんなの得点の表示(embed?)
function game_start(interaction, client, GOAL, target_list, target_scores) {
    let questionOrder = question_order_list_generator(target_list); // 質問順を格納
    let order = 0; // 次に参照する質問順のインデックス
    interaction.followUp({
        content: `${questionOrder[order].questioner}は${questionOrder[order].responder}に質問してください！\n質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！`
    });

    client.on('messageCreate', async message => {
        if (isFinite(message.content)) { // 回答者が数値を入力した時に発火  && message.member.displayName === questionOrder[order].questioner
            target_scores[questionOrder[order].questioner] += Number(message.content);
            await message.channel.send(`${questionOrder[order].questioner}は${message.content}ポイント獲得！(現在の得点：${target_scores[questionOrder[order].questioner]})`);
            if (target_scores[questionOrder[order].questioner] > GOAL) { // ドボンした時
                interaction.followUp({
                    content: `${questionOrder[order].questioner}はドボンです！(最終得点：${target_scores[questionOrder[order].questioner]})`
                });
                target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);
            } else if (target_scores[questionOrder[order].questioner] === GOAL) { // ピッタリだった時！
                interaction.followUp({
                    content: `${questionOrder[order].questioner}はなんとピッタリです！(最終得点：${target_scores[questionOrder[order].questioner]})`
                });
                target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);
            }
            
            if (target_list.length === 0) { // 最後の一人がstopした時
                result(interaction, client, target_scores);
            } else if (order < target_list.length-1) { // まだ順番が回っていない人がいる時
                order++;
                interaction.followUp({
                    content: `${questionOrder[order].questioner}は${questionOrder[order].responder}に質問してください！\n質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！`
                });
            } else { // 順番が最後まで到達した時
                questionOrder = question_order_list_generator(target_list);
                order = 0;
                interaction.followUp({
                    content: `${questionOrder[order].questioner}は${questionOrder[order].responder}に質問してください！\n質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！`
                });
            }
        } else if (message.content === 'stop') { // 回答者が回答から離脱(stop)した時
            target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);
            await message.channel.send(`ここで${questionOrder[order].questioner}のカウントストップ！(最終得点：${target_scores[questionOrder[order].questioner]})`);
            if (target_list.length === 0) { // 最後の一人がstopした時
                result(interaction, client, target_scores);
                return client.destroy();
            } else if (order < target_list.length-1) { // まだ順番が回っていない人がいる時
                order++;
                interaction.followUp({
                    content: `${questionOrder[order].questioner}は${questionOrder[order].responder}に質問してください！\n質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！`
                });
            } else { // 順番が最後まで到達した時
                questionOrder = question_order_list_generator(target_list);
                order = 0;
                interaction.followUp({
                    content: `${questionOrder[order].questioner}は${questionOrder[order].responder}に質問してください！\n質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！`
                });
            }
        }
    });
}


// Bot全体のスラッシュコマンド処理コード ------------------------------------------------------------------------
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pittari')
        .setDescription('何とピッタリゲームを始める🐦')
        .addIntegerOption(option => option
            .setName('ピッタリゴール')
            .setDescription('ピッタリを目指す数値')
            .setRequired(true)
        ),

    async execute(interaction, client) {
        // 参加者を募集する ------------------------------------------------------------------------
        const target_list = ["Tanaka Kumi", "Kato Ken"];
        const target_scores = {};
        GOAL = interaction.options.getInteger("ピッタリゴール");

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
                    if (interaction.member.displayName !== i.user.displayName) { // 主催者と押した人が一致しない
                        await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n**確認の為、主催者の方が開始ボタンを押してください！**\n\n${i.user.displayName}が離脱しました(参加人数:${target_list.length})`, components: [row] });
                    } else if (target_list.length >= 2) { // ユーザーの参加人数が2人以上
                        // ゲーム本編の処理に移行する
                        await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\nゲームを開始します！(参加人数:${target_list.length})`});
                        target_list_copy = [...target_list];
                        for(const target of target_list) target_scores[target] = 0;
                        game_start(interaction, client, GOAL, target_list, target_scores);
                        return;
                    } else { // 参加者不十分
                        await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n**参加人数が足りません！(最低2人)**\n\n${i.user.displayName}が離脱しました(参加人数:${target_list.length})`, components: [row] });
                    }
                } else if (i.customId === 'clear') {
                    target_list.splice(0); // 要素を全削除
                    await i.update({ content: `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！\n\n参加者を一旦クリアします！(参加人数:${target_list.length})`, components: [row] });
                }
            } catch (e) {
                await i.update({ content: e });
            }
        });

        // 数値が入力された時の挙動
        // 数値の型判定：https://qiita.com/taku-0728/items/329e0bee1c49b7ce7cd1
        // 
        // client.on('messageCreate', async message => {
        //     if (isFinite(message.content) && target_scores.length !== 0) {
        //         await message.channel.send(`${message.content} が送信されました`);
        //     }
        // });
    },
};