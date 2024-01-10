const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, EmbedBuilder } = require('discord.js');
let team_A_list = []; // Aチーム参加者の名前を格納する
let team_B_list = []; // Bチーム参加者の名前を格納する
let team_A_list_copy = []; // 質問者順の決定時に使うため、team_listのコピーを用意しておく
let team_B_list_copy = [];
let team_A_scores = {}; // チームのスコアを格納する
let team_B_scores = {};
let team_list = ['A', 'B'];
let GOAL = 0; // ゴール値を格納する

// 文字列を動的に生成する関数
// 参考：https://qiita.com/YOS0602/items/8eadf8f7743ebdc5946c
const format = (str, ...args) => {
    for (const [i, arg] of args.entries()) {
        const regExp = new RegExp(`\\{${i}\\}`, 'g')
        str = str.replace(regExp, arg)
    }
    return str
}

function question_order_list_generator(team_A_list, team_B_list) {
    const totalParticipants = team_A_list.length + team_B_list.length + 1;

    // ステップ1: 同じチーム内で配列のインデックス順に質問者になる順序を作成
    const team_A_order = [];
    const team_B_order = [];

    for (let i = 0; i < Math.max(team_A_list.length, team_B_list.length); i++) {
        if (i < team_A_list.length) {
            team_A_order.push(team_A_list[i]);
        }
        if (i < team_B_list.length) {
            team_B_order.push(team_B_list[i]);
        }
    }

    // ステップ2: AチームとBチームの順番がA, B, A, B...となるようにし、回答者も重複しないように生成
    let questionOrder = [];
    for (let i = 0; i < totalParticipants; i++) {
        const questioner = i % 2 === 0 ? team_A_order[i / 2 % team_A_order.length] : team_B_order[(i - 1) / 2 % team_B_order.length];

        let availableResponders;
        if (i % 2 === 0) {
            availableResponders = team_B_list.filter(member => member !== questioner);
        } else {
            availableResponders = team_A_list.filter(member => member !== questioner);
        }

        const responder = availableResponders[Math.floor(Math.random() * availableResponders.length)];

        questionOrder.push({
            questioner: questioner,
            responder: responder
        });
    }

    return questionOrder;
}

// 結果発表の処理
// 課題：順位の表示、ランキング順に表示
function result(interaction) {
    let safe_list = []; // セーフの人達
    let dobon_list = []; // ドボンの人達
    for (let key in target_scores) {
        if (target_scores[key] <= GOAL) { // ゴール値以下
            safe_list.push(`${key}：${target_scores[key]}`);
        } else { // ゴール値より大きい(ドボン)
            dobon_list.push(`${key}：${target_scores[key]}`);
        }
    }

    interaction.followUp({
        content: `ゲーム終了！\n結果発表！！！\n\nピッタリランキング\nAチーム：${team_A_scores}\nBチーム：${team_B_scores}\n\n今回の勝者は...**${"A"}チーム**です！！！！！\n\nお疲れ様でした🐦`
    });

    return;
}

// スコアボードの更新関数
function update_scoreboard() {
    let fields = [];
    for (let target_name in target_scores) {
        fields.push({ name: target_name, value: String(target_scores[target_name]), inline: true })
    }

    let scores_pre = new EmbedBuilder()
        .setTitle('Spoppo スコアボード')
        .setDescription(`現在の参加者のスコアはこちら！(ゴール：${GOAL})`)
        .addFields(fields)

    return scores_pre;
}

