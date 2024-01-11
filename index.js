// ライブラリ　インポート
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

/**
 * デプロイのためのコマンド類
 */
const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

// fastifyによる高速なlisten
const fastify = require('fastify')({
    logger: true
});

fastify.listen({ host: host, port: port }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})

// ヘルスチェック用のpingコマンド(サーバー落ち対策)
// UptimeRobot: https://uptimerobot.com
/**
 * UptimeRobot
 * new monitor を HTTPメソッドに設定
 * エンドポイントは [https://pp-spoppo-discordbot.onrender.com/ping](https://pp-spoppo-discordbot.onrender.com/ping)
 */
fastify.get('/ping', function (request, reply) {
    // console.log(`Ping! Ping! Ping!`);
    reply.type('text/html').send(`
        <!DOCTYPE html>
        <html lang="ja">
            <head>
                <title>Document</title>
            </head>
            <body>
                <p>Ping!</p>
            </body>
        </html>
    `);
});




// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const token = process.env.DISCORD_TOKEN; // const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// コマンドファイルの読み込み
client.commands = new Collection();

//フォルダ読み込み
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter(file => file.endsWith('utility'));

for (const folder of commandFolders) {
    // ファイル読み込み
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        // コマンドファイル内のスラッシュコマンドを取り出し、client.commandsにセットする
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[警告] ${filePath} のコマンドには必要な "data" または "execute" プロパティがありません。`);
        }
    }
}

// ログイン成功時のログ(一度きり)
client.once(Events.ClientReady, readyClient => {
    console.log(`準備完了！${readyClient.user.tag}としてログインしました！`);
});

// イベント(インタラクション)が呼ばれたとき
client.on(Events.InteractionCreate, async interaction => {
    //  チャットコマンド以外のときはこの関数から抜ける
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    // チャットコマンド呼び出し失敗ログ
    if (!command) {
        console.error(`${interaction.commandName} というコマンドは見つかりませんでした...`);
        return;
    }

    // スラッシュコマンド呼び出し処理
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'このコマンドの実行中にエラーが発生しました！', ephemeral: true });
        } else {
            await interaction.reply({ content: 'このコマンドの実行中にエラーが発生しました！', ephemeral: true });
        }
    }
});

// ログイン
client.login(token);
