// Every claim on this page is backed by something real: code on disk, a public repo,
// Kamer's own README, a live page or a photo. If you can't point at the source, don't add it.

export const LINKS = {
  github: 'https://github.com/cankamer',
  linkedin: 'https://www.linkedin.com/in/cankamer/',
  instagram: 'https://www.instagram.com/crusoe.msc/',
  leetcode: 'https://leetcode.com/u/kamercan0',
  email: 'mailto:kamercan.eng@gmail.com',
  haneko: 'https://www.haneko.co/',
  hanekoLinkedin: 'https://www.linkedin.com/company/haneko/',
  hanekoInstagram: 'https://www.instagram.com/haneko.app/',
  tab2share: 'https://github.com/cankamer/Tab2Share',
  wraith: 'https://github.com/cankamer/Wraith-W75-Profile-Changer',
  docu: 'https://github.com/cankamer/docu-skill',
  goruntu: 'https://github.com/cankamer/goruntu-isleme',
  scratch: 'https://scratch.mit.edu/projects/554880357',
  hackathon: 'https://www.linkedin.com/posts/kamer-can-313412387_hackathon-yapayzeka-startup-ugcPost-7462543283257335810-QRJR/',
};

const ext = (href, label, primary = false) => ({ href, label, primary });

export const SECTIONS = [
  {
    id: 'about',
    accent: '#848B74',
    kicker: 'About',
    title: 'Hey, I’m *Kamer.*',
    lead:
      'I’m a first-year Computer Engineering student at Yıldız Technical University. I like building things where software meets the physical world or AI.',
    blocks: [
      {
        type: 'profile',
        img: '/media/avatar.jpg',
        text: 'This page is a map of what’s in my head: code, a guitar, an underwater vehicle, Arduinos on a shelf. All of it comes from the same curiosity, and there’s a real project behind each part.',
      },
      {
        type: 'facts',
        items: [
          ['School', 'YTU · Computer Engineering'],
          ['Now', 'Co-founder & CTO at Haneko'],
          ['Communities', 'GDG on Campus YTU · YTU CASMarine'],
          ['Free time', 'Guitar, making games, design'],
        ],
      },
      { type: 'h', text: 'Journey' },
      {
        type: 'timeline',
        items: [
          ['Now', 'Haneko', 'Co-founder and CTO of the startup we started with friends.'],
          ['2026', '100 StaryUP Hackathon', 'An AI-powered logistics automation prototype in 48 hours.'],
          ['2022 — 2024', 'Teknofest Artificial Intelligence', 'First team captain, then a member. A project on cancer detection with computer vision.'],
          ['2021', 'Little Crusoe', 'My first big game, made in Scratch.'],
        ],
      },
      { type: 'p', text: 'I volunteered at the Turkish Spinal Cord Paralytics Association.' },
      { type: 'h', text: 'Get in touch' },
      {
        type: 'links',
        items: [
          ext(LINKS.email, 'kamercan.eng@gmail.com', true),
          ext(LINKS.linkedin, 'LinkedIn'),
          ext(LINKS.github, 'GitHub'),
          ext(LINKS.instagram, 'Instagram'),
          ext(LINKS.leetcode, 'LeetCode'),
        ],
      },
    ],
  },

  {
    id: 'software',
    accent: '#3f6680',
    kicker: 'Software',
    title: 'I write tools for *my own itch.*',
    lead:
      'Most of my projects started because something I use every day was missing a feature. I write each one in whichever language fits the job best: Rust, C#, Kotlin, Python, TypeScript.',
    blocks: [
      {
        type: 'cards',
        expand: true,
        items: [
          {
            title: 'Tab2Share',
            shots: [['/media/tab2share-editor.jpg', 'Editor: tab, notation and the chord wheel'], ['/media/tab2share-export.png', 'Export: a transparent PNG for Reels, TikTok and Shorts']],
            meta: 'Tauri · React · Rust',
            text: 'A desktop tab and chord editor for guitarists. It exports your tab as a transparent PNG you can lay over Reels, TikTok and Shorts videos.',
            tags: ['TypeScript', 'React', 'Rust', 'Tauri 2'],
            href: LINKS.tab2share,
          },
          {
            title: 'CrusoeLight',
            shots: [['/media/projects/crusoelight-dashboard.webp', 'Dashboard: zones, presets, Ambilight and music'], ['/media/projects/crusoelight-alerts.webp', 'Alerts: Claude Code hook events turned into light signals'], ['/media/projects/crusoelight-effects.webp', 'Effects: build an animation, preview it live, send it to any zone'], ['/media/projects/crusoelight-applications.webp', 'Applications: lighting that follows the app in front'], ['/media/projects/crusoelight-keyboard.webp', 'Keyboard: scenes for the Wraith W75, at most 10 writes a day']],
            meta: 'Tauri · Rust · React',
            text: 'A Windows app that drives the WLED LED strips in my room by context: zones, effects and alerts coming from Claude Code hooks. Every lighting request goes through one orchestrator by priority.',
            tags: ['Rust', 'React', 'WLED', 'UDP'],
          },
          {
            title: 'DragWheel',
            meta: 'C# · WPF',
            text: 'A file converter that works while you drag: grab a file, tap a key, drop it on a slice of the wheel. Image, video, audio, PDF, document, spreadsheet, subtitle and archive formats. Everything stays on the computer; nothing goes to the internet.',
            shots: [['/media/projects/dragwheel-convert.webp', 'Convert wheel: pick the format for the file you are dragging'], ['/media/projects/dragwheel-tools.webp', 'Tools wheel: resize, compress, rotate, grayscale, zip'], ['/media/projects/dragwheel-actions.webp', 'Actions wheel: share, copy, move, copy path, open a terminal'], ['/media/projects/dragwheel-settings.webp', 'Settings: a key for each wheel, output folder, theme']],
            tags: ['C#', 'WPF', 'Windows'],
          },
          {
            title: 'Wraith W75 Profile Changer',
            meta: 'Python · USB HID',
            text: 'My keyboard kept its profiles in the browser, so every time I started a game I had to open the site and pick a profile by hand. I wrote a tray app that records a profile switch once and replays it over USB HID depending on the focused app.',
            shots: [['/media/projects/wraith-settings.webp', 'Settings: the apps that switch the keyboard to its Game profile, and the two recorded profiles']],
            tags: ['Python', 'USB HID'],
            href: LINKS.wraith,
          },
          {
            title: 'Beyaz Beton',
            meta: 'Flutter · Dart',
            text: 'Live positions, arrival times and crowding estimates for Istanbul’s Metrobus. The data comes from IBB/IETT open data. There is no server behind the phone app; to stay inside IETT’s limit of roughly 100 requests per hour it uses a request budget and back-off logic.',
            shots: [['/media/projects/beyazbeton-live.webp', 'Live: the plate to wait for, and a crowding estimate for each incoming bus'], ['/media/projects/beyazbeton-start.webp', 'Start: find your stop by location, or pick it yourself'], ['/media/projects/beyazbeton-stops.webp', 'Stops along the line, with the routes that call at each']],
            tags: ['Flutter', 'Dart', 'Open data'],
          },
          {
            title: 'Relax Eye',
            meta: 'Electron · PowerShell',
            text: 'An app that gently dims the screen like a blink at set intervals to remind you to rest your eyes. It lowers the system volume while dimming and stays out of the way when a competitive game is running.',
            shots: [['/media/projects/relaxeye-closing.webp', 'The break: the screen closes like an eyelid'], ['/media/projects/relaxeye-resting.webp', 'Rest: a 20-second countdown, then the eyes open again'], ['/media/projects/relaxeye-settings.webp', 'Settings: interval, break length, and apps to leave alone']],
            tags: ['Electron', 'Node.js', 'Windows Core Audio'],
          },
          {
            title: 'Defter',
            meta: 'Kotlin · Compose',
            text: 'An S Pen-first note app for the Galaxy Tab S10 FE, with a course archive and timetable built in. The pen feel matters a lot to me, so I wrote it natively on purpose.',
            shots: [['/media/projects/defter-home.webp', 'Today: the class in progress, the day’s timetable and course folders'], ['/media/projects/defter-pen.webp', 'A page: pen strokes in colour, plus a text box'], ['/media/projects/defter-schedule.webp', 'Timetable: tap to edit a class, long-press to open its folder']],
            tags: ['Kotlin', 'Jetpack Compose', 'androidx.ink'],
          },
          {
            title: 'Rose Mary Studio',
            meta: 'Python · Whisper',
            text: 'A tool I wrote for my videos: from a voice recording it produces a talking cat character and word-by-word animated karaoke subtitles.',
            shots: [['/media/projects/rosemary-home.webp', 'The studio: the cat, a live mic test and the output settings']],
            tags: ['Python', 'faster-whisper', 'OpenCV', 'ffmpeg'],
          },
          {
            title: 'docu-skill',
            meta: 'JavaScript',
            text: 'An AI skill that generates and keeps a living DESIGN.md for app projects. It works with tools like Claude Code, Cursor and Windsurf.',
            shots: [['/media/projects/docu-install.webp', 'Install: one command puts the skill into your AI assistant'], ['/media/projects/docu-skill.webp', 'Inside SKILL.md: the structure every DESIGN.md follows']],
            tags: ['JavaScript', 'CLI', 'AI'],
            href: LINKS.docu,
          },
        ],
      },
      { type: 'h', text: 'What I use, with the projects' },
      {
        type: 'p',
        text: 'Only technologies I have actually built projects with are listed here, next to the projects that used them.',
      },
      {
        type: 'stack',
        items: [
          ['TypeScript · React', 'Tab2Share, CrusoeLight, Haneko'],
          ['Rust (Tauri)', 'Tab2Share, CrusoeLight'],
          ['Python', 'Wraith W75, Rose Mary Studio, CASMarine'],
          ['C# · WPF', 'DragWheel'],
          ['Kotlin · Compose', 'Defter'],
          ['Dart · Flutter', 'Beyaz Beton'],
          ['Node.js · Express', 'Haneko backend'],
          ['Electron', 'Relax Eye'],
          ['OpenCV', 'CASMarine image processing'],
          ['Unreal Engine 5', 'BlindMaw, The Mask'],
          ['C++', 'LeetCode solutions, Unreal'],
          ['Remotion', 'Haneko promo videos'],
        ],
      },
      { type: 'links', items: [ext(LINKS.github, 'See it on GitHub', true)] },
    ],
  },

  {
    id: 'haneko',
    accent: '#652fe7',
    kicker: 'Startup',
    title: '*Haneko*',
    lead:
      'Haneko is the startup I co-founded with friends: a platform that pairs small companies with the finance professionals (SMMM/YMM) who handle their tax, finance and payroll. As co-founder and CTO I build the product.',
    blocks: [
      { type: 'img', src: '/media/haneko-mark.svg', alt: 'Haneko logo: a cat wearing headphones', caption: 'Haneko’s logo: a cat with headphones.' },
      { type: 'h', text: 'What I built' },
      {
        type: 'cards',
        items: [
          {
            title: 'The web app',
            meta: 'Next.js 16 · React 19',
            text: 'Three dashboards for three roles (company, finance professional, admin), with access checked in three layers. The interface comes in five languages, and a check before every build keeps them in sync.',
          },
          {
            title: 'Backend and database',
            meta: 'Express · Supabase · PostgreSQL',
            text: 'An Express API over PostgreSQL with row-level security on every table and a main schema of about 3,700 lines. Scheduled jobs run as their own process: refunding stuck credits, retrying invoices, clean-ups and an encrypted nightly backup.',
          },
          {
            title: 'Regulation search',
            meta: 'RAG · pgvector',
            text: 'Answers with sources from 121 Turkish tax-law articles. The question is expanded, searched by meaning and by Turkish full text, the two result lists are merged, and an LLM picks the best five. Any stage can fail without taking the rest down.',
          },
          {
            title: 'Health score and profit projection',
            meta: 'Node.js',
            text: 'A score built from a company’s financial history, compliance deadlines and roadmap progress. The issues it finds can become a roadmap task or an alert for the finance professional.',
          },
          {
            title: 'Payments, invoices and payroll',
            meta: 'iyzico · GIB e-Archive',
            text: 'Credit and subscription payments over iyzico, e-Archive invoices to GIB, and payroll kept per period: gross, net, bonus, meal and benefits.',
          },
          {
            title: 'Analytics and onboarding',
            meta: 'No cookies',
            text: 'Our own site analytics without third-party tools or cookies, and a short product tour with a first-steps list for new users.',
          },
          {
            title: 'The mobile app',
            meta: 'Flutter',
            text: 'There was also a Flutter mobile app. In October 2026 we dropped it to put everything into the web.',
          },
        ],
      },
      { type: 'widget', name: 'health' },
      {
        type: 'p',
        text: 'One rule runs through all of it: AI serves the <strong>finance professional</strong>, not the company. It speeds up their work and puts easily missed risks in front of them; a suggestion only reaches the company after the professional approves it.',
      },
      {
        type: 'tags',
        items: ['Next.js 16', 'React 19', 'Tailwind v4', 'Express', 'Supabase', 'PostgreSQL', 'pgvector', 'RAG', 'iyzico', 'GIB e-Archive', 'Remotion'],
      },
      {
        type: 'links',
        items: [ext(LINKS.haneko, 'haneko.co', true), ext(LINKS.hanekoLinkedin, 'LinkedIn'), ext(LINKS.hanekoInstagram, 'Instagram')],
      },
    ],
  },

  {
    id: 'guitar',
    accent: '#a3402a',
    kicker: 'Music',
    title: 'Guitar and *code*.',
    lead:
      'I play guitar and share what I play as short videos on Instagram. I also write the tools I need for making those videos.',
    blocks: [
      { type: 'h', text: 'Instagram' },
      {
        type: 'p',
        text: `My account is <a href="${LINKS.instagram}" target="_blank" rel="noopener"><strong>@crusoe.msc</strong></a>. I post the pieces I play and my guitar videos there.`,
      },
      { type: 'h', text: 'Code I wrote for music' },
      {
        type: 'p',
        text: 'Showing tabs in videos was a chore, so I wrote <strong>Tab2Share</strong>: a desktop tab and chord editor for guitarists. You write the tab and export it as a transparent PNG to lay over your video.',
      },
      { type: 'img', src: '/media/tab2share-editor.jpg', alt: 'Tab2Share editor showing a tab, standard notation and the fretboard', caption: 'The editor: tab, standard notation and fretboard.' },
      { type: 'img', src: '/media/tab2share-export.png', alt: 'A tab image exported from Tab2Share', caption: 'An exported tab image, ready to lay over a video.' },
      {
        type: 'cards',
        mini: true,
        items: [
          { title: 'Tab and notation', text: 'Vector tab drawing that shows techniques like bend, vibrato, slide and palm mute; standard notation and measure marks.' },
          { title: 'Chord wheel', text: 'A circular picker with 30+ ready chords and a chord diagram that opens on hover.' },
          { title: 'Export for Reels, TikTok, Shorts', text: 'Transparent PNG output to overlay on a video.' },
          { title: 'Playback and listen-to-tab', text: 'Playback with real guitar samples, a metronome and an experiment in transcribing tabs by listening through the microphone.' },
        ],
      },
      {
        type: 'links',
        items: [ext(LINKS.instagram, '@crusoe.msc', true), ext(LINKS.tab2share, 'Tab2Share')],
      },
    ],
  },

  {
    id: 'rov',
    accent: '#2e7a7a',
    kicker: 'Underwater',
    title: 'CASMarine',
    lead:
      'CASMarine, under IEEE CAS at YTU, is a team building an uncrewed underwater vehicle (ROV). I’m on the communications side, working with UART, UDP and TCP.',
    blocks: [
      { type: 'h', text: 'Core team period' },
      { type: 'sub', text: 'High-level software' },
      { type: 'titles', items: ['Underwater image enhancement', 'Fish detection', 'Text counting', 'Buoy and line tracking', 'Simulation'] },
      {
        type: 'p',
        text: 'Underwater is a hard environment for image processing: light fades quickly with depth, red disappears first, and turbidity eats contrast. Before the vehicle’s camera can see anything useful, the image has to be cleaned up.',
      },
      { type: 'widget', name: 'enhance' },
      { type: 'tags', items: ['Python', 'OpenCV', 'NumPy', 'UDP', 'Unity simulation', 'ROV'] },
      { type: 'links', items: [ext(LINKS.goruntu, 'My assignments on GitHub', true)] },
      { type: 'sub', text: 'Electronics' },
      { type: 'img', src: '/media/pcb-3d.png', alt: '3D render of the circuit board I designed in Altium Designer', caption: 'The board I designed, in Altium Designer’s 3D view.' },
      {
        type: 'p',
        text: 'I was also in the electronics unit, where I designed this board in Altium Designer. It’s built around an STM32F303RCT6 microcontroller (LQFP-64) and powered from a mini-USB port through an AMS1117-3.3 regulator. It has an 8 MHz crystal, eight 1 mm JST SH 8-pin connectors, a UART5 port, SWD programming pins, status LEDs and tactile buttons.',
      },
    ],
  },

  {
    id: 'games',
    accent: '#9b4a6e',
    kicker: 'Games',
    title: 'I *make* games.',
    lead:
      'I started making games with Scratch and today I build prototypes in Unreal Engine 5. It’s the most fun place where code, design and story are all needed at once. The main character is the same in both of my games: Crusoe.',
    blocks: [
      { type: 'widget', name: 'runner' },
      { type: 'h', text: 'Little Crusoe · 2021' },
      { type: 'img', src: '/media/little-crusoe.jpg', alt: 'A frame from the game Little Crusoe', caption: 'Little Crusoe, Scratch.' },
      {
        type: 'p',
        text: 'My first big game in Scratch: a 9-level platform adventure with Crusoe, his father and his grandfather. There’s also a boss fight against Sans. It has Turkish/English language selection, weapon and magazine mechanics, a health bar, text-to-speech with character voices and a joystick for mobile. It keeps count of how many times each language was picked in cloud variables.',
      },
      {
        type: 'stats',
        items: [
          ['1,666', 'code blocks'],
          ['198', 'views'],
          ['14', 'likes'],
        ],
      },
      { type: 'h', text: 'Unreal Engine 5' },
      {
        type: 'cards',
        items: [
          {
            title: 'BlindMaw',
            meta: 'UE5 · Prototype',
            text: 'A lobby-based, role-driven multiplayer prototype. The player character is Crusoe, facing a creature called the Crusoe Beast; each has its own animation set. A pistol collected piece by piece on the map (barrel, body, magazine, slide, trigger) and a bell mechanic are in.',
            tags: ['Unreal Engine 5', 'Blueprint', 'C++', 'Multiplayer'],
          },
          {
            title: 'The Mask',
            meta: 'UE5 · Prototype',
            text: 'An action prototype set in ancient temple ruins: a mask-hunter character, a katana, draw and sheathe animations, enemies, a demon mask, a day cycle and a main menu.',
            tags: ['Unreal Engine 5', 'Blueprint', 'Animation'],
          },
        ],
      },
      { type: 'links', items: [ext(LINKS.scratch, 'Play Little Crusoe', true)] },
    ],
  },

  {
    id: 'design',
    accent: '#9a7420',
    kicker: 'Design',
    title: 'Design',
    lead:
      'How something looks after I build it matters to me too.',
    blocks: [
      {
        type: 'gallery',
        tall: true,
        items: [
          ['/media/mezun-afis.jpg', 'Mezun Yıldızlar · Event poster'],
          ['/media/haneko-ekran.jpg', 'Haneko · "Our screen" visual'],
          ['/media/skeleton-hand.jpg', 'Illustration · skeleton hand with roses and ivy'],
          ['/media/integral-roses.webp', 'Illustration · an integral sign grown out of roses, drawn in Defter'],
          ['/media/moon-potato.webp', 'Illustration · a potato on the moon'],
        ],
      },
      { type: 'h', text: 'My logo' },
      { type: 'widget', name: 'logo' },
      { type: 'h', text: 'Haneko design system' },
      {
        type: 'p',
        text: 'Haneko’s design system is documented in DESIGN.md files for the web app and the mobile app. It’s built on <strong style="color: #652fe7">Insight Purple (#652fe7)</strong> with Inter for type, soft off-white and off-black surfaces instead of pure white or black, a full dark theme, and a separate accent for the AI parts of the product.',
      },
      { type: 'h', text: 'Haneko’s cats' },
      { type: 'p', text: 'Haneko’s mascots are pixel-art cats drawn entirely in code: simple shapes scanned into a tiny pixel buffer, with an outline added automatically. The same engine draws every one of them.' },
      { type: 'p', text: 'The landing page’s cat: it sleeps next to the purple folder, wakes up when you arrive, then stamps invoices with its paw and files them. Click it to pet it.' },
      { type: 'widget', name: 'catHero' },
      { type: 'p', text: 'Each link in the landing menu has its own looping scene, from the four-cat team to the vault.' },
      { type: 'widget', name: 'cats' },
      { type: 'p', text: 'Behind the empty AI chat, cats walk past in ASCII: the engine’s walking cat with every pixel printed as a character tile, light fur in sparse glyphs and shade in dense ones, leaving paw prints that fade.' },
      { type: 'widget', name: 'catWalk' },
    ],
  },

  {
    id: 'maker',
    accent: '#b0562b',
    kicker: 'Electronics & Robotics',
    title: 'When code leaves *the screen*',
    lead:
      'I’ve been building things with Arduino since 2020. Seeing the code I wrote spin a motor or light a lamp is still my favourite moment.',
    blocks: [
      { type: 'h', text: 'Fully Automatic Garage (TOG) · 2020' },
      {
        type: 'gallery',
        items: [
          ['/media/tog-1.jpg', 'TOG model'],
          ['/media/tog-2.jpg', 'TOG model'],
          ['/media/tog-3.jpg', 'TOG model'],
        ],
      },
      {
        type: 'p',
        text: 'An Arduino-powered automatic garage model whose roof closes when it senses rain. That’s why the little garage on the shelf opens and closes its roof now and then.',
      },
      { type: 'h', text: 'Smart home · 2020' },
      {
        type: 'p',
        text: 'An Arduino-based smart-home system that controls the curtains and the room light.',
      },
      { type: 'h', text: 'Deneyap Workshops · 2021 — 2023' },
      {
        type: 'gallery',
        items: [
          ['/media/deneyap-1.jpg', 'Deneyap'],
          ['/media/deneyap-3.jpg', 'Deneyap'],
          ['/media/deneyap-2.jpg', 'Deneyap'],
        ],
      },
      { type: 'p', text: 'Training in robotics, IoT and embedded systems.' },
      { type: 'h', text: 'Teknofest Artificial Intelligence · 2022 — 2024' },
      { type: 'p', text: 'First as team captain, then as a member, I took part in a project on cancer detection with computer vision.' },
      { type: 'h', text: '100 StaryUP Hackathon · 2026' },
      {
        type: 'gallery',
        items: [
          ['/media/hackathon-1.jpg', '100 StaryUP Hackathon'],
          ['/media/hackathon-2.jpg', '100 StaryUP Hackathon'],
          ['/media/hackathon-3.jpg', '100 StaryUP Hackathon'],
        ],
      },
      {
        type: 'p',
        text: 'In 48 hours my team built an AI-based logistics automation prototype.',
      },
      { type: 'tags', items: ['Arduino', 'Sensors', 'Servo', 'IoT', 'Computer vision'] },
      { type: 'links', items: [ext(LINKS.hackathon, 'Hackathon post', true)] },
    ],
  },
];