// ゲーム本編の処理関数 ------------------------------------------------------------------------
// 課題：みんなの得点の表示(embed?)
function game_start(interaction) {
    let questionOrder = question_order_list_generator(team_A_list, team_B_list); // 質問順を格納
    let order = 0; // 次に参照する質問順のインデックス
    let game_message = `\n[{0}チームのターン]{1}は{2}に質問してください！\n質問者は質問の回答を半角数字で送信してください！\n回答をストップする場合は「stop」を送信してください！\n`;
    let point_message = `\n{0}チームは{1}ポイント獲得！({0}チームの現在の得点：{2})\n`
    let scores = update_scoreboard();

    const responce_game = interaction.channel.send({
        content: `---------------------\n[Spoppo ゲーム中]` + format(game_message, team_list[order % team_list.length], questionOrder[order].questioner, questionOrder[order].responder),
        embeds: [scores]
    });

    // メイン処理を開始
    interaction.client.on('messageCreate', message_func);
    async function message_func(message) {
        if (isFinite(message.content)) { // 回答者が数値を入力した時に発火  && message.member.displayName === questionOrder[order].questioner
            target_scores[questionOrder[order].questioner] += Number(message.content);
            scores = update_scoreboard();
            let message_list = [`---------------------\n[Spoppo ゲーム中]\n`, format(point_message, questionOrder[order].questioner, message.content, target_scores[questionOrder[order].questioner])];

            if (target_scores[questionOrder[order].questioner] > GOAL) { // ドボンした時
                message_list.push(`**${questionOrder[order].questioner}はドボンです！(最終得点：${target_scores[questionOrder[order].questioner]})**\n`);
                if (target_list.indexOf(questionOrder[order].questioner) !== -1) target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);
            } else if (target_scores[questionOrder[order].questioner] === GOAL) { // ピッタリだった時！
                message_list.push(`**${questionOrder[order].questioner}はなんとピッタリです！(最終得点：${target_scores[questionOrder[order].questioner]})**\n`);
                if (target_list.indexOf(questionOrder[order].questioner) !== -1) target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);
            }

            if (target_list.length === 0) { // 最後の一人がドボンorピッタリの時
                message_list.push(format(game_message, questionOrder[order].questioner, questionOrder[order].responder));
                responce_game.then(msg => {
                    msg.edit({
                        content: message_list.join(``),
                        embeds: [scores]
                    });
                });
                result(interaction, target_scores, GOAL);
                interaction.client.off("messageCreate", message_func); // メイン処理を停止
            } else if (order < target_list.length - 1) { // まだ順番が回っていない人がいる時
                order++;
            } else { // 順番が最後まで到達した時
                questionOrder = question_order_list_generator(target_list);
                order = 0;
            }

            message_list.push(format(game_message, questionOrder[order].questioner, questionOrder[order].responder));
            responce_game.then(msg => {
                msg.edit({
                    content: message_list.join(``),
                    embeds: [scores]
                });
            });
        } else if (message.content === 'stop') { // 回答者が回答から離脱(stop)した時
            let message_list = [`---------------------\n[Spoppo ゲーム中]\n`, `\n**ここで${questionOrder[order].questioner}のカウントストップ！(最終得点：${target_scores[questionOrder[order].questioner]})**\n`];
            scores = update_scoreboard();
            if (target_list.indexOf(questionOrder[order].questioner) !== -1) target_list.splice(target_list.indexOf(questionOrder[order].questioner), 1);

            if (target_list.length === 0) { // 最後の一人がstopした時
                message_list.push(format(game_message, questionOrder[order].questioner, questionOrder[order].responder));
                responce_game.then(msg => {
                    msg.edit({
                        content: message_list.join(``),
                        embeds: [scores]
                    });
                });
                result(interaction, target_scores, GOAL);
                interaction.client.off("messageCreate", message_func); // メイン処理を停止
            } else if (order < target_list.length - 1) { // まだ順番が回っていない人がいる時
                order++;
            } else { // 順番が最後まで到達した時
                questionOrder = question_order_list_generator(target_list);
                order = 0;
            }

            message_list.push(format(game_message, questionOrder[order].questioner, questionOrder[order].responder));
            responce_game.then(msg => {
                msg.edit({
                    content: message_list.join(``),
                    embeds: [scores]
                });
            });
        }
    };
}


