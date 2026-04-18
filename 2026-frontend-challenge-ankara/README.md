# 🐾 Missing Podo: The Ankara Case

> **Jotform 2026 Frontend Hackathon** — Investigation Dashboard

Podo kayıp. Ankara'nın dört bir yanından gelen Jotform formları aracılığıyla elde edilen check-in kayıtları, mesajlar, görüntülenme raporları, kişisel notlar ve anonim ihbarlar tek bir araştırma panosunda bir araya getirildi. Amaç: Podo'nun son hareketlerini izlemek, şüpheli kalıpları yüzeye çıkarmak ve davayı kapatmak.

---

## Kurulum ve Çalıştırma

**Gereksinim:** Node.js 18 veya üzeri

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenleri dosyasını oluştur
cp .env.example .env

# 3. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

### Production Build

```bash
npm run build
npm run preview
```

---

## Ortam Değişkenleri

Proje kökünde bir `.env` dosyası oluştur:

```env
VITE_JOTFORM_API_KEY=your_api_key_here

VITE_FORM_CHECKINS=261065067494966
VITE_FORM_MESSAGES=261065765723966
VITE_FORM_SIGHTINGS=261065244786967
VITE_FORM_NOTES=261065509008958
VITE_FORM_TIPS=261065875889981
```

---

## Ne Yapıyor?

Uygulama, 5 farklı Jotform formundan gelen verileri paralel olarak çeker ve bunları tek bir `InvestigationRecord` modeline dönüştürür. Tüm bu veriler; arama, filtreleme ve görselleştirme araçlarıyla donatılmış bir araştırma panosunda sunulur.

### Sekmeler

| Sekme | Açıklama |
|---|---|
| **All Records** | Tüm kayıtların listesi. Kayda tıkladığında sağ panelde detaylar ve bağlantılı kayıtlar açılır. |
| **🔍 Podo Timeline** | Podo'nun adının geçtiği tüm olayların kronolojik zaman çizelgesi. |
| **🗺 Map** | Ankara'daki konumları Leaflet haritasında gösterir; kayıt ↔ harita işaretçisi senkronizasyonu. |
| **🔎 Suspects** | Her kişi için hesaplanan şüphe skoru, görünme sayısı, Podo ile birlikte olma sayısı ve ihbar sayısına göre sıralanmış şüpheli listesi. "Accuse" butonuyla dava kapatılabilir. |
| **🕸 Network** | Kişiler arası ilişkileri dairesel SVG grafiğiyle gösterir. Podo merkezdedir; düğüme hover yapınca bağlantılar öne çıkar, tıklayınca kayıtlar filtrelenir. |
| **📊 Heatmap** | 24 saatlik × 5 kaynak türü ısı haritası. En yoğun saati ve kaynak bazlı aktivite dağılımını gösterir. |

### Temel Özellikler

- **Arama & Filtreleme** — Tam metin arama + kaynak türü, kişi ve konum filtreleri
- **Kayıt Bağlantılama** — Ağırlıklı skorlama motoru: isim eşleşmesi, Podo birlikteliği, aynı konum, zaman yakınlığı
- **Şüphe Skorlaması** — Kişi başına görünme × 5 + Podo birlikteliği × 15 + ihbar × 25 + mobilite + acil mesaj bonusu
- **Detay Paneli** — Seçili kayıt yok iken özet istatistikler; kayıt seçilince bağlantılı kayıtlar (high / possible / weak güven seviyeleri)
- **İsim Normalizasyonu** — Türkçe alias eşleştirmesi (`Kağan` / `Kagan A.` → aynı kişi)
- **Responsive** — Desktop 3 kolon / tablet 2 kolon / mobil slide-over sidebar

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **react-leaflet** + **Leaflet** (harita)
- Plain CSS — CSS custom properties, UI kütüphanesi yok

---

## Proje Yapısı

```
src/
├── components/
│   ├── Header.tsx          # Hero başlık, istatistik kartları
│   ├── SearchBar.tsx        # Tam metin arama
│   ├── FilterBar.tsx        # Kaynak / kişi / konum filtreleri
│   ├── RecordList.tsx       # Kayıt listesi
│   ├── RecordCard.tsx       # Tekil kayıt kartı
│   ├── DetailPanel.tsx      # Kayıt detayı + bağlantılı kayıtlar
│   ├── SummaryPanel.tsx     # Özet istatistikler (kayıt seçili değilken)
│   ├── PodoTimeline.tsx     # Podo zaman çizelgesi
│   ├── MapView.tsx          # Leaflet harita görünümü
│   ├── SuspectsView.tsx     # Şüpheli sıralaması + verdict modu
│   ├── ConnectionGraph.tsx  # Kişi ilişki ağı (SVG)
│   └── ActivityHeatmap.tsx  # Saatlik aktivite ısı haritası
├── pages/
│   └── InvestigationPage.tsx  # Ana layout ve state yönetimi
├── hooks/
│   └── useInvestigation.ts    # Veri çekme + filtre state'i
├── services/                  # Jotform API fonksiyonları
├── utils/
│   ├── normalize.ts           # İsim alias'ları, konum normalizasyonu
│   ├── transformers.ts        # Form verisi → InvestigationRecord
│   ├── linking.ts             # Kayıt bağlantılama skorlama motoru
│   └── suspicion.ts           # Şüphe skoru hesaplama
├── types/                     # TypeScript arayüzleri
└── constants/                 # API URL, form ID'leri
```

---

## Geliştirici

**Arda Çavuş** — Jotform 2026 Frontend Hackathon, Ankara
