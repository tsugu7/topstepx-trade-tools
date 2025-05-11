// URLパターンにマッチするか確認する関数
function matchesPattern(url, pattern) {
    // ワイルドカードを正規表現に変換
    const regexPattern = pattern
      .replace(/\./g, '\\.')  // ドットをエスケープ
      .replace(/\*/g, '.*');  // アスタリスクを正規表現の任意の文字列に変換
    
    // 正規表現オブジェクトを作成して、URLがパターンにマッチするか確認
    const regex = new RegExp(`^${regexPattern}`);
    return regex.test(url);
  }
  
  // ページが読み込まれたときに実行
  document.addEventListener('DOMContentLoaded', function() {
    // 設定ページを開くボタンのイベントリスナー
    const settingsButton = document.getElementById('openSettings');
    if (settingsButton) {
      settingsButton.addEventListener('click', function() {
        // Chrome拡張機能の設定ページを開く
        if (chrome.runtime.openOptionsPage) {
          // Chrome 42以降
          chrome.runtime.openOptionsPage();
        } else {
          // 古いバージョン用のフォールバック
          window.open(chrome.runtime.getURL('options.html'));
        }
      });
    }
    
  
    // 現在アクティブなタブの情報を取得
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // タブが存在する場合
      if (tabs && tabs.length > 0) {
        const currentTab = tabs[0];
        const pageTitle = currentTab.title || "タイトルが見つかりません";
        const pageUrl = currentTab.url || "";
        
        // 保存されたURLパターンを取得
        chrome.storage.sync.get({ urlPatterns: [] }, function(items) {
          const urlPatterns = items.urlPatterns;
          
          // URLパターンが空の場合はすべてのURLで動作
          const isUrlAllowed = urlPatterns.length === 0 || 
                               urlPatterns.some(pattern => matchesPattern(pageUrl, pattern));
          
          if (isUrlAllowed) {
            // ページタイトルを表示
            document.getElementById('pageTitle').textContent = pageTitle;
            
            // コピーボタンを有効化
            const copyButton = document.getElementById('copyButton');
            copyButton.disabled = false;
            
            // タイトルをコピーするボタンの処理
            copyButton.addEventListener('click', function() {
              // クリップボードにタイトルをコピー
              navigator.clipboard.writeText(pageTitle).then(function() {
                // コピー成功時の処理
                const originalText = this.textContent;
                this.textContent = 'コピーしました！';
                
                // 2秒後に元のテキストに戻す
                setTimeout(() => {
                  this.textContent = originalText;
                }, 2000);
              }.bind(this)).catch(function(err) {
                // エラー時の処理
                console.error('クリップボードへのコピーに失敗しました:', err);
                alert('コピーに失敗しました。');
              });
            });
          } else {
            // 許可されていないURLの場合
            document.getElementById('pageTitle').textContent = 
              "このURLは対象外です。設定で許可URLを確認してください。";
            
            // 設定ボタンを追加
            const settingsLink = document.createElement('button');
            settingsLink.textContent = "設定を開く";
            settingsLink.style.marginTop = "10px";
            settingsLink.addEventListener('click', function() {
              chrome.runtime.openOptionsPage();
            });
            document.body.appendChild(settingsLink);
            
            // コピーボタンを無効化
            document.getElementById('copyButton').disabled = true;
          }
        });
      } else {
        // タブが見つからない場合
        document.getElementById('pageTitle').textContent = "タブ情報を取得できませんでした";
      }
    });
  });