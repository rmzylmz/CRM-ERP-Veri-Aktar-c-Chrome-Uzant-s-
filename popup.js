document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportButton');
    const statusDiv = document.getElementById('status');

    if (!exportButton || !statusDiv) {
        console.error("Popup Error: Gerekli HTML elementleri (exportButton veya statusDiv) bulunamadı.");
        if (statusDiv) statusDiv.textContent = "Popup yüklenirken hata oluştu.";
        return;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Popup: Mesaj alındı:", message);
        if (message.action === "updateStatus") {
            statusDiv.textContent = message.text;
            statusDiv.className = message.isError ? 'error' : (message.isSuccess ? 'success' : '');
        }
        if (message.action === "exportProcessFinished") {
            exportButton.disabled = false;
            exportButton.textContent = "Tümünü Aktar";  
        }
    });

    exportButton.addEventListener('click', () => {
        statusDiv.textContent = 'Aktarım başlatılıyor...';
        statusDiv.className = '';
        exportButton.disabled = true;
        exportButton.textContent = "İşleniyor...";

        console.log("Popup: 'startJsonExport' mesajı background'a gönderiliyor (Tüm veriler için).");
        chrome.runtime.sendMessage({ action: "startJsonExport" }, (response) => {
            if (chrome.runtime.lastError) {
                const errorMsg = `Hata: Arka planla iletişim kurulamadı. Detay: ${chrome.runtime.lastError.message}`;
                console.error("Popup: Mesaj gönderme hatası:", chrome.runtime.lastError);
                statusDiv.textContent = errorMsg;
                statusDiv.className = 'error';
                exportButton.disabled = false;
                exportButton.textContent = "Tümünü Aktar";  
            } else {
                console.log("Popup: Mesaj gönderme isteği başarılı (background yanıtı):", response);
            }
        });
    });
});