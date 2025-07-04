Kesinlikle haklısınız\! `host_permissions` alanı da `background.js`'deki API ayarları kadar kritik ve kullanıcıların kendi sistemlerine uyarlamaları için belirtilmesi gerekiyor.

Aşağıda, hem `background.js` hem de `manifest.json` dosyalarının yapılandırma gerektinimlerini detaylıca açıklayan güncellenmiş `README.md` dosyasını bulabilirsiniz. "Kurulum ve Yapılandırma" başlığını daha da detaylandırdım.

-----

````markdown
# CRM/ERP Veri Aktarıcı (Chrome Uzantısı)

## Kısa Açıklama

Bu Chrome uzantısı, web tabanlı **CRM ve ERP gibi yönetim panellerinden** belirli veri setlerini (örneğin, mail listeleri, ürün bilgileri, müşteri kayıtları vb.) kullanıcı tarafından indirilebilir bir JSON formatına aktarmak amacıyla geliştirilmiştir. Uzantı, bu panellerin standart kullanıcı girişi mekanizmasına entegre çalışır ve yalnızca yetkilendirilmiş kullanıcıların erişebileceği verileri işlemeyi hedefler.

## Amaç

Bu projenin temel amacı, çeşitli **CRM, ERP ve benzeri iş yönetim panellerinde** kayıtlı bulunan verilerin (e-posta adresleri, iletişim bilgileri, ürün detayları, sipariş kayıtları gibi) kolayca dışa aktarılabilmesini sağlamaktır. Bu sayede, kullanıcılar kendi verilerini daha esnek bir şekilde yönetebilir, farklı sistemlere aktarabilir veya yedekleyebilirler.

## Özellikler

* **Genel Veri Çekme Yeteneği:** Desteklenen yönetim panellerindeki çeşitli veri kayıtlarını sayfalama yaparak çeker.
* **JSON Formatında Dışa Aktarma:** Çekilen verileri standart, okunabilir JSON formatında düzenler.
* **Kullanıcı Dostu İndirme:** Oluşturulan JSON dosyasını kullanıcının cihazına kolayca indirme seçeneği sunar.
* **Durum Bildirimleri:** Aktarım süreci boyunca kullanıcıya anlık durum bilgileri sağlar.
* **API Güvenlik Desteği:** Güvenli veri çekimi için bazı panel sistemlerinin kullandığı CSRF token veya benzeri güvenlik mekanizmalarını destekleyebilir. (Kullandığınız panele ve yapılandırmanıza bağlıdır.)

---

## Önemli Bilgiler

Bu uzantı, çeşitli web tabanlı CRM/ERP ve benzeri yönetim panellerindeki verileri dışa aktarmak için tasarlanmıştır. Uzantıyı kullanırken, işlenen verilerin gizliliği ve ilgili yasal düzenlemelere (örn. KVKK, GDPR) uygunluk da dahil olmak üzere, tüm sorumluluk tamamen kullanıcıya aittir. Geliştirici, uzantının kullanımından kaynaklanabilecek herhangi bir veri kaybı, hukuki sorun veya iş kesintisinden sorumlu değildir. Panel sağlayıcılarının yapabileceği güncellemeler veya API değişiklikleri uzantının işlevselliğini etkileyebilir veya uyumluluğunu bozabilir. Bu proje bağımsız bir geliştirme olup, herhangi bir ticari platform veya şirket ile doğrudan bir bağlantısı veya ortaklığı bulunmamaktadır.

---

## Kurulum ve Yapılandırma

Uzantıyı kullanabilmek için hem `background.js` hem de `manifest.json` dosyalarında panelinize özel bazı yapılandırmalar yapmanız gerekmektedir.

1.  Bu GitHub deposunu cihazınıza klonlayın veya zip olarak indirin.

