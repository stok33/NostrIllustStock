const currUnixtime = () => Math.floor(new Date().getTime() / 1000);

const relayUrl = "wss://relay-jp.nostr.wirednet.jp";
/* 入力された公開鍵を取得byAIchan*/
const searchPosts = async () => {
  const npubInput = document.getElementById("npubInput");
  let npub = npubInput.value;

/*取得したnpubをhexに変換*/
  const { type, data } = NostrTools.nip19.decode(npub);
	switch (type) {
  		case "npub":
    		  npub = data;
    		break;
  		case "nprofile":
    		  npub = data.pubkey;
    		break;
  		case "nsec":
   		  console.error("エラー: これは秘密鍵です！秘密にして！");
  		case "note":
    		  console.error("エラー: これはnoteIDです。公開鍵じゃないよ");
  		case "nevent":
    		  console.error("エラー: これはイベントIDです。公開鍵じゃないよ");
  		default:
   		  console.error("エラー: これは公開鍵じゃないよ");
	}


  /* Q-1: nostr-toolsのRelayオブジェクトを初期化してみよう */
  const relay = relayInit(relayUrl);
  relay.on("error", () => {
    console.error("failed to connect");
  });

  /* Q-2: Relayオブジェクトのメソッドを呼び出して、リレーに接続してみよう */
  await relay.connect(relayUrl);

  /* Q-3: Relayオブジェクトのメソッドを使って、イベントを購読してみよう */
  const sub = relay.sub([
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
    try {
     const content = ev[2].content; // contentタグの内容を取得
     const postDiv = document.createElement("div");
     postDiv.textContent = content;
     illustContainer.appendChild(postDiv); //<div>部分に内容が飛んでく
    } catch (err) {
      console.error(err);
    }
  });

  sub.on("eose", () => {
    console.log("****** EOSE ******");
  });
};
