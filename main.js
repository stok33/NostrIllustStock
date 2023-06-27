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
		  console.error("エラー: これは秘密鍵…　公開鍵はnpubで始まる方");
          alert("わわ！これは秘密鍵じゃ！秘密にするのじゃ〜！！");
  		default:
		  console.error("エラー：これは…公開鍵じゃないね　");
          alert("公開鍵じゃないな　……何じゃ？");
	}


  /* Q-1: nostr-toolsのRelayオブジェクトを初期化してみよう */
  const relay = NostrTools.relayInit(relayUrl);
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
    console.log(ev);

    try {
      const content = ev.content; // contentタグの内容を取得

      // contentタグ内に直リンクの画像URLがあるかチェック
      const imgRegex = /https?:\/\/[^\s]+/g;
      const imgMatches = [...content.matchAll(imgRegex)];
      console.log(imgMatches);
      // 投稿を表示するための要素を作成
      const postContainer = document.createElement("div");

      if (imgMatches.length > 0) {
        // 画像がある場合の処理
        const imageContainer = document.createElement("div");

        for (const match of imgMatches) {
          const imageUrl = match[0];

          // 画像を表示するための要素を作成
          const imageElement = document.createElement("img");
          imageElement.src = imageUrl;
          //画像の調整
          imageElement.style.maxWidth = "60%";
          imageElement.style.height = "auto";
          //画像をimageContainerに追加
          imageContainer.appendChild(imageElement);
        }
        //画像部分をimageContainerを投稿表示のためのpostContainerに追加
        postContainer.appendChild(imageContainer);
      }

      // テキストコンテンツを表示するための要素を作成
      const textContainer = document.createElement("div");
      // 不要なURLを削除してテキストを設定
      textContainer.textContent = content.replace(imgRegex, "");
      //テキスト部分を投稿表示のための要素postContainerに追加(ただし、画像URLがない投稿は除く。画像とテキストが両方あるときのみテキストを表示する)
      if (textContainer && imgMatches.length > 0) {
        postContainer.appendChild(textContainer);
      }

      //画像とテキストが入ったpostContainerを一つの投稿表示欄illustContainerに追加
      illustContainer.appendChild(postContainer);
      //境界線追加
      illustContainer.appendChild(document.createElement("hr"));
    } catch (err) {
      console.error(err);
    }
  });


  sub.on("eose", () => {
    console.log("****** EOSE ******");
  });
};