2.  **`background.js` Dosyasını Yapılandırma:**
    * İndirdiğiniz projenin kök dizinindeki `background.js` dosyasını bir metin düzenleyici ile açın.
    * Dosyanın başında yer alan aşağıdaki satırları bulun:
        ```javascript
        const API_BASE_URL = "[https://domain.hizmetverenkurulus.com/admin-app/maillists]";
        const API_FIELDS_FOR_JSON = "id,maillistGroup,name,email,createdAt";
        ```
    * Bu satırları, veri çekmek istediğiniz **kendi yönetim panelinizin API yapısına göre güncellemeniz gerekmektedir.**
    * **Nasıl Bulunur?**
        1.  Yönetim panelinize giriş yapın ve dışa aktarmak istediğiniz verilerin (örn. mail listesi, ürünler, siparişler) bulunduğu sayfaya gidin.
        2.  Tarayıcınızın geliştirici araçlarını açın (genellikle F12 tuşu ile).
        3.  "Network" (Ağ) sekmesine geçin.
        4.  Sayfayı yenileyin veya veri listesini filtreleyip sayfa değiştirme gibi bir eylem yapın.
        5.  Network sekmesinde çıkan istekleri (genellikle "XHR" veya "Fetch" filtreleriyle daha kolay bulunur) inceleyin.
        6.  İsteklerden birini seçtiğinizde, "Headers" (Başlıklar) sekmesinde `Request URL` ve `Query String Parameters` (Sorgu Dizesi Parametreleri) gibi bölümlere bakın.
        7.  Örnek bir URL yapısı: `https://[alanadiniz].com/admin-app/[veri_tipi]?page=X&limit=Y&sort=-id&fields=alan1,alan2,alan3`
        8.  Bu yapıya göre `API_BASE_URL` (temel API URL'si) ve `API_FIELDS_FOR_JSON` (çekmek istediğiniz alan adları, virgülle ayrılmış şekilde) değerlerini güncelleyin. Örneğin:
            ```javascript
            const API_BASE_URL = "https://[sizin-domaininiz].com/admin-app/[veri-tipi]"; // Örn: /admin-app/products veya /admin-app/customers
            const API_FIELDS_FOR_JSON = "id,ad,soyad,email,fiyat,stok"; // Çekmek istediğiniz alan adları
            ```

3.  **`manifest.json` Dosyasını Yapılandırma:**
    * Projenin kök dizinindeki `manifest.json` dosyasını bir metin düzenleyici ile açın.
    * `"host_permissions"` alanını bulun:
        ```json
        "host_permissions": [
          "[https://domain.hizmetverenkurulus.com/*]"
        ],
        ```
    * Uzantınızın hangi web sitesi/domain üzerinde çalışmasına izin verileceğini belirtmek için bu URL'yi kendi panelinizin domaini ile güncelleyin. Örneğin:
        ```json
        "host_permissions": [
          "https://[sizin-domaininiz].com/*" // Kendi panelinizin ana domainini yazın
        ],
        ```
    * Birden fazla domainde çalışmasını istiyorsanız, her bir domaini virgülle ayırarak listeye ekleyebilirsiniz. Örneğin:
        ```json
        "host_permissions": [
          "[https://domain1.com/](https://domain1.com/)*",
          "[https://sub.domain2.net/](https://sub.domain2.net/)*"
        ],
        ```
    * **UYARI:** `"host_permissions"` alanını `<all_urls>` olarak ayarlamak (yani tüm sitelere erişim izni vermek) uzantınızın güvenliğini düşürecektir ve Chrome Web Store politikaları tarafından genellikle özel bir gerekçe ister. Sadece uzantınızın çalışacağı spesifik domaini/domainleri belirtmeniz şiddetle tavsiye edilir.

4.  **Uzantıyı Chrome'a Yükleme:**
    * Chrome tarayıcınızı açın ve adres çubuğuna `chrome://extensions` yazarak uzantılar sayfasına gidin.
    * Sağ üst köşedeki "Geliştirici modu" (Developer mode) anahtarını etkinleştirin.
    * "Paketlenmemiş uzantıyı yükle" (Load unpacked) butonuna tıklayın.
    * Yukarıdaki yapılandırmaları yaptığınız projenin ana klasörünü seçin (içinde `manifest.json` dosyasının bulunduğu klasör).
    * Uzantı tarayıcınıza eklenecek ve uzantılar listenizde "CRM/ERP Veri Aktarıcı" adıyla görünecektir.

## Kullanım

1.  Veri aktarımı yapmak istediğiniz **CRM/ERP veya benzeri yönetim paneline** tarayıcınızda giriş yapın.
2.  `background.js` dosyasında yapılandırdığınız `API_BASE_URL` ile eşleşen veri türünün bulunduğu ilgili yönetim paneli sayfasına gidin (örn. Müşteri Listesi, Ürünler Sayfası, Mail Listesi).
3.  Tarayıcınızın araç çubuğundaki uzantı ikonları arasından "CRM/ERP Veri Aktarıcı" ikonuna tıklayın.
4.  Açılan küçük pencerede "Aktarımı Başlat" butonuna tıklayın.
5.  Uzantı, yapılandırmasına göre verileri çekmeye başlayacak ve durumunu pencerede anlık olarak gösterecektir.
6.  Veri çekimi tamamlandığında, oluşturulan JSON dosyası için bir indirme penceresi açılacaktır. Dosyayı kaydetmek istediğiniz yeri seçerek indirme işlemini tamamlayabilirsiniz.

## Katkıda Bulunma

Projenin geliştirilmesine katkıda bulunmaktan memnuniyet duyarız! Hata raporları, özellik önerileri veya kod katkıları için lütfen:

* Bir "Issue" açın: Sorunlarınızı veya önerilerinizi detaylı bir şekilde açıklayın.
* Bir "Pull Request" gönderin: Kod değişikliklerinizle projeye doğrudan katkıda bulunun.



