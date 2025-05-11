// 設定を保存する関数
function saveOptions() {
    // テキストエリアから値を取得
    const urlPatterns = document.getElementById('urlPatterns').value;
    
    // 値を配列に変換（空行は除外）
    const patterns = urlPatterns.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
    
    // Chrome の storage API を使用して保存
    chrome.storage.sync.set({ urlPatterns: patterns }, function() {
      // 保存成功時の処理
      const status = document.getElementById('status');
      status.textContent = '設定を保存しました。';
      status.className = 'success';
      
      // 2秒後にステータスメッセージを消す
      setTimeout(function() {
        status.textContent = '';
        status.className = '';
      }, 2000);
    });
  }
  
  // 保存された設定を読み込む関数
  function restoreOptions() {
    chrome.storage.sync.get({ urlPatterns: [] }, function(items) {
      // 配列を改行区切りのテキストに変換
      document.getElementById('urlPatterns').value = items.urlPatterns.join('\n');
    });
  }
  
  // ページ読み込み時に設定を読み込む
  document.addEventListener('DOMContentLoaded', restoreOptions);
  
  // 保存ボタンのクリックイベント
  document.getElementById('save').addEventListener('click', saveOptions);