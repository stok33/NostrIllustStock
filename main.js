const currUnixtime = () => Math.floor(new Date().getTime() / 1000);

let CreatedAt_last = null;
let Relay_remember = null;
let Npub_remember = null;

let isLoading = false;
let lastClickTime = 0;
const CLICK_INTERVAL = 500; // ミリ秒（0.5秒）

//画像を整える
function arrange_Images(container, imgMatches) {
  for (const match of imgMatches) {
    const img = document.createElement("img");
    img.src = match[0]; //matchの配列からurlとってくる
	img.style.maxWidth = "auto"; //幅
    img.style.height = "300px"; //高さ
	  
    container.appendChild(img); //画像をcontainerに追加
  }
}

//テキストを整える
function arrange_Texts(container, content, imgRegex) {
	const text = document.createElement("div");
	container.style.wordBreak = "break-word"; //よしなに改行して欲しい
	let cleanText = content.replace(imgRegex, "");　// 不要なURLを削除して純粋なテキストを設定
	// 最大文字数制限
  	const MAX_LENGTH = 200;
  	if (cleanText.length > MAX_LENGTH) {
    	cleanText = cleanText.slice(0, MAX_LENGTH) + "..."; //MAX文字数超えたら切る
  	}
	text.textContent = cleanText
	
	container.appendChild(text);　//テキストをcontainerに追加
}

//nostterリンクを作る
function make_nostterLink(container, nevent) {
  	const link = document.createElement("a");　//ここはdivじゃなくてaタグ
  	link.href = `https://nostter.app/${nevent}`;　// href属性にnostterのurl
  	link.textContent = "投稿をみる(nostter)";　//リンク文字列
  	link.target = "_blank";　// 新しいタブで開く
  	container.appendChild(link); //リンクをcontainerに追加
}

//kind0部分の処理
function display_kind0(pf) {
	try {
    	const profcontent = JSON.parse(pf.content); // eventJSON文字列をオブジェクトに変換
      	const profpicture = profcontent.picture;//content内のpictureの値を取得
      	const profdisplayname = profcontent.display_name; // content内のdisplay_nameの値を取得
      	const profname = profcontent.name; // content内のnameの値を取得
      	const profabout = profcontent.about; // content内のaboutの値を取得
      	console.log(profname);
      
      	// プロフィールを表示するための要素を作成
      	const kind0Container = document.createElement("div");
      
      	// プロフィールを表示するための部分にアイコンとdisplay_nameとnameと自己紹介を追加
      	//アイコン
      	const imageElement = document.createElement("img");
      	imageElement.src = profpicture;
      	imageElement.style.maxWidth = "100px"; // 最大幅制限
      	imageElement.style.height = "auto"; // 高さは自動調整
      	kind0Container.appendChild(imageElement);  // プロフィールを表示する要素に追加
      	//display_name　表示名
      	const displaynameElement = document.createElement("div");
      	displaynameElement.textContent = profdisplayname;
      	kind0Container.appendChild(displaynameElement); // プロフィールを表示する要素に追加
      	//name　アットマークの後
      	const nameElement = document.createElement("div");
      	nameElement.textContent = profname;
      	kind0Container.appendChild(nameElement); // プロフィールを表示する要素に追加
      	//自己紹介欄
      	const aboutElement = document.createElement("div");
      	aboutElement.textContent = profabout;
      	kind0Container.appendChild(aboutElement); // プロフィールを表示する要素に追加

      	// 全部まとめてプロフィールコンテナに追加
      	profContainer.appendChild(kind0Container);

		//境界線(kind0欄と画像投稿一覧の境界)追加
      	profContainer.appendChild(document.createElement("hr"));

    } catch (err) {
      console.error(err);
  	}
}

