// ライブラリ　インポート
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

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
        await command.execute(interaction, client);
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
