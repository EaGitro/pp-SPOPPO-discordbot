# Spoppo 
改良版何とピッタリゲームをdiscord botとして実装しました。


## 環境構築
以下を上から順番に行えば環境構築できるはずです。
既にgitをクローンしている人は2行目から初めてください。

1. 適当なフォルダをVisual Studio Codeで開く
2. mainリポジトリをクローン(clone)してくる
※ 3番目のコードはswitchじゃなくてchechoutの場合もあると思います

```terminal
git clone https://github.com/EaGitro/pp-SPOPPO-discordbot.git
cd pp-SPOPPO-discordbot
ls
git branch
git switch [自分の作ったブランチ]
git branch
```

3. `.env`ファイルを作成する
クローンしてきたファイルの一つの `` を参考に、自分の値を入れるだけ
**間違っても.env.exampleに自分のトークン等を書かない！**

```.env
DISCORD_TOKEN=[自分のdiscord token]
DISCORD_CLIENTID=[自分のclientId]
DISCORD_GUILDID=[自分のguildId]
```

4. [discord botの設定サイト](https://discord.com/developers/applications/1179777179085713471/bot)からPrivileged Gateway Intentsの `SERVER MEMBERS INTENT` と `MESSAGE CONTENT INTENT` を許可にする。
具体的には以下画像の赤枠の箇所を許可にする。
![image](pp-SPOPPO-discordbot/privileged_gateway_intents.png)

5. ターミナルにてnpm installを実行する

6. botを起動する
以下コードをvscodeのターミナルで実行し、動いているかどうか実際にdiscordでコマンドを打ち込んで確認してみるべし
```node
node deploy-commands.js
node index.js
```


## gitignore(既に作ってある)
`node_modules` と token が含まれる `config.json` と `.env` を無視する。
また、macの人は `.DS_store` も入れないと混乱する。
以上を踏まえて、 `.gitignore` を以下の内容で作成する。
**これを作成していない場合、gitにpushしてはいけません！！！**


```.gitignore
# Dependency directories
node_modules
config.json
.env
.DS_Store
test.js
```