//kind1部分の処理
function display_kind1(ev) {
	try {
      	const content = ev.content; // contentタグの内容を取得
      	const Id = ev.id // idタグの内容（ここではnoteid）を取得
	    //console.log("Id:", Id);
      	const tags = ev.tags; // tags配列を取得

      	// contentタグ内に直リンクの画像URLがあるかチェック
      	const imgRegex = /https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp)/g;
      	const imgMatches = [...content.matchAll(imgRegex)];
      	//console.log(imgMatches);
        
      	// センシティブなコンテンツのチェック
      	const isSensitive = tags.some(tag => tag[0] === 'content-warning');

      	const noteId = NostrTools.nip19.noteEncode(Id); //noteidをnote~形式に直す
	    //console.log("noteId:", noteId);
      	const nevent = NostrTools.nip19.neventEncode({id: Id}); //neventに直す
	    //console.log("nevent:", nevent);

      	// 投稿を表示するための要素を作成
      	const postContainer = document.createElement("div");
      
      	switch (true) {
          	// センシティブな画像付き投稿
        	case isSensitive && imgMatches.length > 0:
              	let sensitiveContentClicked = false; // 初期値はクリックされていない状態

				//content-warning表示
              	const sensitiveContainer = document.createElement("div");
              	const sensitiveText = document.createElement("div");
              	sensitiveText.textContent = "[content-warning！\nクリックで表示]";
				sensitiveText.style.whiteSpace = "pre-line"; //改行の調整
              	sensitiveText.style.cursor = "pointer"; // カーソルをポインターに変更
              	sensitiveContainer.appendChild(sensitiveText);

              	//content-warningの理由表示
              	const reasonTag = tags.find(tag => tag[0] === 'content-warning');
              	if (reasonTag && reasonTag[1]) {
                  	const reasonElement = document.createElement("div");
                  	reasonElement.textContent = `理由: ${reasonTag[1]}`;
                  	sensitiveContainer.appendChild(reasonElement);
              	}
              
              
              	//クリックイベントを設定
              	sensitiveContainer.addEventListener("click", () => {
                  	if (!sensitiveContentClicked) { // クリックは一回まで！クリックしてない場合のみ処理が行われる
                      	sensitiveContentClicked = true; // クリック状態をtrueに設定
                      	// クリック時の処理：画像を表示する
                      	sensitiveContainer.innerHTML = ''; // テキストをクリア
                
                      	//表示関連は関数にお任せ
						arrange_Images(postContainer, imgMatches);
      					arrange_Texts(sensitiveContainer, content, imgRegex);
      					make_nostterLink(postContainer, nevent);
                	}
        		});
              	// 投稿コンテナにセンシティブ投稿を追加
              	postContainer.appendChild(sensitiveContainer);
              
              	break;
              
        	//センシティブでない画像付き投稿
        	case !isSensitive && imgMatches.length > 0:

              	//表示関連は関数にお任せ
				arrange_Images(postContainer, imgMatches);
      			arrange_Texts(postContainer, content, imgRegex);
      			make_nostterLink(postContainer, nevent);
              
	　　　　	break;
              
        	//画像なしの場合は処理を終わる
        	default:
				return;
              
    	};
		
      	//postContainerを一つの投稿表示欄illustContainerに追加
      	illustContainer.appendChild(postContainer);
      	//境界線追加
      	illustContainer.appendChild(document.createElement("hr"));
  	} catch (err) {
    	console.error(err);
  	}
}

