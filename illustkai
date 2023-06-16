const { currUnixtime, getCliArg, createElement, getElementById, appendchild } = require("./utils.js");
const { relayInit } = require("nostr-tools");
require("websocket-polyfill");
const { nip19 } = require("nostr-tools");

if (process.argv.length <= 2) {
  console.error(
    "usage: node index.js <bech32 ID (npub, nprofile, nsec, note, nevent)>"
  );
  process.exit(1);
}

const { type, data } = nip19.decode(process.argv[2]);
const out = (() => {
	switch (type) {
  		case "npub":
    		npub = data;
    		break;
  		case "nprofile":
    		npub = data.pubkey;
    		break;
  		case "nsec":
   		 console.error("エラー: これは秘密鍵です！秘密にして！");
   		 process.exit(1);
  		case "note":
    		console.error("エラー: これはnoteIDです。公開鍵じゃないよ");
    		process.exit(1);
  		case "nevent":
    		console.error("エラー: これはイベントIDです。公開鍵じゃないよ");
    		process.exit(1);
  		default:
   		 console.error("エラー: これは公開鍵じゃないよ");
   		 process.exit(1);
	}
})();


const relayUrl = "wss://relay-jp.nostr.wirednet.jp";
/* 入力された公開鍵を取得byAIchan*/
const searchPosts = async () => {
 const npubInput = document.getElementById("npubInput");
 const npub = npubInput.value;

 const relay = relayInit(relayUrl);
 relay.on("error", () => {
  console.error("failed to connect");
 });

const main = async (npub) => {
  /* Q-1: nostr-toolsのRelayオブジェクトを初期化してみよう */
  const relay = relayInit(relayUrl);
  relay.on("error", () => {
    console.error("failed to connect");
  });

  /* Q-2: Relayオブジェクトのメソッドを呼び出して、リレーに接続してみよう */
  await relay.connect(relayUrl);

  /* Q-3: Relayオブジェクトのメソッドを使って、イベントを購読してみよう */
  const sub = relay.sub(
  		{
			"kinds": [1],
			"limit": 100,
			"#t":["illust"],
			"authors": [npub]
			// 作者の公開鍵
	
		}
  ]);

  const illustContainer = document.getElementById("illustContainer");
  illustContainer.innerHTML = ""; // コンテナをクリア

  // メッセージタイプごとにリスナーを設定できる
  sub.on("event", (ev) => {
    // イベントがhtmlの<div>んとこに飛んでく、多分
    const postDiv = document.createElement("div");
    postDiv.textContent = ev.content;
    illustContainer.appendChild(postDiv);
  });

  sub.on("eose", () => {
    console.log("****** EOSE ******");
  });
};
main(npub).catch((e) => console.error(e));
