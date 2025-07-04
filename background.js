const API_BASE_URL = "https://domain.hizmetverenkurulus.com/admin-app/maillists";
const API_FIELDS_FOR_JSON = "id,maillistGroup,name,email,createdAt";
const ITEMS_PER_PAGE = 100;

function updatePopupStatus(text, isError = false, isSuccess = false) {
    console.log(`Background Status: ${text} (Error: ${isError}, Success: ${isSuccess})`);
    chrome.runtime.sendMessage({ action: "updateStatus", text, isError, isSuccess });
}

function notifyPopupProcessFinished() {
    chrome.runtime.sendMessage({ action: "exportProcessFinished" });
}

async function getCsrfTokenFromCookies() {
    try {
        const cookie = await chrome.cookies.get({
            url: "https://domain.hizmetverenkurulus.com",
            name: "X-CSRF-TOKEN"
        });
        return cookie?.value || null;
    } catch (error) {
        console.error("CSRF token alınırken hata:", error);
        return null;
    }
}

async function fetchAllMailList() {
    updatePopupStatus("Mail listesi verileri çekiliyor...");
    let currentPage = 1;
    let allMails = [];
    let hasMorePages = true;
    let totalFetched = 0;
    const csrfToken = await getCsrfTokenFromCookies();

    if (!csrfToken) {
        updatePopupStatus("Hata: CSRF token alınamadı. Panelde oturum açık mı?", true);
        notifyPopupProcessFinished();
        return null;
    }

    while (hasMorePages) {
        const apiUrl = `${API_BASE_URL}?page=${currentPage}&limit=${ITEMS_PER_PAGE}&sort=-id&fields=${API_FIELDS_FOR_JSON}`;
        updatePopupStatus(`Sayfa ${currentPage} çekiliyor... (Toplam ${totalFetched} kayıt)`);

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                updatePopupStatus(`Hata ${response.status}: ${errorText.substring(0, 100)}...`, true);
                notifyPopupProcessFinished();
                return null;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                const textResponse = await response.text();
                updatePopupStatus(`Hatalı içerik türü: ${contentType}`, true);
                notifyPopupProcessFinished();
                return null;
            }

            const data = await response.json();
            const items = Array.isArray(data) ? data : (data?.data ?? []);

            if (items.length > 0) {
                allMails.push(...items);
                totalFetched += items.length;
                hasMorePages = items.length === ITEMS_PER_PAGE;
                currentPage++;
            } else {
                hasMorePages = false;
            }

        } catch (error) {
            updatePopupStatus(`API hatası: ${error.message}`, true);
            notifyPopupProcessFinished();
            return null;
        }
    }

    if (allMails.length > 0) {
        updatePopupStatus(`${allMails.length} kayıt başarıyla alındı. JSON dosyası hazırlanıyor...`);
    } else {
        updatePopupStatus("Hiç veri çekilemedi.", true);
    }

    return allMails;
}

async function downloadJsonFile(data, filenamePrefix = "maillist_export") {
    if (!data || data.length === 0) {
        updatePopupStatus("İndirilecek veri bulunamadı.", true);
        notifyPopupProcessFinished();
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    const dataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => reader.error ? reject(reader.error) : resolve(reader.result);
        reader.onerror = reject;
    });

    const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')}.json`;

    chrome.downloads.download({
        url: dataUrl,
        filename,
        saveAs: true
    }, (downloadId) => {
        if (chrome.runtime.lastError || downloadId === undefined) {
            updatePopupStatus(`İndirme hatası: ${chrome.runtime.lastError?.message || 'bilinmeyen hata'}`, true);
        } else {
            updatePopupStatus(`"${filename}" başarıyla indiriliyor.`, false, true);
        }
        notifyPopupProcessFinished();
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startJsonExport") {
        fetchAllMailList()
            .then(mails => {
                if (mails) {
                    downloadJsonFile(mails, "maillist_export");
                }
            })
            .catch(error => {
                updatePopupStatus(`Veri çekme hatası: ${error.message}`, true);
                notifyPopupProcessFinished();
            });
        sendResponse({ status: "Mail listesi export başlatıldı" });
        return true;
    }
});

console.log("Background Service Worker (JSON Export) hazır.");