//初回の処理
const searchPosts = async () => {
	//npubを入力欄から取得
  	const npubInput = document.getElementById("npubInput");
	let npub = npubInput.value; //あとでhex変換するので、上書きできるletを使う

  	//取得したnpubをhexに変換
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
    
  	//リレーURLを入力欄から取得
  	const relayInput = document.getElementById("relayInput");
  	const relayUrl = relayInput.value;

  	/* Q-1: nostr-toolsのRelayオブジェクトを初期化してみよう */
  	const relay = NostrTools.relayInit(relayUrl);
  	relay.on("error", () => {
    console.error("failed to connect");
  	});

  	/* Q-2: Relayオブジェクトのメソッドを呼び出して、リレーに接続してみよう */
  	await relay.connect(relayUrl);

  	//あとで使う用に保存しておく
  	Relay_remember = relay; //「もっと見る」押した時にもさっきのリレー使えるように覚えておきましょうね
  	Npub_remember = npub; //npubもね

  	/* Q-3: Relayオブジェクトのメソッドを使って、イベントを購読してみよう */
  	//kind0を購読
  	const sub0 = relay.sub([
    	{
        	"kinds":[0],
        	"authors":[npub]
    	}

  	]);

  	//kind1にフィルター（10イベント、illustタグつき、指定した公開鍵からの投稿）つけて購読
  	const sub = relay.sub([
    	{
        	"kinds": [1],
        	"limit": 10,
        	"#t":["illust"],
        	"authors": [npub]　// 作者の公開鍵
    	}
  	]);
  
  	const profContainer = document.getElementById("profContainer");
  	profContainer.innerHTML = ""; // コンテナをクリア
    
  	const illustContainer = document.getElementById("illustContainer");
  	illustContainer.innerHTML = ""; // コンテナをクリア

  	// メッセージタイプごとにリスナーを設定できる
  
  	//kind0の方
  	sub0.on("event", (pf) => {

		display_kind0(pf); //kind0の処理は関数display_kind0さん、出番ですよ
		//console.log(pf);
  	});

  	//kind0終わり
  	sub0.on("eose", () => {

    	console.log("****** EOSE ******");
  	});

  	//kind1の方
　	sub.on("event", (ev) => {
		// 10個受信した中で一番古い投稿をCreatedAt_lastに記録する
		if (!CreatedAt_last || ev.created_at < CreatedAt_last) { //初期のnullのままか、もっと小さい（古い）createdat値が出てきたら...
    		CreatedAt_last = ev.created_at; //「今のところ1番古い」を更新
		}
	
  		display_kind1(ev); //kind1の処理は関数display_kind1さん、出番ですよ
  		//console.log(ev);
  	});

  	//kind1終わり
  	sub.on("eose", () => {
    	console.log("****** EOSE ******");
		
		const mae = document.getElementById("loadMore");
  		mae.style.display = "block"; //「もっと見る」ボタン解禁
  	});
};

//「前へ」を押されたときの処理
const loadMorePosts = async () => { 
	//無いと思うけど一応連打防止しておく

	const now = Date.now();
	if (now - lastClickTime < CLICK_INTERVAL) return; 
	lastClickTime = now;

	if (isLoading) return; // 読み込み中(isLoading=true)ではスルーするスタンス

	//リレーとかの情報なかったらスルーさせていただく
	if (!Relay_remember || !Npub_remember || !CreatedAt_last) return; 

	isLoading = true; //ここから読み込み中判定

	// 「もっと見る」ボタンを読み込み中にして、一時的に押せなくする
	const mae = document.getElementById("loadMore");
	mae.disabled = true; 
	mae.textContent = "読み込みちゅう...";

	const sub = Relay_remember.sub([ //←1回目の読み込みで覚えたリレーを使いますよ
    	{
      		kinds: [1],
      		limit: 10,
      		"#t": ["illust"],
      		authors: [Npub_remember], //←1回目の読み込みで覚えたnpubを使いますよ
      		until: CreatedAt_last - 1 //前回の読み込みで一番古かったものよりも、1つ古いやつまで
    	}
	]);

	//前kind1表示
	sub.on("event", (ev) => {
		if (!CreatedAt_last || ev.created_at < CreatedAt_last) {
    		CreatedAt_last = ev.created_at;
    	}
		
  		display_kind1(ev); 
  		//console.log(ev);
	});

	//前kind1終わり
	sub.on("eose", () => {
		isLoading = false; //読み込み中解除
    	mae.disabled = false; // 再び押せるように
		mae.textContent = "もっと見る"; //ボタンの表記を戻す
  	});
	
};
