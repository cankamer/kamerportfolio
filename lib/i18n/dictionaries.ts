import type { Locale } from "./config";

/**
 * UI string dictionary. `en` is the canonical shape; `tr` and `de` are typed
 * against it so a missing key is a compile error. Content data (projects) lives
 * in lib/data/timeline.ts with its own per-language fields.
 */

/**
 * Current class/year, derived from the date so it advances on its own.
 * The 1st year begins on 1 July 2026; every subsequent 1 July moves up a class
 * (0 = prep year, 1 = first year, 2 = second year, …).
 */
function classYearNumber(now = new Date()): number {
  const FIRST_YEAR_START = 2026;
  const afterJuly1 = now.getMonth() >= 6; // month index 6 === July
  const startYear = afterJuly1 ? now.getFullYear() : now.getFullYear() - 1;
  return startYear - (FIRST_YEAR_START - 1);
}

function enOrdinal(n: number): string {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffix[(v - 20) % 10] ?? suffix[v] ?? suffix[0]}`;
}

/** Localised class label, e.g. "1st Year" / "1. Sınıf" / "1. Studienjahr". */
function classYearLabel(locale: Locale): string {
  const n = classYearNumber();
  if (n <= 0) {
    return { en: "Prep Year", tr: "Hazırlık", de: "Vorbereitungsjahr" }[locale];
  }
  if (locale === "tr") return `${n}. Sınıf`;
  if (locale === "de") return `${n}. Studienjahr`;
  return `${enOrdinal(n)} Year`;
}

export interface Dictionary {
  nav: {
    about: string;
    journey: string;
    skills: string;
    hub: string;
    contact: string;
  };
  hero: {
    eyebrow: string;
    titleA: string;
    titleEmphasis1: string;
    titleB: string;
    titleEmphasis2: string;
    subtitle: string;
    scrollCue: string;
    strumHint: string;
  };
  gate: {
    welcome: string;
    enter: string;
    diveIn: string;
    available: string;
  };
  intro: {
    scrollCue: string;
  };
  about: {
    eyebrow: string;
    title: string;
    lead: string;
    body: string[];
    facts: { label: string; value: string }[];
    marquee: string;
  };
  timeline: {
    eyebrow: string;
    title: string;
    explore: string;
    highlights: string;
    features: string;
    comments: string;
  };
  categories: {
    ai: string;
    design: string;
    electronics: string;
    robotics: string;
    social: string;
    software: string;
  };
  skills: {
    eyebrow: string;
    title: string;
    groups: { title: string; items: string[] }[];
  };
  hub: {
    eyebrow: string;
    title: string;
    contributions: string;
    placeholderNote: string;
  };
  contact: {
    title: string;
    line: string;
  };
  game: {
    controls: string;
    won: string;
    wonNote: string;
    lost: string;
    lostNote: string;
    retry: string;
  };
  footer: {
    built: string;
    backToTop: string;
  };
  switcher: {
    aria: string;
  };
}

const en: Dictionary = {
  nav: {
    about: "About",
    journey: "Journey",
    skills: "Skills",
    hub: "Hub",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Computer Engineering Student",
    titleA: "Hello,",
    titleEmphasis1: "I'm",
    titleB: "",
    titleEmphasis2: "Kamer Can",
    subtitle:
      "I'm Kamer Can — building at the seam of artificial intelligence, electronics and software, with a belief that technology should serve people.",
    scrollCue: "Descend",
    strumHint: "Pluck the strings to play the song",
  },
  gate: {
    welcome: "Welcome to my portfolio",
    enter: "Turn the key to enter",
    diveIn: "Dive In",
    available: "Available for work",
  },
  intro: {
    scrollCue: "Scroll to begin",
  },
  about: {
    eyebrow: "About",
    title: "Engineer, Maker & Team Lead",
    lead:
      "A Computer Engineering student at Yıldız Technical University who turned an early curiosity for technology into hands-on practice.",
    body: [
      "I have competed in Teknofest's artificial-intelligence categories as both a team captain and a member — experiences that sharpened my leadership and teamwork. By combining what I learned in software and hardware, I built Arduino-based smart-home systems.",
      "Through training at the Deneyap Workshops I took part in robotics competitions and project presentations. I see technology not merely as something that keeps advancing, but as a force that can solve problems and touch lives for the better.",
      "With that vision, in high school I took an active role in social-responsibility projects — above all with the Turkish Spinal Cord Injuries Association — strengthening my ability to build empathy-driven solutions. In my free time I play the guitar, which keeps my mind rested and my creativity flowing.",
    ],
    facts: [
      { label: "University", value: "Yıldız Technical University" },
      { label: "Program", value: `Computer Engineering (${classYearLabel("en")})` },
      { label: "Focus", value: "AI · Embedded · Robotics" },
      { label: "Off-hours", value: "Guitar" },
    ],
    marquee: "Creative Technologist ✦ UI/UX Architect ✦ Roses ✦ Marble ✦ Gold ✦",
  },
  timeline: {
    eyebrow: "The Journey",
    title: "Me and What I've Made",
    explore: "Explore",
    highlights: "Highlights",
    features: "Features",
    comments: "What players said",
  },
  categories: {
    ai: "Artificial Intelligence",
    design: "Design",
    electronics: "Electronics / IoT",
    robotics: "Robotics",
    social: "Social Impact",
    software: "Software",
  },
  skills: {
    eyebrow: "Skills",
    title: "What I've Learned",
    groups: [
      { title: "Artificial Intelligence", items: ["Machine Learning", "Computer Vision", "Python", "Teknofest AI"] },
      { title: "Electronics & Embedded", items: ["Arduino", "Sensors & Actuators", "Smart Home / IoT", "Circuit Design"] },
      { title: "Robotics", items: ["Autonomous Robots", "Deneyap Workshops", "Competitions", "Prototyping"] },
      { title: "Software", items: ["C / C++", "Python", "Git & GitHub", "Web (Next.js)"] },
      { title: "Leadership", items: ["Team Captaincy", "Teamwork", "Presentations", "Social Responsibility"] },
    ],
  },
  hub: {
    eyebrow: "The Hub",
    title: "When I'm Not Touching Grass",
    contributions: "contributions",
    placeholderNote: "scroll to play ↓",
  },
  contact: {
    title: "Let's create something timeless",
    line: "Open to collaborations, internships and ambitious ideas.",
  },
  game: {
    controls: "← → / space",
    won: "You did it",
    wonNote: "you cleared the whole fleet",
    lost: "Game Over",
    lostNote: "the fleet reached your ship",
    retry: "try again",
  },
  footer: {
    built: "Designed & built with baroque restraint.",
    backToTop: "back to top",
  },
  switcher: {
    aria: "Change language",
  },
};

const tr: Dictionary = {
  nav: {
    about: "Hakkımda",
    journey: "Yolculuk",
    skills: "Yetenekler",
    hub: "Merkez",
    contact: "İletişim",
  },
  hero: {
    eyebrow: "Bilgisayar Mühendisliği Öğrencisi",
    titleA: "Merhaba,",
    titleEmphasis1: "Ben",
    titleB: "",
    titleEmphasis2: "Kamer Can",
    subtitle:
      "Ben Kamer Can — yapay zeka, elektronik ve yazılımın kesiştiği noktada üretiyorum; teknolojinin insana hizmet etmesi gerektiğine inanıyorum.",
    scrollCue: "Aşağı in",
    strumHint: "Şarkıyı çalmak için tellere dokun",
  },
  gate: {
    welcome: "Portfolyoma hoş geldiniz",
    enter: "Girmek için anahtarı çevir",
    diveIn: "Keşfet",
    available: "Çalışmaya açık",
  },
  intro: {
    scrollCue: "Başlamak için kaydır",
  },
  about: {
    eyebrow: "Hakkımda",
    title: "Mühendis, Üretici & Takım Lideri",
    lead:
      "Yıldız Teknik Üniversitesi Bilgisayar Mühendisliği öğrencisiyim; teknolojiye duyduğum ilgiyi erken yaşta pratiğe döktüm.",
    body: [
      "Teknofest'te yapay zeka kategorilerinde hem takım kaptanı hem de üye olarak aktif rol aldım; bu sayede liderlik ve takım çalışması becerilerimi geliştirdim. Öğrendiğim yazılım ve donanım bilgilerini birleştirerek Arduino tabanlı akıllı ev sistemleri yaptım.",
      "Deneyap Atölyeleri'nde aldığım eğitimle robot yarışmalarında ve proje sunumlarında yer aldım. Teknolojiyi yalnızca sürekli ilerleyen bir yapı olarak değil, toplumun faydasına dokunabilen, çözüm sunan bir unsur olarak görüyorum.",
      "Bu vizyonla lisede başta Türkiye Omurilik Felçlileri Derneği olmak üzere çeşitli sosyal sorumluluk projelerinde aktif rol alarak empati odaklı çözüm üretme becerimi artırdım. Boş zamanlarımda gitar çalarak ruhuma yaratıcılık katıyor, zihnimi dinlendiriyorum.",
    ],
    facts: [
      { label: "Üniversite", value: "Yıldız Teknik Üniversitesi" },
      { label: "Bölüm", value: `Bilgisayar Mühendisliği (${classYearLabel("tr")})` },
      { label: "Odak", value: "Yapay Zeka · Gömülü · Robotik" },
      { label: "Boş zaman", value: "Gitar" },
    ],
    marquee: "Yaratıcı Teknolog ✦ UI/UX Mimarı ✦ Güller ✦ Mermer ✦ Altın ✦",
  },
  timeline: {
    eyebrow: "Yolculuk",
    title: "Ben ve Yaptıklarım",
    explore: "İncele",
    highlights: "Öne Çıkanlar",
    features: "Özellikler",
    comments: "Oyuncular ne dedi",
  },
  categories: {
    ai: "Yapay Zeka",
    design: "Tasarım",
    electronics: "Elektronik / IoT",
    robotics: "Robotik",
    social: "Sosyal Etki",
    software: "Yazılım",
  },
  skills: {
    eyebrow: "Yetenekler",
    title: "Neler Öğrendim",
    groups: [
      { title: "Yapay Zeka", items: ["Makine Öğrenmesi", "Bilgisayarlı Görü", "Python", "Teknofest YZ"] },
      { title: "Elektronik & Gömülü", items: ["Arduino", "Sensör & Aktüatör", "Akıllı Ev / IoT", "Devre Tasarımı"] },
      { title: "Robotik", items: ["Otonom Robotlar", "Deneyap Atölyeleri", "Yarışmalar", "Prototipleme"] },
      { title: "Yazılım", items: ["C / C++", "Python", "Git & GitHub", "Web (Next.js)"] },
      { title: "Liderlik", items: ["Takım Kaptanlığı", "Takım Çalışması", "Sunum", "Sosyal Sorumluluk"] },
    ],
  },
  hub: {
    eyebrow: "Hub",
    title: "Çimene Dokunmadığım Zamanlar",
    contributions: "katkı",
    placeholderNote: "oynamak için kaydır ↓",
  },
  contact: {
    title: "Birlikte zamansız bir şey yaratalım",
    line: "İş birliklerine, stajlara ve iddialı fikirlere açığım.",
  },
  game: {
    controls: "← → / boşluk",
    won: "Başardın",
    wonNote: "tüm filoyu temizledin",
    lost: "Oyun Bitti",
    lostNote: "filo gemine ulaştı",
    retry: "tekrar dene",
  },
  footer: {
    built: "Barok bir sadelikle tasarlandı ve geliştirildi.",
    backToTop: "başa dön",
  },
  switcher: {
    aria: "Dili değiştir",
  },
};

const de: Dictionary = {
  nav: {
    about: "Über mich",
    journey: "Werdegang",
    skills: "Fähigkeiten",
    hub: "Hub",
    contact: "Kontakt",
  },
  hero: {
    eyebrow: "Informatikstudent",
    titleA: "Hallo,",
    titleEmphasis1: "ich bin",
    titleB: "",
    titleEmphasis2: "Kamer Can",
    subtitle:
      "Ich bin Kamer Can — ich arbeite an der Schnittstelle von künstlicher Intelligenz, Elektronik und Software, überzeugt davon, dass Technik den Menschen dienen soll.",
    scrollCue: "Hinabsteigen",
    strumHint: "Zupfe die Saiten, um das Lied zu spielen",
  },
  gate: {
    welcome: "Willkommen in meinem Portfolio",
    enter: "Drehe den Schlüssel zum Eintreten",
    diveIn: "Entdecken",
    available: "Offen für Projekte",
  },
  intro: {
    scrollCue: "Zum Beginnen scrollen",
  },
  about: {
    eyebrow: "Über mich",
    title: "Ingenieur, Macher & Teamleiter",
    lead:
      "Informatikstudent an der Yıldız Technical University, der seine frühe Neugier für Technik konsequent in die Praxis umsetzt.",
    body: [
      "Bei Teknofest habe ich in den KI-Kategorien sowohl als Teamkapitän als auch als Mitglied mitgewirkt — Erfahrungen, die meine Führungs- und Teamfähigkeit geschärft haben. Aus der Verbindung von Software und Hardware sind Arduino-basierte Smart-Home-Systeme entstanden.",
      "Durch die Ausbildung in den Deneyap-Werkstätten nahm ich an Roboterwettbewerben und Projektpräsentationen teil. Technik sehe ich nicht nur als etwas stetig Fortschreitendes, sondern als Kraft, die Probleme löst und das Leben der Menschen verbessern kann.",
      "Mit dieser Vision engagierte ich mich in der Oberstufe in Projekten sozialer Verantwortung — allen voran beim türkischen Verband für Querschnittsgelähmte — und stärkte so meine Fähigkeit, empathiegetriebene Lösungen zu entwickeln. In meiner Freizeit spiele ich Gitarre, was meinen Geist erholt und meine Kreativität nährt.",
    ],
    facts: [
      { label: "Universität", value: "Yıldız Technical University" },
      { label: "Studiengang", value: `Informatik (${classYearLabel("de")})` },
      { label: "Fokus", value: "KI · Embedded · Robotik" },
      { label: "Freizeit", value: "Gitarre" },
    ],
    marquee: "Kreativer Technologe ✦ UI/UX-Architekt ✦ Rosen ✦ Marmor ✦ Gold ✦",
  },
  timeline: {
    eyebrow: "Der Werdegang",
    title: "Ich und Was Ich Gemacht Habe",
    explore: "Entdecken",
    highlights: "Highlights",
    features: "Funktionen",
    comments: "Was Spieler sagten",
  },
  categories: {
    ai: "Künstliche Intelligenz",
    design: "Design",
    electronics: "Elektronik / IoT",
    robotics: "Robotik",
    social: "Soziale Wirkung",
    software: "Software",
  },
  skills: {
    eyebrow: "Fähigkeiten",
    title: "Was Ich Gelernt Habe",
    groups: [
      { title: "Künstliche Intelligenz", items: ["Maschinelles Lernen", "Computer Vision", "Python", "Teknofest KI"] },
      { title: "Elektronik & Embedded", items: ["Arduino", "Sensoren & Aktoren", "Smart Home / IoT", "Schaltungsentwurf"] },
      { title: "Robotik", items: ["Autonome Roboter", "Deneyap-Werkstätten", "Wettbewerbe", "Prototyping"] },
      { title: "Software", items: ["C / C++", "Python", "Git & GitHub", "Web (Next.js)"] },
      { title: "Führung", items: ["Teamkapitän", "Teamarbeit", "Präsentationen", "Soziale Verantwortung"] },
    ],
  },
  hub: {
    eyebrow: "Der Hub",
    title: "Wenn ich mal kein Gras berühre",
    contributions: "Beiträge",
    placeholderNote: "zum Spielen scrollen ↓",
  },
  contact: {
    title: "Lass uns etwas Zeitloses schaffen",
    line: "Offen für Kooperationen, Praktika und ambitionierte Ideen.",
  },
  game: {
    controls: "← → / Leertaste",
    won: "Geschafft",
    wonNote: "du hast die ganze Flotte besiegt",
    lost: "Spiel vorbei",
    lostNote: "die Flotte hat dein Schiff erreicht",
    retry: "nochmal",
  },
  footer: {
    built: "Mit barocker Zurückhaltung gestaltet und gebaut.",
    backToTop: "nach oben",
  },
  switcher: {
    aria: "Sprache ändern",
  },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { tr, en, de };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