// Bot全体のスラッシュコマンド処理コード ------------------------------------------------------------------------
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pittari_team')
        .setDescription('何とピッタリゲーム(チーム戦)を始める🐦')
        .addIntegerOption(option => option
            .setName('ピッタリゴール')
            .setDescription('ピッタリを目指す数値')
            .setRequired(true)
        ),

    async execute(interaction) {
        // 参加者を募集する ------------------------------------------------------------------------
        GOAL = interaction.options.getInteger("ピッタリゴール");
        team_A_list = []; // Aチーム参加者の名前を格納する
        team_B_list = [];
        team_A_list_copy = []; // 質問者順の決定時に使うため、team_listのコピーを用意しておく
        team_B_list_copy = [];
        team_A_scores = {}; // チームのスコアを格納する
        team_B_scores = {};
        team_A_list.push("Tanaka Kumi"); // 一人でテスト時は"Tanaka Kumi", "Kato Ken"を予め入力
        team_B_list.push("Kato Ken");

        const addA_button = new ButtonBuilder()
            .setCustomId('addA')
            .setLabel('Aチーム')
            .setStyle(ButtonStyle.Success);

        const addB_button = new ButtonBuilder()
            .setCustomId('addB')
            .setLabel('Bチーム')
            .setStyle(ButtonStyle.Success);

        const withdrawal_button = new ButtonBuilder()
            .setCustomId('withdrawal')
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

        const cancel_button = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('ゲームを中断する')
            .setStyle(ButtonStyle.Secondary);


        const row = new ActionRowBuilder()
            .addComponents(addA_button, addB_button, withdrawal_button, start_button, clear_button, cancel_button);

        // 最初の宣言の設定
        let welcome_message = `何とピッタリゲームを始めます！\n参加する場合、以下のボタンを押してください！\n主催者は全員参加を確認次第開始してください！`;
        const response = await interaction.reply({
            content: welcome_message,
            components: [row],
        });
        const collector = await response.createMessageComponentCollector({ componentType: ComponentType.Button, max: 810, time: 60_000 });


        // 処理コード(イベント:collectの処理を発動する)
        collector.on('collect', async i => {
            try {
                if (i.customId === 'addA') {
                    if (team_A_list.indexOf(i.user.displayName) === -1) team_A_list.push(i.user.displayName); // 重複チェック→既にあったら入れない
                    await i.update({ content: welcome_message + `\n\nAチームに${i.user.displayName}が参加しました(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                } else if (i.customId === 'addB') {
                    if (team_B_list.indexOf(i.user.displayName) === -1) team_B_list.push(i.user.displayName); // 重複チェック→既にあったら入れない
                    await i.update({ content: welcome_message + `\n\nBチームに${i.user.displayName}が参加しました(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                } else if (i.customId === 'withdrawal') {
                    if (team_A_list.indexOf(i.user.displayName) !== -1) team_A_list.splice(team_A_list.indexOf(i.user.displayName), 1); // 押した人の名前のみピンポイントで消す
                    if (team_B_list.indexOf(i.user.displayName) !== -1) team_B_list.splice(team_B_list.indexOf(i.user.displayName), 1); // 押した人の名前のみピンポイントで消す
                    await i.update({ content: welcome_message + `\n\n${i.user.displayName}が離脱しました(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                } else if (i.customId === 'start') {
                    if (interaction.member.displayName !== i.user.displayName) { // 主催者と押した人が一致しない
                        await i.update({ content: welcome_message + `\n\n**確認の為、主催者の方が開始ボタンを押してください！**(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                    } else if (target_list.length >= 2) { // ユーザーの参加人数が2人以上
                        // ゲーム本編の処理に移行する
                        await i.update({ content: welcome_message + `\n\nゲームを開始します！(参加人数:${team_A_list.length + team_B_list.length})`, components: [] });
                        team_A_list_copy = [...team_A_list];
                        team_B_list_copy = [...team_B_list];
                        for (const team_A_name of team_A_list) team_A_scores[team_A_name] = 0;
                        for (const team_B_name of team_B_list) team_B_scores[team_B_name] = 0;
                        game_start(interaction);
                        return;
                    } else { // 参加者不十分(2人未満)の時
                        await i.update({ content: welcome_message + `\n\n**参加人数が足りません！(最低2人)**\n\n${i.user.displayName}が離脱しました(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                    }
                } else if (i.customId === 'clear') {
                    target_list.splice(0); // 要素を全削除
                    await i.update({ content: welcome_message + `\n\n参加者を一旦クリアします！(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                } else if (i.customId === 'cancel') {
                    if (interaction.member.displayName !== i.user.displayName) { // 主催者と押した人が一致しない
                        await i.update({ content: welcome_message + `\n\n**確認の為、主催者の方が中断ボタンを押してください！**\n\n${i.user.displayName}が離脱しました(参加人数:${team_A_list.length + team_B_list.length})`, components: [row] });
                    } else {
                        await i.update({ content: `何とピッタリゲームを中断しました...\n再開したい場合はもう一度コマンドを実行し直してください`, components: [] });
                        return;
                    }
                }
            } catch (e) {
                await i.update({ content: e });
            }
        });
    },
};