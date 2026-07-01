# Kamer Portfolio

Neo-Klasik / Barok estetikli kişisel portfolyo sitesi. Next.js, Framer Motion ve React Three Fiber ile inşa edilmiştir.

## Siteyi Başlatma

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

### Diğer Komutlar

```bash
npm run build   # Production build
npm run start   # Production sunucusunu başlat
npm run lint    # Kod analizi
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🎸 6 Telli İnteraktif Gitar Sistemi

Projenin merkezinde (Hero kısmında) kullanıcı ile doğrudan etkileşime geçen özel bir **6 Telli Gitar Simülasyonu** bulunmaktadır. Bu sistem sadece görsel bir şölen sunmakla kalmaz, aynı zamanda kullanıcının kaydırma (scroll) hareketiyle birlikte portfolyonun geri kalanına (Timeline) kusursuz bir geçiş yapar.

### Mimari ve Bileşenler

Sistem temel olarak 3 ana parçadan oluşur:

#### 1. `InteractiveGuitarStrings` (Ana Orkestratör)
Tüm tellerin yerleşimini, ses (AudioContext) yönetimini ve sayfa kaydırma (scroll) olaylarını dinler.
- **Ses Etkileşimi:** Kullanıcı fareyle tellerin üzerinden geçtiğinde veya tıkladığında *Narciso Yepes - Romance Anónimo* eserini çalar.
- **Kopma (Snap) Mantığı:** Kullanıcı sayfayı aşağı kaydırarak `SCROLL_BREAK_THRESHOLD` sınırını geçtiği **ilk anda** en alttaki (6.) tel anında kopar. Akıcı ve kesintisiz bir deneyim için eski "titreme ve bekleme" animasyonu tamamen kaldırılmış, kopma işlemi anlık tepkisel hale getirilmiştir.
- Yukarı geri kaydırıldığında sistem "iyileşir" (heal) ve tel orijinal gergin haline döner.

#### 2. `GuitarString` (Fizik ve Çizim Bileşeni)
Her bir telin fiziksel salınımını Framer Motion ile hesaplayıp çizer.
- Farenin çekme şiddetine (intensity) göre telin esneme ve geri sekme matematiği SVG `path`'leri üzerinde dinamik olarak hesaplanır.

#### 3. `RoadmapVine` (Kopan Tel ve Zaman Çizelgesi)
6. tel koptuğunda, geriye kalan sol ucu ekranın ortasındaki zaman çizelgesine (Timeline) düşerek portfolyo yolculuğunun (Roadmap) ta kendisi haline gelir. Bu bileşenin ardında çok detaylı bir geometri ve zamanlama matematiği yatmaktadır:

- **Matematiksel Pürüzsüzlük (C1 Continuity):** Düz kalan sağ kısımdan aşağı doğru salınan kavisli kısma geçerken oluşan keskin "V" kırılmaları önlenmiştir. Kavisin (Bezier Curve) kontrol noktaları (`cp1` ve `cp2`), giriş ve çıkış vektörlerinin teğetleri (tangent) birbirine **tam paralel (collinear)** olacak şekilde hesaplanır. Sonuç olarak kopan tel, alttaki sarmaşığa kusursuz bir S-çizgisiyle bağlanır.
- **Dinamik Kuyrukluyıldız (Comet) Senkronizasyonu:** Kullanıcı sayfayı kaydırdıkça, kopan telin üzerinde altın sarısı parlak bir ışık aşağı doğru kayar. Bu ışığın sıkıcılığı önlemek adına kopan tel üzerinde **yaklaşık 1.6 kat daha hızlı** akması sağlanmıştır (`swingEndV`).
- **Milimetrik Zamanlama (Arc Length Mapping):** Işığın çiçeğe (ilk düğüme) ulaştığı anı rastgele bir yüzdede bırakmak yerine; kopan telin bezier kavis uzunluğu (`lFallIn`) ile zaman çizelgesinin toplam uzunluğu (`lRest`) anlık olarak ölçülüp oranlanır (`R`). Böylece, kuyrukluyıldız çiçeğe **değdiği tam o milisaniyede** tel yuvaya oturur ve alttaki zaman çizelgesi gecikme olmaksızın yanmaya başlar.

Bu sayede, "Kopan Gitar Teli ➔ Portfolyo Yolculuğu" metaforu fiziksel ve görsel olarak kusursuz bir şekilde hayata geçirilmiştir.
