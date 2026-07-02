import type { TimelineEntry } from "@/components/timeline/timeline.types";

/**
 * "The Journey" — Kamer Can's real milestones, newest first.
 *
 * To add media to a card, drop a file under /public (e.g.
 * /public/projects/smarthome.jpg) and set the `media` field. Cards lazy-load
 * media only when scrolled into view.
 *
 * PHOTOS (Stack): each entry's `photos` array renders as a draggable, auto-
 * cycling photo stack on the side OPPOSITE the card (card left → photos right,
 * and vice-versa). Cards are 4:3 landscape, so landscape shots crop best. The
 * placeholders below come from /public/photos — replace them with your own files
 * (e.g. drop /public/projects/teknofest/1.jpg → "/projects/teknofest/1.jpg").
 */
export const TIMELINE: TimelineEntry[] = [
  {
    id: "staryup-hackathon",
    // Locale-neutral DD.MM.YYYY — my first-ever hackathon.
    period: "18.05.2026",
    category: "ai",
    title: {
      tr: "100 StaryUP Hackathon — İlk Hackathonum",
      en: "100 StaryUP Hackathon — My First Hackathon",
      de: "100 StaryUP Hackathon — Mein erster Hackathon",
    },
    description: {
      tr: "YTU Startup House ve Türksat Uydu Haberleşme Kablo TV ve İşletme A.Ş. iş birliğiyle, NVIDIA desteğiyle düzenlenen 100 StaryUP Hackathon'una katılarak hayatımın ilk hackathonunu gerçekleştirdim. Ekibimizle 48 saat boyunca yapay zeka tabanlı bir lojistik otomasyon çözümü geliştirdik. Bu süreçte kısıtlı zamanda çalışan bir şey üretmeyi, jüri beklentisine uygun sunum hazırlamayı ve ekip olarak bir ürün çıkarmayı öğrendim.",
      en: "I took part in the 100 StaryUP Hackathon, organized by YTU Startup House in collaboration with Türksat Satellite Communication Cable TV and Operation Inc. and supported by NVIDIA — my very first hackathon. Over 48 hours, my team and I built an AI-based logistics automation solution. Along the way I learned how to ship something that works under a tight deadline, prepare a pitch that meets the jury's expectations, and deliver a product as a team.",
      de: "Ich nahm am 100 StaryUP Hackathon teil, veranstaltet vom YTU Startup House in Zusammenarbeit mit der Türksat Satellite Communication Cable TV and Operation Inc. und unterstützt von NVIDIA — mein allererster Hackathon. Innerhalb von 48 Stunden entwickelte mein Team eine KI-basierte Lösung zur Logistikautomatisierung. Dabei lernte ich, unter knapper Zeit etwas Funktionierendes zu bauen, eine Präsentation nach den Erwartungen der Jury vorzubereiten und als Team ein Produkt abzuliefern.",
    },
    tags: ["Hackathon", "AI", "Logistics", "NVIDIA", "Teamwork"],
    href: "https://www.linkedin.com/posts/kamer-can-313412387_hackathon-yapayzeka-startup-ugcPost-7462543283257335810-QRJR/",
    photos: [
      "/timeline/staryup-hackathon/1.jpeg",
      "/timeline/staryup-hackathon/2.jpeg",
      "/timeline/staryup-hackathon/3.jpeg",
    ],
  },
  {
    id: "haneko",
    // Locale-neutral DD.MM.YYYY — the day I joined as CTO.
    period: "12.03.2026",
    category: "ai",
    title: {
      tr: "Haneko — Kurucu Ortak & CTO",
      en: "Haneko — Co-Founder & CTO",
      de: "Haneko — Mitgründer & CTO",
    },
    description: {
      tr: "Haneko'ya CTO olarak katıldım; ekiple birlikte yapay zeka uygulamaları geliştiriyoruz.",
      en: "Joined Haneko as CTO; together with the team we build artificial-intelligence applications.",
      de: "Bei Haneko als CTO eingestiegen; gemeinsam mit dem Team entwickeln wir Anwendungen für künstliche Intelligenz.",
    },
    tags: ["AI", "Leadership", "Product", "Engineering"],
    href: "https://www.linkedin.com/company/haneko/",
    photos: ["/timeline/haneko/1.png"],
  },
  {
    id: "teknofest",
    period: "2022 — 2024",
    category: "ai",
    title: {
      tr: "Teknofest Yapay Zeka — Takım Kaptanı & Üye",
      en: "Teknofest Artificial Intelligence — Team Captain & Member",
      de: "Teknofest Künstliche Intelligenz — Teamkapitän & Mitglied",
    },
    description: {
      tr: "Teknofest'in yapay zeka kategorilerinde hem takım kaptanı hem üye olarak yarıştım. Abdominal bölgede yapay zeka ile kanser tespiti yapan bir projede görev aldım. Model geliştirme ve sunumların yanında liderlik ve takım çalışması becerilerimi sahada geliştirdim.",
      en: "Competed in Teknofest's AI categories as both team captain and member. Took part in a project focused on AI-based cancer detection in the abdominal region. Alongside model development and presentations, I sharpened leadership and teamwork in the field.",
      de: "In den KI-Kategorien von Teknofest als Teamkapitän und Mitglied angetreten. Wirkte an einem Projekt zur KI-basierten Krebserkennung im Bauchraum mit. Neben Modellentwicklung und Präsentationen schärfte ich Führung und Teamarbeit in der Praxis.",
    },
    tags: ["Python", "Machine Learning", "Computer Vision", "Leadership"],
    // Placeholder set from /public/photos — swap for real Teknofest shots later.
    photos: [
      "/photos/disco-cat.png",
      "/photos/floral-1.png",
      "/photos/white-cat.png",
      "/photos/floral-2.png",
    ],
  },
  {
    id: "smarthome",
    period: "2020",
    category: "electronics",
    title: {
      tr: "Arduino Tabanlı Akıllı Ev Sistemi",
      en: "Arduino-Based Smart Home System",
      de: "Arduino-basiertes Smart-Home-System",
    },
    description: {
      tr: "Ürünün tüm tasarımını ve üretim sürecini baştan sona tek başıma gerçekleştirdim. Telefondan kontrol edilen, perde ve oda ışığını yöneten Arduino tabanlı bir akıllı ev sistemi tasarlayıp ürettim.",
      en: "I handled the entire product design and manufacturing process solo, from start to finish. I designed and built an Arduino-based smart-home system that controls curtains and room lighting via phone.",
      de: "Ich habe das gesamte Produktdesign und den Fertigungsprozess allein von Anfang bis Ende durchgeführt. Ich entwarf und baute ein Arduino-basiertes Smart-Home-System, das Vorhänge und Raumbeleuchtung per Telefon steuert.",
    },
    tags: ["Arduino", "C++", "Sensors", "IoT", "Automation"],
    // Placeholder set from /public/photos — swap for real smart-home shots later.
    photos: [
      "/photos/floral-2.png",
      "/photos/white-cat.png",
      "/photos/floral-1.png",
      "/photos/disco-cat.png",
    ],
  },
  {
    id: "deneyap",
    period: "2021 — 2023",
    category: "robotics",
    title: {
      tr: "Deneyap Atölyeleri — Robotik & Yarışmalar",
      en: "Deneyap Workshops — Robotics & Competitions",
      de: "Deneyap-Werkstätten — Robotik & Wettbewerbe",
    },
    description: {
      tr: "Deneyap Atölyeleri'nde aldığım eğitimle robot yarışmalarında ve proje sunumlarında yer aldım; tasarımdan prototiplemeye uçtan uca üretim deneyimi kazandım. Nesnelerin İnterneti (IoT), API kullanımı ve C dili gibi temel dersleri aldım.",
      en: "With the training from the Deneyap Workshops I took part in robotics competitions and project presentations, gaining end-to-end experience from design to prototyping. I took foundational courses on the Internet of Things (IoT), API usage, and the C language.",
      de: "Mit der Ausbildung der Deneyap-Werkstätten nahm ich an Roboterwettbewerben und Projektpräsentationen teil und sammelte durchgängige Erfahrung von Entwurf bis Prototyping. Ich belegte Grundlagenkurse zu Internet der Dinge (IoT), API-Nutzung und der Programmiersprache C.",
    },
    tags: ["Robotics", "Embedded", "Prototyping", "Presentations", "IoT", "C", "API"],
    photos: [
      "/timeline/deneyap/1.png",
      "/timeline/deneyap/2.png",
      "/timeline/deneyap/3.png",
    ],
  },
  {
    id: "tofd",
    period: "2022 — 2024",
    category: "social",
    title: {
      tr: "Sosyal Sorumluluk — Türkiye Omurilik Felçlileri Derneği",
      en: "Social Responsibility — Turkish Spinal Cord Injuries Association",
      de: "Soziale Verantwortung — Türkischer Verband für Querschnittsgelähmte",
    },
    description: {
      tr: "Lisede başta Türkiye Omurilik Felçlileri Derneği olmak üzere çeşitli sosyal sorumluluk projelerinde aktif rol aldım; empati odaklı, topluma dokunan çözümler üretme becerimi geliştirdim.",
      en: "In high school I actively contributed to social-responsibility projects — above all with the Turkish Spinal Cord Injuries Association — developing empathy-driven solutions that touch the community.",
      de: "In der Oberstufe engagierte ich mich in Projekten sozialer Verantwortung — allen voran beim türkischen Verband für Querschnittsgelähmte — und entwickelte empathiegetriebene Lösungen für die Gemeinschaft.",
    },
    tags: ["Volunteering", "Empathy", "Community", "Teamwork"],
    photos: ["/timeline/tofd/1.png"],
  },
  {
    id: "nft",
    // Locale-neutral DD.MM.YYYY — when I minted my first NFTs.
    period: "24.01.2022",
    category: "software",
    title: {
      tr: "İlk NFT'lerim",
      en: "My First NFTs",
      de: "Meine ersten NFTs",
    },
    description: {
      tr: "2022'nin başındaki NFT furyasına kapılıp ilk NFT'lerimi oluşturdum. Kendi koleksiyonumu mint'leyerek dijital sanat, mülkiyet ve blokzincir dünyasına ilk adımımı attım.",
      en: "Swept up in the NFT craze of early 2022, I created my first NFTs — minting my own collection and taking my first step into digital art, ownership and the blockchain world.",
      de: "Vom NFT-Hype Anfang 2022 mitgerissen, erstellte ich meine ersten NFTs — mintete meine eigene Kollektion und machte meinen ersten Schritt in die Welt der digitalen Kunst, des Eigentums und der Blockchain.",
    },
    tags: ["NFT", "Digital Art", "Blockchain", "Minting"],
    photos: [
      "/timeline/nft/2022-01-26_23.27.48.png",
      "/timeline/nft/2022-01-27_14.56.49.png",
      "/timeline/nft/2022-01-27_18.17.57.png",
      "/timeline/nft/IMG_20220128_134458_617.jpg",
      "/timeline/nft/IMG_20220128_195348_688.jpg",
    ],
  },
  {
    // Where the journey began — my very first game, built on Scratch.
    id: "little-crusoe",
    // Locale-neutral DD.MM.YYYY — the project's last update (11 Aug 2021).
    period: "11.08.2021",
    category: "software",
    title: {
      tr: "Little Crusoe — İlk Hikâye Oyunum",
      en: "Little Crusoe — My First Story Game",
      de: "Little Crusoe — Mein erstes Story-Spiel",
    },
    description: {
      tr: "Scratch'te yaptığım ilk oyun: oyuncunun kararlarına göre dallanan bir hikâye. Karakter seslendirmeleri, çok dilli arayüz, boss savaşları ve bulutta tutulan küresel oyuncu sayacıyla 1500'den fazla kod bloğuna ulaştı. Son güncellemeyi 11 Ağustos 2021'de yayınladım.",
      en: "My first-ever game, built on Scratch: a story that branches with the player's choices. With character voice acting, a multilingual interface, boss battles and a cloud-saved global player counter, it grew past 1,500 code blocks. I shipped the last update on 11 August 2021.",
      de: "Mein allererstes Spiel, entwickelt auf Scratch: eine Geschichte, die sich mit den Entscheidungen der Spieler verzweigt. Mit Charakter-Sprachausgabe, mehrsprachiger Oberfläche, Bosskämpfen und einem cloud-gespeicherten globalen Spielerzähler wuchs es auf über 1.500 Codeblöcke. Das letzte Update veröffentlichte ich am 11. August 2021.",
    },
    tags: ["Scratch", "Game Design", "Storytelling", "Boss Battles", "Cloud Data"],
    href: "https://scratch.mit.edu/projects/554880357",
    // Live public Scratch numbers. The cloud player counter is tracked in-game;
    // swap "196" for that value if you prefer it over the public view count.
    stats: [
      {
        label: { tr: "Oyuncu", en: "Players", de: "Spieler" },
        value: "196",
      },
      {
        label: { tr: "Kod bloğu", en: "Code blocks", de: "Codeblöcke" },
        value: "1500+",
      },
      {
        label: { tr: "Beğeni", en: "Loves", de: "Likes" },
        value: "14",
      },
    ],
    features: [
      {
        tr: "Oyuncunun kararlarına göre dallanan hikâye",
        en: "Story that branches with player choices",
        de: "Geschichte, die sich mit Spielerentscheidungen verzweigt",
      },
      {
        tr: "Karakter seslendirmeleri",
        en: "Character voice acting",
        de: "Charakter-Sprachausgabe",
      },
      {
        tr: "Boss savaş mekanikleri",
        en: "Boss battle mechanics",
        de: "Bosskampf-Mechaniken",
      },
    ],
    // Real comments from the Scratch project, translated faithfully per locale.
    comments: [
      {
        author: "the_only_dogepig",
        text: {
          tr: "Ben: *Sans'ı görünce* AAA EVET BUNU OYNAMALIYIM :)",
          en: "me: *sees sans* OH YES I MUST PLAY THIS :)",
          de: "ich: *sehe Sans* OH JA, DAS MUSS ICH SPIELEN :)",
        },
      },
      {
        author: "Glocke0",
        text: {
          tr: "Bölümü geçmek için kolu çevirmen gerekmesi fikrini sevdim.",
          en: "I like the idea that you need to switch the lever to get past the level.",
          de: "Mir gefällt die Idee, dass man den Hebel umlegen muss, um durch das Level zu kommen.",
        },
      },
    ],
    photos: ["/timeline/little-crusoe/1.png"],
  },
  {
    // The very first build of the journey — a mid-term-break Arduino project.
    id: "tog",
    // Locale-neutral DD.MM.YYYY.
    period: "15.01.2020",
    category: "electronics",
    title: {
      tr: "Tam Otomatik Garaj (TOG)",
      en: "Fully Automatic Garage (TOG)",
      de: "Vollautomatische Garage (TOG)",
    },
    description: {
      tr: "Ara tatilde yaptığım Arduino projesi: üstü normalde açık olan ama yağmur yağınca kapanan, 9 araçlık tam otomatik bir otopark. O zamanlar üstü açılır-kapanır bir otopark yapmak istemişim; sürgülü olmadığı için bol tork gerektiriyordu ama karar buydu. :) Araçlar girip çıkarken kapı açılır, akşam olunca ışıklar yanar, içerideki araç sayısı ekranda gösterilir.",
      en: "An Arduino project I built over the mid-term break: a fully automatic 9-car parking whose roof is normally open but closes when it rains. Back then I wanted an open/close roof — since it wasn't a sliding design it needed plenty of torque, but that was the call I made. :) The gate opens as cars enter and leave, the lights come on at night, and a display shows how many cars are inside.",
      de: "Ein Arduino-Projekt, das ich in den Halbjahresferien baute: ein vollautomatisches Parkhaus für 9 Autos, dessen Dach normalerweise offen ist, sich aber bei Regen schließt. Damals wollte ich ein öffnendes/schließendes Dach — da es kein Schiebemechanismus war, brauchte es viel Drehmoment, aber so entschied ich mich. :) Das Tor öffnet sich beim Ein- und Ausfahren, abends gehen die Lichter an, und ein Display zeigt, wie viele Autos drinnen sind.",
    },
    tags: [
      "LDR",
      "2× LED",
      "3× Servo",
      "2× Distance Sensor",
      "Water Sensor",
      "Display",
      "LCD",
      "3× Arduino",
    ],
    stats: [
      {
        label: { tr: "Kapasite", en: "Capacity", de: "Kapazität" },
        value: "9",
      },
      {
        label: { tr: "Arduino", en: "Arduino", de: "Arduino" },
        value: "3",
      },
      {
        label: { tr: "Servo motor", en: "Servo motors", de: "Servomotoren" },
        value: "3",
      },
    ],
    features: [
      {
        tr: "Araçlar girip çıkarken kapı otomatik açılır",
        en: "Gate opens automatically as cars enter and exit",
        de: "Das Tor öffnet sich automatisch beim Ein- und Ausfahren",
      },
      {
        tr: "Yağmur yağınca otoparkın üstü kapanır",
        en: "Roof closes automatically when it rains",
        de: "Das Dach schließt sich bei Regen automatisch",
      },
      {
        tr: "Akşam olunca ışıklar yanar (LDR)",
        en: "Lights turn on at night (LDR)",
        de: "Abends gehen die Lichter an (LDR)",
      },
      {
        tr: "Ekran içerideki araç sayısını gösterir",
        en: "A display shows the number of cars inside",
        de: "Ein Display zeigt die Anzahl der Autos im Inneren",
      },
      {
        tr: "Bir LCD ismimi gösterir",
        en: "An LCD shows my name",
        de: "Ein LCD zeigt meinen Namen",
      },
    ],
    photos: [
      "/timeline/tog/20200127_124852.jpg",
      "/timeline/tog/20200127_124855.jpg",
      "/timeline/tog/20200127_124906.jpg",
    ],
  },
];
