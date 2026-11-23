// Ported from Haneko (webapp/src/lib/pixel-cat/nav-scenes.ts); types stripped, logic unchanged.
/**
 * Landing menüsünün önizleme sütunundaki piksel-art kedi sahneleri. Her bağlantının kendi küçük,
 * döngüsel animasyonu var; kedi ve eşyalar `engine.ts`'in şekil + otomatik kontur sistemiyle
 * çiziliyor, yani admin'deki yayın kedisiyle aynı çizim dili.
 *
 * Bir sahne yalnızca `draw(buffer, t, time)`: `t` döngü içi zaman (0..duration), `time` sürekli
 * zaman (kuyruk sallanması gibi döngüden bağımsız hareketler için).
 */

import { COATS, COLORS, GROUND_Y, PixelBuffer, SIT, clamp01, drawAlert, drawBitmap, drawCat, drawRim, drawShadow, ellipse, headPoint, hex, mixFrames, paint, phase, polygon, solid, union, withAlpha, withTailSwish } from "./engine.js";

                           
         
           
          
          
              
              
             
             
             
                 
            

                              
                
                 
                                                                    
                   
                                                                                                 
                    
                                                               
 

const SCENE_HEIGHT = 56;

const PROP = {
  steel: hex("#5c5668"),
  steelShade: hex("#46404f"),
  steelLight: hex("#8a8398"),
  green: hex("#4fae5a"),
  greenShade: hex("#36813f"),
  greenLight: COLORS.eye,
  red: hex("#e0574f"),
  redShade: hex("#b23d37"),
  gold: COLORS.alert,
  goldShade: hex("#c98d12"),
  goldLight: hex("#ffe08a"),
  lcd: hex("#b8d98a"),
  warm: hex("#ffd56b"),
  muted: hex("#9d93ad"),
}         ;

/* ------------------------------------------------------------------------------------------ */
/* Yardımcılar                                                                                */
/* ------------------------------------------------------------------------------------------ */

const X_KEYS = [
  "bodyX", "headX", "shoulderX", "hipX", "frontNearX", "frontFarX", "backNearX", "backFarX",
  "tailCtrlX", "tailTipX",
]                                                   ;

/**
 * Çizim süresince bütün kedilerin kürkünü sabitler (`renderNavCatScene` → `coat` seçeneği).
 * Tanıtım sayfasında tek maskot calico olduğu için sahneler kendi kürklerini (fold, tekir,
 * tuxedo) değil bunu kullanır (2026-11-16). Menü önizlemesi seçenek vermez, eskisi gibi çizer.
 */
let coatOverride              = null;

/** Oturan kediyi `dx` kadar yana kaydırır (motor pozları 88px sahnenin ortasına göre). */
function seatedCat(coat      , dx        )             {
  const frame             = { ...SIT, coat: coatOverride ?? coat };
  for (const key of X_KEYS) frame[key] += dx;
  return frame;
}

/** Piksel `x0..x1`, `y0..y1` (dahil) dikdörtgeni. */
function rect(x0        , y0        , x1        , y1        )        {
  return polygon([
    [x0, y0],
    [x1 + 1, y0],
    [x1 + 1, y1 + 1],
    [x0, y1 + 1],
  ]);
}

/** Sağ sütunu ve alt satırı bir ton koyu: maskotlardaki tek yönlü (sol üstten) ışık. */
function litBox(x1        , color      , shade      )       {
  return (x, _y, edgeDepth) => (x >= x1 || edgeDepth === 0 ? shade : color);
}

function isBlinking(t        , at                   ) {
  return at.some((start) => t > start && t < start + 0.12);
}

function drawCatWithShadow(buffer             , frame            ) {
  drawShadow(buffer, frame);
  drawCat(buffer, frame);
}

const SPARKLE = ["..K..", "..K..", "KK.KK", "..K..", "..K.."];

function drawSparkle(buffer             , x        , y        , progress        , color       = PROP.goldLight) {
  if (progress <= 0 || progress >= 1) return;
  const alpha = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
  drawBitmap(buffer, x - 2, y - 2 - progress * 2, SPARKLE, { K: withAlpha(color, alpha) });
}

const CHECK = ["......KK", ".....KGK", "KK..KGK.", "KGKKGK..", ".KGGK...", "..KK...."];

function drawCheck(buffer             , x        , y        , progress        ) {
  if (progress <= 0) return;
  // Kısa bir "pop": bir piksel yukarıdan oturur.
  const lift = progress < 0.25 ? 1 : 0;
  drawBitmap(buffer, x, y - lift, CHECK, { K: COLORS.outline, G: PROP.green });
}

/* ------------------------------------------------------------------------------------------ */
/* SSS: düşünen kedi                                                                          */
/* ------------------------------------------------------------------------------------------ */

const QUESTION = [".KKK.", "K...K", "....K", "...K.", "..K..", ".....", "..K.."];
const BULB = [".YYY.", "YYWYY", "YYYWY", "YYYYY", ".YYY.", ".SSS.", "..S.."];

function drawThoughtBubble(
  buffer             ,
  headX        ,
  headY        ,
  t        ,
  alpha        ,
  content                     ,
) {
  const fill = solid(withAlpha(COLORS.white, alpha));
  const outline = withAlpha(COLORS.outline, alpha);
  if (t > 0.9) paint(buffer, ellipse(headX + 9, headY - 10, 1.2, 1.2), fill, outline);
  if (t > 1.15) paint(buffer, ellipse(headX + 12.5, headY - 14, 1.9, 1.7), fill, outline);
  if (t <= 1.4) return;
  const pop = 0.7 + 0.3 * phase(t, 1.4, 1.6) + (content === "idea" && t < 3.55 ? 0.08 : 0);
  const cx = headX + 22;
  const cy = headY - 18;
  paint(buffer, ellipse(cx, cy, 10 * pop, 7.5 * pop), (x, y, edgeDepth) =>
    withAlpha(edgeDepth === 0 || y > cy + 4 ? COLORS.whiteShade : COLORS.white, alpha),
  outline);
  if (pop < 0.95) return;
  if (content === "question") {
    const bob = Math.sin(t * 5) > 0 ? 0 : 1;
    drawBitmap(buffer, cx - 2, cy - 4 + bob, QUESTION, { K: withAlpha(COLORS.bowlShade, alpha) });
  } else {
    drawBitmap(buffer, cx - 2, cy - 4, BULB, {
      Y: withAlpha(PROP.gold, alpha),
      W: withAlpha(PROP.goldLight, alpha),
      S: withAlpha(PROP.steelLight, alpha),
    });
    // Işık huzmeleri yanıp söner.
    if (Math.sin(t * 10) > -0.2) {
      const ray = withAlpha(PROP.gold, alpha);
      for (const [dx, dy] of [[-4, -3], [4, -3], [-5, 0], [5, 0], [0, -6]]         ) {
        buffer.set(Math.round(cx + dx), Math.round(cy - 1 + dy), ray);
      }
    }
  }
}

const faq              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6.4,
  stillTime: 2.4,
  draw(buffer, t, time) {
    const base = seatedCat(COATS.fold, -8);
    const thinking             = {
      ...base,
      headTilt: -0.12,
      frontNearX: base.headX + 1.5,
      frontNearY: base.headY + 6.5,
      isPawOverHead: true,
    };
    const lift = phase(t, 0.2, 0.7) - phase(t, 4.1, 4.6);
    let frame = { ...mixFrames(base, thinking, lift), isPawOverHead: lift > 0.05 };
    if (lift > 0.95) frame.frontNearY += Math.sin(t * 7) * 0.6; // patiyle çeneyi tıklatıyor

    const isIdea = t >= 3.4 && t < 5.8;
    if (t > 0.7 && t < 3.4) {
      frame = { ...frame, eyes: "half", pupilDX: Math.floor(t / 0.7) % 2 === 0 ? 1 : -1 };
    } else if (isIdea) {
      frame = { ...frame, eyes: t < 3.9 ? "open" : "happy", mouth: "smile", pupilDX: 1 };
    } else if (isBlinking(t, [6.0])) {
      frame = { ...frame, eyes: "closed" };
    }
    frame = withTailSwish(frame, time, 1.5);
    drawCatWithShadow(buffer, frame);

    const alpha = 1 - phase(t, 5.5, 5.9);
    if (alpha > 0) drawThoughtBubble(buffer, base.headX, base.headY, t, alpha, isIdea ? "idea" : "question");
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Hakkımızda: dört kişilik ekip, dört kedi                                                   */
/* ------------------------------------------------------------------------------------------ */

/**
 * Soldaki iki kedi sağa, sağdaki iki kedi sola bakar (2026-11-17, kullanıcı isteği: önce dördü de
 * sağa bakıyordu, sağdaki ikisi gruptan uzağa dönük duruyordu). Motor kediyi hep sağa bakar çizer;
 * sola bakanlar ayrı tamponda çizilip kendi yuvalarının ortasından (`36 + dx`) aynalanır. Ortadaki
 * ikili yüz yüze gelir; aralarında ~15px boşluk var (ilk hâlde burunları değiyordu; 6px ve 12px de yakın bulundu).
 */
const TEAM                                                                                   = [
  { coat: COATS.calico, dx: -14, offset: 0, isFacingLeft: false },
  { coat: COATS.fold, dx: 10, offset: 1.7, isFacingLeft: false },
  { coat: COATS.orangeTabby, dx: 65, offset: 3.1, isFacingLeft: true },
  { coat: COATS.tuxedo, dx: 91, offset: 4.4, isFacingLeft: true },
];

/** Oturan kedinin yuvasının ortası (motor pozunda kuyruk ucu ≈ x17, baş ≈ x55). */
const SEATED_CENTER_X = 36;

let mirrorBuffer                     = null;

/** `draw`'ın çizdiğini `pivotX` çevresinde yatayda aynalayıp `buffer`'a bindirir. */
function drawMirrored(buffer             , pivotX        , draw                               ) {
  if (!mirrorBuffer || mirrorBuffer.width !== buffer.width || mirrorBuffer.height !== buffer.height) {
    mirrorBuffer = new PixelBuffer(buffer.width, buffer.height);
  }
  const source = mirrorBuffer;
  source.clear();
  draw(source);
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) {
      const i = (y * source.width + x) * 4;
      const alpha = source.data[i + 3];
      if (alpha === 0) continue;
      buffer.set(2 * pivotX - 1 - x, y, [source.data[i], source.data[i + 1], source.data[i + 2], alpha]);
    }
  }
}

const about              = {
  width: 151,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.8,
  draw(buffer, t, time) {
    const frames = TEAM.map(({ coat, dx, offset }, i) => {
      const local = (t + offset) % 6;
      let frame = seatedCat(coat, dx);
      // Herkes baktığı yöne (aynalı kedide +1 sola demek); dıştakiler arada bir dönüp yanındakine bakar.
      const isGlancing = (i === 0 && local > 3.5 && local < 4.6) || (i === 3 && local > 2.2 && local < 3.3);
      frame = {
        ...frame,
        pupilDX: isGlancing ? 0 : 1,
        eyes: isBlinking(local, [1.0, 4.2]) ? "closed" : "open",
        earPerk: local > 2.5 && local < 2.62 ? 0.6 : 1,
        tailTipX: frame.tailTipX + Math.sin(time * 2.2 + i * 1.3) * 2,
        tailCtrlX: frame.tailCtrlX + Math.sin(time * 2.2 + i * 1.3 - 0.8) * 0.8,
      };
      // En sağdaki kedi yalanıyor (admin'deki groom hareketi).
      if (i === 3) {
        const lift = phase(local, 0.4, 0.8) - phase(local, 2.2, 2.6);
        const lick = Math.sin(local * 14);
        frame = {
          ...frame,
          headTilt: -0.15 * lift,
          frontNearX: frame.frontNearX + lift * 5,
          frontNearY: frame.frontNearY - lift * 14 + (lift > 0.9 ? lick * 0.8 : 0),
          isPawOverHead: lift > 0.3,
        };
        if (lift > 0.6) frame = { ...frame, eyes: "happy", mouth: lick > 0 ? "tongue" : "none" };
      }
      // Yüz yüze duran ortadaki ikili birbirine gülümsüyor.
      const isHappyMoment = t > 3.2 && t < 5.2 && (i === 1 || i === 2);
      if (isHappyMoment) frame = { ...frame, eyes: "happy", mouth: "smile" };
      return frame;
    });

    const drawFacing = (index        , paint                               ) => {
      const member = TEAM[index];
      if (member.isFacingLeft) drawMirrored(buffer, SEATED_CENTER_X + member.dx, paint);
      else paint(buffer);
    };
    frames.forEach((frame, i) => drawFacing(i, (target) => drawShadow(target, frame)));
    // Başlar komşunun kuyruğunu örter: sağa bakanlarda sağdaki önce, sola bakanlarda soldaki önce çizilir.
    for (const i of [1, 0, 2, 3]) drawFacing(i, (target) => drawCat(target, frames[i]));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Demo: ekrana dokunup videoyu başlatan kedi                                                 */
/* ------------------------------------------------------------------------------------------ */

const SPARK_POINTS                                           = [
  [56, 33], [59, 31], [62, 32], [65, 28], [68, 29], [71, 26], [74, 27], [76, 24],
];

function drawMonitor(buffer             , t        ) {
  paint(buffer, rect(64, 41, 68, 45), solid(PROP.steelShade));
  paint(buffer, rect(59, 46, 73, 48), litBox(73, PROP.steel, PROP.steelShade));
  paint(buffer, rect(52, 20, 80, 40), litBox(80, PROP.steel, PROP.steelShade));

  const isPlaying = t > 1.5 && t < 5.3;
  paint(buffer, rect(54, 22, 78, 37), solid(isPlaying ? COLORS.bowlInside : COLORS.bowlShade), null);
  buffer.set(55, 23, COLORS.bowlRim);
  buffer.set(56, 23, COLORS.bowlRim);
  buffer.set(55, 24, COLORS.bowlRim);
  buffer.set(78, 39, PROP.greenLight);

  if (!isPlaying) {
    const isBright = Math.sin(t * 6) > 0;
    paint(buffer, polygon([[63, 25], [63, 35], [70.5, 30]]), solid(isBright ? COLORS.white : COLORS.bowlRim), null);
    return;
  }
  // Video: büyüyen bir grafik ve ilerleme çubuğu.
  const progress = clamp01((t - 1.5) / 3.6);
  const shown = Math.max(1, Math.round(progress * (SPARK_POINTS.length - 1)));
  for (let i = 0; i < shown; i++) {
    const [ax, ay] = SPARK_POINTS[i];
    const [bx, by] = SPARK_POINTS[i + 1];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= steps; s++) {
      buffer.set(Math.round(ax + ((bx - ax) * s) / steps), Math.round(ay + ((by - ay) * s) / steps), PROP.greenLight);
    }
  }
  for (let x = 55; x <= 77; x++) buffer.set(x, 36, x <= 55 + progress * 22 ? COLORS.white : COLORS.bowlShade);
}

const demo              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.4,
  draw(buffer, t, time) {
    const base = { ...seatedCat(COATS.calico, -10), pupilDX: 1 };
    const tap = phase(t, 0.9, 1.2) - phase(t, 1.35, 1.7);
    let frame             = {
      ...base,
      shoulderX: base.shoulderX + tap * 2,
      headX: base.headX + tap,
      frontNearX: base.frontNearX + tap * 12,
      frontNearY: base.frontNearY - tap * 13.5,
      isPawOverHead: tap > 0.1,
      eyes: isBlinking(t, [0.4, 2.6]) ? "closed" : "open",
    };
    if (t > 3.8 && t < 5.2) {
      frame = { ...frame, eyes: "happy", mouth: "smile", headY: frame.headY + (Math.sin(t * 8) > 0 ? 0.6 : 0) };
    }
    drawMonitor(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, 1.5));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Ürün turu: haritada rota çizilir, X'e varınca "!"                                          */
/* ------------------------------------------------------------------------------------------ */

const ROUTE                                           = [[57, 30], [62, 27], [67, 29], [71, 24], [76, 19]];

const ROUTE_PIXELS = (() => {
  const pixels                          = [];
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const [ax, ay] = ROUTE[i];
    const [bx, by] = ROUTE[i + 1];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = i === 0 ? 0 : 1; s <= steps; s++) {
      pixels.push([Math.round(ax + ((bx - ax) * s) / steps), Math.round(ay + ((by - ay) * s) / steps)]);
    }
  }
  return pixels;
})();

const CROSS = ["R...R", ".R.R.", "..R..", ".R.R.", "R...R"];

function drawMapBoard(buffer             , t        ) {
  paint(buffer, rect(66, 36, 68, 48), litBox(68, COLORS.kibble, COLORS.kibbleShade));
  paint(buffer, rect(51, 12, 83, 35), litBox(83, COLORS.kibble, COLORS.kibbleShade));
  paint(buffer, rect(53, 14, 81, 33), solid(COLORS.white), null);
  paint(buffer, ellipse(60, 19, 4.5, 2.6), solid(PROP.greenLight), null);
  paint(buffer, ellipse(77, 29, 3.2, 1.8), solid(COLORS.bowlRim), null);

  const fade = 1 - phase(t, 5.5, 5.9);
  if (fade <= 0) return;
  const routeColor = withAlpha(COLORS.kibbleShade, fade);
  const shown = Math.round(phase(t, 0.6, 3.2) * ROUTE_PIXELS.length);
  ROUTE_PIXELS.slice(0, shown).forEach(([x, y], i) => {
    if (i % 3 !== 2) buffer.set(x, y, routeColor);
  });
  if (t > 0.5) {
    const start = withAlpha(PROP.green, fade);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]         ) buffer.set(56 + dx, 30 + dy, start);
  }
  if (t > 3.2) {
    drawBitmap(buffer, 74, 17, CROSS, { R: withAlpha(PROP.red, fade) });
    drawSparkle(buffer, 79, 15, (t - 3.2) / 0.8);
  }
}

const tour              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.6,
  draw(buffer, t, time) {
    let frame             = {
      ...seatedCat(COATS.orangeTabby, -12),
      pupilDX: 1,
      headTilt: -0.08,
      eyes: isBlinking(t, [0.3, 2.2]) ? "closed" : "open",
    };
    if (t > 3.3 && t < 4.3) frame = { ...frame, alertProgress: (t - 3.3) / 1, earPerk: 1 };
    if (t >= 4.3 && t < 5.6) frame = { ...frame, eyes: "happy", mouth: "smile" };
    drawMapBoard(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, 1.5));
    if (frame.alertProgress !== undefined) drawAlert(buffer, frame, frame.alertProgress);
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Öngörü: çubuklar büyür, ok yükselir, kedi sevinir                                          */
/* ------------------------------------------------------------------------------------------ */

const BARS                                                                                         = [
  { x0: 52, height: 8, start: 0.3, color: COLORS.bowl, shade: COLORS.bowlShade },
  { x0: 61, height: 14, start: 0.8, color: COLORS.bowl, shade: COLORS.bowlShade },
  { x0: 70, height: 22, start: 1.3, color: PROP.green, shade: PROP.greenShade },
];

const TREND                                           = [[51, 36], [58, 31], [64, 32], [75, 20]];

function drawChart(buffer             , t        ) {
  for (let y = 18; y <= 49; y++) buffer.set(48, y, COLORS.outline);
  for (let x = 48; x <= 80; x++) buffer.set(x, 50, COLORS.outline);

  const shrink = 1 - phase(t, 5.4, 5.9);
  for (const bar of BARS) {
    const height = Math.round(bar.height * phase(t, bar.start, bar.start + 0.7) * shrink);
    if (height < 1) continue;
    paint(buffer, rect(bar.x0, 49 - height + 1, bar.x0 + 5, 49), litBox(bar.x0 + 5, bar.color, bar.shade));
  }

  const drawn = phase(t, 2.0, 2.8) * shrink;
  if (drawn <= 0) return;
  const total = TREND.length - 1;
  const reach = drawn * total;
  for (let i = 0; i < total; i++) {
    const part = clamp01(reach - i);
    if (part <= 0) break;
    const [ax, ay] = TREND[i];
    const [bx, by] = TREND[i + 1];
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= steps * part; s++) {
      const x = Math.round(ax + ((bx - ax) * s) / steps);
      const y = Math.round(ay + ((by - ay) * s) / steps);
      buffer.set(x, y, PROP.green);
      buffer.set(x, y + 1, PROP.greenShade);
    }
  }
  if (drawn >= 0.99) paint(buffer, polygon([[78.5, 16.5], [71.5, 18.5], [76.5, 23.5]]), solid(PROP.green));
}

const forecast              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.3,
  draw(buffer, t, time) {
    const base = { ...seatedCat(COATS.fold, -14), pupilDX: 1 };
    // Sevinç: ön pati havaya, ağız açık.
    const cheer = phase(t, 2.8, 3.05) - phase(t, 3.6, 3.9);
    let frame             = {
      ...base,
      frontNearX: base.frontNearX + cheer * 4,
      frontNearY: base.frontNearY - cheer * 17,
      headTilt: -0.1 * cheer,
      isPawOverHead: cheer > 0.1,
      eyes: isBlinking(t, [0.5, 1.9]) ? "closed" : "open",
    };
    if (t > 2.8 && t < 5) frame = { ...frame, eyes: "happy", mouth: cheer > 0.5 ? "open" : "smile" };
    drawChart(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, 2));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* İşletmeler: dükkânın tabelası "açık"a döner                                                */
/* ------------------------------------------------------------------------------------------ */

function drawShop(buffer             , t        ) {
  paint(buffer, rect(55, 25, 83, 49), litBox(83, COLORS.white, COLORS.whiteShade));

  // Çizgili tente, alt kenarı fistolu.
  const awning = union(rect(53, 19, 85, 24), ...[55, 59, 63, 67, 71, 75, 79, 83].map((x) => ellipse(x + 0.5, 25, 2, 1.4)));
  paint(buffer, awning, (x) => (Math.floor((x - 53) / 4) % 2 === 0 ? PROP.red : COLORS.white));
  paint(buffer, rect(62, 13, 76, 17), litBox(76, COLORS.kibble, COLORS.kibbleShade));
  for (let x = 64; x <= 74; x += 2) buffer.set(x, 15, COLORS.white);

  // Açılış (1.0-1.5) ve döngü sonunda kapanış (5.5-6.0): tabela kendi ekseninde döner.
  const opening = phase(t, 1.0, 1.5) - phase(t, 5.5, 6.0);
  const isOpen = opening > 0.5;
  const isLit = opening > 0.6;
  paint(buffer, rect(58, 29, 68, 40), solid(isLit ? PROP.warm : COLORS.bowlRim));
  for (let y = 30; y <= 39; y++) buffer.set(63, y, COLORS.outline);
  for (let x = 59; x <= 67; x++) buffer.set(x, 34, COLORS.outline);
  if (!isLit) {
    buffer.set(60, 31, COLORS.white);
    buffer.set(61, 30, COLORS.white);
  }

  paint(buffer, rect(72, 31, 80, 49), litBox(80, COLORS.kibble, COLORS.kibbleShade));
  buffer.set(78, 41, PROP.gold);

  const flip = Math.abs(Math.cos(opening * Math.PI));
  const halfWidth = Math.max(0.6, 4 * flip);
  const signColor = isOpen ? PROP.green : PROP.muted;
  paint(buffer, rect(Math.round(76 - halfWidth), 34, Math.round(76 + halfWidth) - 1, 37), solid(signColor));
  if (flip > 0.8) {
    for (let x = 74; x <= 78; x += 2) buffer.set(x, 35, isOpen ? COLORS.white : COLORS.outline);
  }
  buffer.set(76, 33, COLORS.outline);
  if (t > 1.5 && t < 2.6) {
    drawSparkle(buffer, 83, 31, (t - 1.5) / 0.8);
    drawSparkle(buffer, 70, 28, (t - 1.8) / 0.8);
  }
}

const business              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 2.2,
  draw(buffer, t, time) {
    let frame             = {
      ...seatedCat(COATS.tuxedo, -14),
      pupilDX: 1,
      eyes: isBlinking(t, [0.4, 3.4, 4.8]) ? "closed" : "open",
    };
    if (t > 1.6 && t < 3.2) frame = { ...frame, eyes: "happy", mouth: "smile", headTilt: -0.06 };
    drawShop(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, t > 1.6 && t < 3.2 ? 3 : 1.5));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Danışmanlar: gözlüklü kedi hesap makinesinde hesap yapar                                   */
/* ------------------------------------------------------------------------------------------ */

const DIGITS                                    = {
  "2": ["KK.", "..K", ".K.", "K..", "KKK"],
  "4": ["K.K", "K.K", "KKK", "..K", "..K"],
  "7": ["KKK", "..K", ".K.", ".K.", ".K."],
};
const TYPED = ["", "7", "74", "742"];
const TAP_TIMES = [0.6, 1.2, 1.8];
const GLASS_RING = [".KK.", "K..K", "K..K", "K..K", ".KK."];

function drawCalculator(buffer             , t        , pressedKey        ) {
  paint(buffer, rect(47, 35, 63, 49), litBox(63, PROP.steel, PROP.steelShade));
  paint(buffer, rect(49, 37, 61, 43), solid(PROP.lcd));
  const isReset = t > 5.2;
  const typed = isReset ? "" : TYPED[TAP_TIMES.filter((s) => t > s + 0.12).length];
  let x = 61;
  for (const digit of [...typed].reverse()) {
    const glyph = DIGITS[digit];
    x -= glyph[0].length;
    drawBitmap(buffer, x, 38, glyph, { K: COLORS.outline });
    x -= 1;
  }
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const key = row * 3 + col;
      const kx = 51 + col * 4;
      const ky = 45 + row * 2;
      const color = key === pressedKey ? PROP.goldLight : COLORS.whiteShade;
      buffer.set(kx, ky, color);
      buffer.set(kx + 1, ky, color);
    }
  }
}

function drawGlasses(buffer             , frame            ) {
  const [lx, ly] = headPoint(frame, -3.8, -1);
  const [rx, ry] = headPoint(frame, 2.6, -1);
  drawBitmap(buffer, lx - 1, ly - 1, GLASS_RING, { K: COLORS.outline });
  drawBitmap(buffer, rx - 1, ry - 1, GLASS_RING, { K: COLORS.outline });
  for (let x = Math.round(lx) + 3; x <= Math.round(rx) - 2; x++) buffer.set(x, Math.round(ly), COLORS.outline);
}

const advisor              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 5.6,
  stillTime: 3.2,
  draw(buffer, t, time) {
    const base = { ...seatedCat(COATS.orangeTabby, -6), pupilDX: 1 };
    const hover = phase(t, 0.3, 0.55) - phase(t, 2.4, 2.7);
    const tap = TAP_TIMES.reduce((sum, start) => sum + phase(t, start, start + 0.1) - phase(t, start + 0.14, start + 0.3), 0);
    const pressedKey = TAP_TIMES.findIndex((start) => t > start + 0.08 && t < start + 0.2);
    // Tuşlara uzanırken omuz ve baş öne eğilir; kol kısa kalır.
    let frame             = {
      ...base,
      shoulderX: base.shoulderX + hover * 2,
      headX: base.headX + hover * 1.5,
      headY: base.headY + hover * 1.5,
      bodyAngle: base.bodyAngle + hover * 0.08,
      frontNearX: base.frontNearX + hover * 12,
      frontNearY: base.frontNearY - hover * 4 + tap * 1.5,
      isPawOverHead: hover > 0.05,
      headTilt: 0.1 * hover,
      eyes: isBlinking(t, [0.2, 4.9]) ? "closed" : "open",
    };
    if (t > 2.7 && t < 4.6) frame = { ...frame, eyes: "happy", mouth: "smile", headTilt: 0 };
    drawCalculator(buffer, t, [0, 4, 2][pressedKey] ?? -1);
    frame = withTailSwish(frame, time, 1.2);
    drawCatWithShadow(buffer, frame);
    drawGlasses(buffer, frame);
    if (t > 2.6 && t < 5.2) drawCheck(buffer, 55, 26, (t - 2.6) / 2.6);
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Görüşme: takvimde gün seçilir, onaylanır                                                   */
/* ------------------------------------------------------------------------------------------ */

const PICK_PATH                                           = [[0, 0], [1, 0], [3, 1], [1, 2], [2, 2]];

const cellOrigin = (col        , row        )                   => [56 + col * 5, 26 + row * 5];

function drawCalendar(buffer             , t        ) {
  paint(buffer, rect(55, 47, 79, 49), litBox(79, PROP.steel, PROP.steelShade));
  paint(buffer, rect(52, 16, 82, 46), litBox(82, COLORS.white, COLORS.whiteShade));
  paint(buffer, rect(52, 16, 82, 21), litBox(82, PROP.red, PROP.redShade));
  for (const x of [59, 75]) paint(buffer, rect(x, 13, x + 1, 18), solid(PROP.steelLight));

  const isReset = t > 5.5;
  const step = Math.min(PICK_PATH.length - 1, Math.floor(clamp01((t - 0.6) / 2) * PICK_PATH.length));
  const isChosen = t > 2.7 && !isReset;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const [x, y] = cellOrigin(col, row);
      const isPicked = isChosen && col === PICK_PATH[PICK_PATH.length - 1][0] && row === PICK_PATH[PICK_PATH.length - 1][1];
      const color = isPicked ? PROP.greenLight : COLORS.whiteShade;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 3; dx++) buffer.set(x + dx, y + dy, color);
    }
  }
  if (t > 0.6 && !isReset) {
    const [col, row] = PICK_PATH[step];
    const [x, y] = cellOrigin(col, row);
    const ring = isChosen ? PROP.green : COLORS.bowl;
    for (let dx = -1; dx <= 3; dx++) {
      buffer.set(x + dx, y - 1, ring);
      buffer.set(x + dx, y + 2, ring);
    }
    buffer.set(x - 1, y, ring);
    buffer.set(x + 3, y, ring);
    buffer.set(x - 1, y + 1, ring);
    buffer.set(x + 3, y + 1, ring);
  }
  if (isChosen) {
    const [x, y] = cellOrigin(...(PICK_PATH[PICK_PATH.length - 1]                    ));
    drawCheck(buffer, x + 1, y - 7, (t - 2.7) / 2.8);
  }
}

const meeting              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.4,
  draw(buffer, t, time) {
    let frame             = {
      ...seatedCat(COATS.calico, -12),
      pupilDX: 1,
      // Seçici gezinirken başı hafifçe onu takip eder.
      headTilt: t > 0.6 && t < 2.7 ? Math.sin(t * 3) * 0.06 : 0,
      eyes: isBlinking(t, [0.3, 5.0]) ? "closed" : "open",
    };
    if (t > 2.8 && t < 4.8) frame = { ...frame, eyes: "happy", mouth: "smile" };
    drawCalendar(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, 1.5));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Fiyatlandırma: yığına düşen paralar                                                        */
/* ------------------------------------------------------------------------------------------ */

const COIN_X0 = 52;
const COIN_X1 = 63;
const COIN_DROPS = [0.5, 1.5, 2.5];
const COIN_FALL = 0.45;
const coinTop = (index        ) => 47 - index * 3;

function drawStackedCoin(buffer             , index        , alpha = 1, lift = 0) {
  const y = coinTop(index) - lift;
  paint(
    buffer,
    rect(COIN_X0, y, COIN_X1, y + 1),
    (x, py) => withAlpha(py === y ? PROP.goldLight : x >= COIN_X1 - 1 ? PROP.goldShade : PROP.gold, alpha),
    withAlpha(COLORS.outline, alpha),
  );
}

function drawCoins(buffer             , t        ) {
  drawStackedCoin(buffer, 0);
  drawStackedCoin(buffer, 1);
  const fade = 1 - phase(t, 5.4, 5.8);
  if (fade <= 0) return;
  COIN_DROPS.forEach((start, i) => {
    const index = i + 2;
    if (t < start) return;
    const fall = clamp01((t - start) / COIN_FALL);
    if (fall < 1) {
      // Düşerken dönen para: önden görünüş, genişliği salınır.
      const cy = -6 + (coinTop(index) + 1 + 6) * fall * fall;
      const rx = 1 + 3.5 * Math.abs(Math.cos((t - start) * 14));
      paint(buffer, ellipse((COIN_X0 + COIN_X1) / 2 + 0.5, cy, rx, 3.6), (x) =>
        x > (COIN_X0 + COIN_X1) / 2 + rx * 0.4 ? PROP.goldShade : PROP.gold,
      );
      return;
    }
    const isBouncing = t - start - COIN_FALL < 0.08;
    drawStackedCoin(buffer, index, fade, isBouncing ? 1 : 0);
    drawSparkle(buffer, COIN_X1 + 3, coinTop(index) - 1, (t - start - COIN_FALL) / 0.7);
  });
}

const pricing              = {
  width: 88,
  height: SCENE_HEIGHT,
  duration: 6,
  stillTime: 3.6,
  draw(buffer, t, time) {
    // Düşen paranın peşinden başını kaldırır.
    const watch = COIN_DROPS.reduce((sum, start) => sum + phase(t, start - 0.2, start) - phase(t, start + 0.2, start + COIN_FALL), 0);
    let frame             = {
      ...seatedCat(COATS.fold, -14),
      pupilDX: 1,
      headTilt: -0.14 * watch,
      eyes: isBlinking(t, [0.2, 4.9]) ? "closed" : "open",
    };
    if (t > 3.3 && t < 5.2) frame = { ...frame, eyes: "happy", mouth: "smile" };
    drawCoins(buffer, t);
    drawCatWithShadow(buffer, withTailSwish(frame, time, 1.5));
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Fatura onayı (tanıtım sayfası hero'su, 2026-11-16): kedi faturalara pati mührü basar,        */
/* tik gelir, fatura klasöre kayar; üç fatura bitince sevinir, yenileri düşer.                 */
/* ------------------------------------------------------------------------------------------ */

const BRAND = hex("#652fe7");
const BRAND_SHADE = hex("#4d1fc2");
const BRAND_LIGHT = hex("#c4b5fd");

/** Fatura üstüne basılan pati mührü (marka moru). */
const PAW_STAMP = [".P.P.", "P...P", ".PPP.", "PPPPP", ".PPP."];

/**
 * Sahne diğer menü sahnelerinden geniş (103px): kedi, faturalar ve klasör arasında nefes payı
 * olsun diye (88px'te birbirine sıkışıyordu, 2026-11-16). Kedi motorun oturma pozunda (x≈28–54)
 * durur. Faturalar yerde durur: önce bir sehpanın üstündeydi, kullanıcı sehpayı istemedi.
 */
export const BOOKKEEPING_WIDTH = 103;
/** Faturanın yerdeki yeri (sol üst / sağ alt köşe, dahil); alt kenarı klasörle aynı zeminde. */
const INVOICE = { x0: 59, y0: 26, x1: 72, y1: 49 }         ;
/** Klasör: sağda, yere dayalı; faturalardan 10px ayrık, sağ konturu tuvalin içinde (kenardan 6px). */
const FOLDER = { x0: 83, y0: 31, x1: 96, y1: 49 }         ;
const INVOICE_COUNT = 3;
/** Faturaların yukarıdan düşüp yere oturduğu açılış (sn). */
const REFILL_SECONDS = 0.9;
/** Bir faturanın uzan → mühürle → tik → klasöre kaydır süresi (sn). */
const INVOICE_SECONDS = 2.4;
const CELEBRATE_START = REFILL_SECONDS + INVOICE_COUNT * INVOICE_SECONDS;
const BOOKKEEPING_SECONDS = CELEBRATE_START + 1.9;

/**
 * `maxY`: klasöre inerken faturanın klasörün alt kenarından taşan kısmı çizilmez (klasörün
 * içine girmiş gibi görünür).
 */
function drawInvoice(buffer             , dx        , dy        , isStamped         , checkProgress        , maxY = Infinity) {
  const x0 = INVOICE.x0 + dx;
  const y0 = INVOICE.y0 + dy;
  const x1 = INVOICE.x1 + dx;
  const y1 = Math.min(INVOICE.y1 + dy, maxY);
  paint(buffer, rect(x0, y0, x1, y1), litBox(x1, COLORS.white, COLORS.whiteShade));
  if (y1 < INVOICE.y1 + dy) return; // kırpılmışsa içerik zaten klasörün arkasında
  // Başlık, kalem satırları ve tutar: yazı değil, sade çizgiler.
  paint(buffer, rect(x0 + 2, y0 + 3, x0 + 6, y0 + 4), solid(PROP.muted), null);
  [[8, 3], [11, 5], [14, 4]].forEach(([row, cut]) => {
    paint(buffer, rect(x0 + 2, y0 + row, x1 - 2 - cut, y0 + row), solid(COLORS.whiteShade), null);
  });
  paint(buffer, rect(x1 - 6, y1 - 3, x1 - 2, y1 - 2), solid(PROP.steel), null);
  if (isStamped) drawBitmap(buffer, x0 + 2, y1 - 8, PAW_STAMP, { P: BRAND });
  if (checkProgress > 0) drawCheck(buffer, x1 - 8, y0 + 2, checkProgress);
}

/**
 * Kedininkiyle aynı zemin gölgesi (`x0..x1` nesnenin genişliği). `size` 0..1: havadaki nesnenin
 * gölgesi küçülür, yere indikçe tam boyuna gelir.
 */
function drawGroundShadow(buffer             , x0        , x1        , size = 1) {
  if (size <= 0.15) return;
  const rx = ((x1 - x0 + 1) / 2 + 1) * size;
  paint(buffer, ellipse((x0 + x1 + 1) / 2, GROUND_Y + 0.5, rx, 1.6 * Math.max(0.6, size)), solid(COLORS.shadow), null);
}

/** Boş klasör ve gölgesi: uyurken de sahnede durur ki uyanınca kesme olmasın. */
export function drawBookkeepingStage(buffer             , filedCount = 0, filedSink = 0) {
  drawGroundShadow(buffer, FOLDER.x0, FOLDER.x1);
  // Klasöre giren faturalar üst kenardan biraz görünür (klasörden önce çizilir, alt kısmı örtülür).
  for (let k = 0; k < filedCount; k++) {
    const y = 29 - k * 2 + filedSink;
    paint(buffer, rect(FOLDER.x0 + 2 + k, y, FOLDER.x1 - 2 - k, y + 3), litBox(FOLDER.x1 - 2 - k, COLORS.white, COLORS.whiteShade));
  }
  drawFolder(buffer);
}

function drawFolder(buffer             ) {
  paint(buffer, rect(FOLDER.x0, FOLDER.y0 - 2, FOLDER.x0 + 5, FOLDER.y0), solid(BRAND_SHADE));
  paint(buffer, rect(FOLDER.x0, FOLDER.y0, FOLDER.x1, FOLDER.y1), litBox(FOLDER.x1, BRAND, BRAND_SHADE));
  paint(buffer, rect(FOLDER.x0 + 4, FOLDER.y0 + 5, FOLDER.x1 - 4, FOLDER.y0 + 7), solid(BRAND_LIGHT), null);
}

const bookkeeping              = {
  width: BOOKKEEPING_WIDTH,
  height: SCENE_HEIGHT,
  duration: BOOKKEEPING_SECONDS,
  stillTime: REFILL_SECONDS + 0.9,
  draw(buffer, t, time) {
    // Hangi fatura işleniyor; kaçı klasörde.
    const active = Math.min(INVOICE_COUNT - 1, Math.max(0, Math.floor((t - REFILL_SECONDS) / INVOICE_SECONDS)));
    const start = REFILL_SECONDS + active * INVOICE_SECONDS;
    const isWorking = t >= REFILL_SECONDS && t < CELEBRATE_START;
    const filedCount = t < REFILL_SECONDS ? 0 : Math.min(INVOICE_COUNT, Math.floor((t - REFILL_SECONDS + (INVOICE_SECONDS - 2.1)) / INVOICE_SECONDS));
    // Kutlamadan sonra klasördeki faturalar içeri çekilir, döngü boş klasörle başlar.
    const filedSink = Math.round(phase(t, CELEBRATE_START + 1.2, CELEBRATE_START + 1.7) * 8);

    const reach = isWorking ? phase(t, start, start + 0.35) - phase(t, start + 0.8, start + 1.1) : 0;
    const press = isWorking ? phase(t, start + 0.35, start + 0.45) - phase(t, start + 0.5, start + 0.62) : 0;
    const slide = isWorking ? phase(t, start + 1.15, start + 1.7) : 0;
    const drop = isWorking ? phase(t, start + 1.7, start + 2.1) : 0;

    drawBookkeepingStage(buffer, filedSink >= 8 ? 0 : filedCount, filedSink);
    // Yerdeki faturalar: işlenen öndedir, kalanlar arkasında birer piksel kaydırılmış.
    const onEasel = t < REFILL_SECONDS ? INVOICE_COUNT : t >= CELEBRATE_START ? 0 : INVOICE_COUNT - active;
    // Açılışta faturalar sırayla yukarıdan düşer (en arkadaki önce); 1 = tepede, 0 = yerde.
    const fallOf = (k        ) =>
      t < REFILL_SECONDS ? 1 - phase(t, 0.1 + (INVOICE_COUNT - 1 - k) * 0.2, 0.4 + (INVOICE_COUNT - 1 - k) * 0.2) : 0;
    const isSliding = isWorking && slide > 0 && drop < 1;
    // Gölgeler faturalardan önce: alt sıraları birbirinin gölgesinin üstünde kalsın.
    for (let k = onEasel - 1; k >= 0; k--) {
      if (k === 0 && isWorking && slide > 0) continue;
      drawGroundShadow(buffer, INVOICE.x0 + k, INVOICE.x1 + k, 1 - fallOf(k));
    }
    // Kayan faturanın gölgesi peşinden gelir; klasörün arkasına inince klasörünkü yeter.
    if (isSliding && drop === 0) {
      const dx = Math.round(slide * (FOLDER.x0 - INVOICE.x0));
      drawGroundShadow(buffer, INVOICE.x0 + dx, INVOICE.x1 + dx, 1 - Math.sin(slide * Math.PI) * 0.4);
      drawFolder(buffer);
    }
    for (let k = onEasel - 1; k >= 0; k--) {
      const isFront = k === 0 && isWorking;
      if (isFront && slide > 0) continue; // önteki kayıyor, aşağıda ayrı çizilir
      const fall = fallOf(k);
      const isStamped = isFront && t > start + 0.45;
      drawInvoice(buffer, k, -k - Math.round(fall * 30), isStamped, isFront && t > start + 0.6 ? (t - start - 0.6) / 1 : 0);
    }
    // Klasöre kayan fatura (klasörün arkasından içeri iner; klasör üstte yeniden çizilir).
    if (isSliding) {
      const dx = Math.round(slide * (FOLDER.x0 - INVOICE.x0));
      const dy = Math.round(-Math.sin(slide * Math.PI) * 5 + drop * 16);
      drawInvoice(buffer, dx, dy, true, 1, FOLDER.y1);
      drawFolder(buffer);
    }

    const base = { ...seatedCat(COATS.calico, 0), pupilDX: 1 };
    let frame             = {
      ...base,
      shoulderX: base.shoulderX + reach * 3,
      headX: base.headX + reach * 1.5,
      headY: base.headY + reach,
      bodyAngle: base.bodyAngle + reach * 0.06,
      frontNearX: base.frontNearX + reach * 14 + press * 1.5,
      frontNearY: base.frontNearY - reach * 5.5,
      isPawOverHead: reach > 0.05,
      mouth: press > 0.3 ? "smile" : "none",
      eyes: isBlinking(t, [0.3, 3.9, 6.6]) ? "closed" : "open",
    };
    const isCelebrating = t > CELEBRATE_START && t < CELEBRATE_START + 1.2;
    if (isCelebrating) {
      frame = { ...frame, eyes: "happy", mouth: "open", headY: frame.headY + (Math.sin(t * 9) > 0 ? -0.6 : 0) };
    }
    frame = withTailSwish(frame, time, 1.2);
    // Gözlük yok (2026-11-18, kullanıcı isteği); kasa ve danışman sahnelerinde duruyor.
    drawCatWithShadow(buffer, frame);
    if (t > CELEBRATE_START) {
      drawSparkle(buffer, FOLDER.x0 + 4, 24, (t - CELEBRATE_START) / 0.9);
      drawSparkle(buffer, FOLDER.x1 - 2, 20, (t - CELEBRATE_START - 0.25) / 0.9, BRAND_LIGHT);
    }
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Kasa (tanıtım sayfası "Neden güvenebilirsiniz?", 2026-11-17): kedi kasanın şifresini çevirir, */
/* kapı açılır, yerdeki belgeyi patisiyle içeri atar, kapıyı iter; şifre kilitlenir, üstte      */
/* asma kilit belirir, kedi sevinir. Yeni belge yukarıdan düşer, döngü baştan.                  */
/* ------------------------------------------------------------------------------------------ */

/** Hero'daki fatura sahnesiyle aynı tuval (103×56): kedi aynı yerde (x≈13–54), sağında kasa. */
export const VAULT_WIDTH = 103;
/** Yerdeki belge (dahil koordinatlar). */
const VAULT_DOC = { x0: 57, y0: 39, x1: 65, y1: 49 }         ;
/** Kasanın gövdesi; ayakları altında (y 48–49). */
const SAFE = { x0: 68, y0: 19, x1: 96, y1: 47 }         ;
/** Kapı yüzü = açılınca görünen iç. Menteşe solda: kapı açılırken sola, kediye doğru daralır. */
const SAFE_DOOR = { x0: 70, y0: 21, x1: 94, y1: 45 }         ;
/** Belgenin üst raftaki yeri (sol üst köşe). */
const VAULT_SHELF_SLOT = { x: 78, y: 22 }         ;
const VAULT_DIAL = { x: 82, y: 33 }         ;
const VAULT_SECONDS = 8.6;

const SAFE_DOOR_FACE = hex("#6c6578");
const SAFE_INSIDE = hex("#2a2533");

const PADLOCK = [
  "..KKKKK..",
  ".KK...KK.",
  ".K.....K.",
  ".K.....K.",
  "KKKKKKKKK",
  "KGGGGGGSK",
  "KGGGKGGSK",
  "KGGGKGGSK",
  "KGGGGGGSK",
  "KKKKKKKKK",
];

function drawVaultDoc(buffer             , x0        , y0        ) {
  const x1 = x0 + (VAULT_DOC.x1 - VAULT_DOC.x0);
  const y1 = y0 + (VAULT_DOC.y1 - VAULT_DOC.y0);
  paint(buffer, rect(x0, y0, x1, y1), litBox(x1, COLORS.white, COLORS.whiteShade));
  paint(buffer, rect(x0 + 2, y0 + 2, x0 + 4, y0 + 2), solid(PROP.muted), null);
  [[4, 1], [6, 2], [8, 1]].forEach(([row, cut]) => {
    paint(buffer, rect(x0 + 2, y0 + row, x1 - 1 - cut, y0 + row), solid(COLORS.whiteShade), null);
  });
}

/** Şifre çarkı: `angle` radyan; işaret çizgisi çarkın kenarına doğru. */
function drawDial(buffer             , angle        ) {
  paint(buffer, ellipse(VAULT_DIAL.x + 0.5, VAULT_DIAL.y + 0.5, 4.2, 4.2), (x, y, edgeDepth) =>
    edgeDepth === 0 || x > VAULT_DIAL.x + 2 ? PROP.steel : PROP.steelLight,
  );
  for (const r of [1, 2]) {
    buffer.set(Math.round(VAULT_DIAL.x + 0.5 + Math.cos(angle) * r), Math.round(VAULT_DIAL.y + 0.5 + Math.sin(angle) * r), COLORS.outline);
  }
}

/**
 * Kasa: gövde, iç (raf, mor klasör, para destesi; üst rafta içeri atılan belge), kapı.
 * `open` 0 kapalı · 1 açık (kapı menteşede 4px'lik şerit). `isLocked`: köşedeki ışık yeşil, değilse sarı.
 */
function drawSafe(buffer             , open        , dialAngle        , isLocked         , hasStoredDoc         ) {
  drawGroundShadow(buffer, SAFE.x0, SAFE.x1);
  for (const fx of [SAFE.x0 + 2, SAFE.x1 - 5]) paint(buffer, rect(fx, SAFE.y1 + 1, fx + 3, SAFE.y1 + 2), solid(PROP.steelShade));
  paint(buffer, rect(SAFE.x0, SAFE.y0, SAFE.x1, SAFE.y1), litBox(SAFE.x1, PROP.steel, PROP.steelShade));

  // İç: kapı açıldıkça görünür (kapı üstüne çizilir).
  paint(buffer, rect(SAFE_DOOR.x0, SAFE_DOOR.y0, SAFE_DOOR.x1, SAFE_DOOR.y1), solid(SAFE_INSIDE), null);
  paint(buffer, rect(SAFE_DOOR.x0, 33, SAFE_DOOR.x1, 33), solid(PROP.steelShade), null);
  paint(buffer, rect(72, 35, 75, 36), solid(BRAND_SHADE), null);
  paint(buffer, rect(72, 37, 81, 45), litBox(81, BRAND, BRAND_SHADE), null);
  paint(buffer, rect(74, 40, 79, 41), solid(BRAND_LIGHT), null);
  for (let i = 0; i < 3; i++) {
    const y = 44 - i * 2;
    paint(buffer, rect(85, y, 91, y + 1), (x, py) => (py === y ? PROP.goldLight : x >= 90 ? PROP.goldShade : PROP.gold), null);
  }
  if (hasStoredDoc) drawVaultDoc(buffer, VAULT_SHELF_SLOT.x, VAULT_SHELF_SLOT.y);

  // Kapı: menteşe solda; açıldıkça genişliği 25px'ten 4px'e iner.
  const fullWidth = SAFE_DOOR.x1 - SAFE_DOOR.x0 + 1;
  const width = Math.max(4, Math.round(fullWidth - (fullWidth - 4) * open));
  const doorX1 = SAFE_DOOR.x0 + width - 1;
  paint(buffer, rect(SAFE_DOOR.x0, SAFE_DOOR.y0, doorX1, SAFE_DOOR.y1), litBox(doorX1, SAFE_DOOR_FACE, PROP.steel));
  if (open < 0.08) {
    drawDial(buffer, dialAngle);
    paint(buffer, rect(89, 29, 90, 37), litBox(90, PROP.steelLight, PROP.steelShade));
    for (const y of [23, 43]) buffer.set(SAFE_DOOR.x0 + 1, y, PROP.steelShade);
  }
  const light = isLocked ? PROP.green : PROP.gold;
  paint(buffer, rect(SAFE.x1 - 3, SAFE.y0 + 1, SAFE.x1 - 2, SAFE.y0 + 1), solid(light), null);
}

const vault              = {
  width: VAULT_WIDTH,
  height: SCENE_HEIGHT,
  duration: VAULT_SECONDS,
  stillTime: 5.5,
  draw(buffer, t, time) {
    const open = phase(t, 1.0, 1.5) - phase(t, 3.95, 4.3);
    const dialAngle = -Math.PI / 2 + phase(t, 0.4, 1.0) * Math.PI * 3 - phase(t, 4.35, 5.0) * Math.PI * 3;
    const isLocked = t < 0.95 || t >= 5.0;
    const toss = phase(t, 1.9, 2.6);
    const hasStoredDoc = t >= 2.6 && t < 4.3;

    drawSafe(buffer, open, dialAngle, isLocked, hasStoredDoc);

    // Yerdeki belge: atılana kadar yerde; sonunda yenisi yukarıdan düşer.
    if (t < 1.9 || t >= 7.0) {
      const fall = t >= 7.0 ? 1 - phase(t, 7.0, 7.45) : 0;
      drawGroundShadow(buffer, VAULT_DOC.x0, VAULT_DOC.x1, 1 - fall);
      drawVaultDoc(buffer, VAULT_DOC.x0, VAULT_DOC.y0 - Math.round(fall * 34));
    } else if (toss > 0 && toss < 1) {
      // Kavisle rafa uçar.
      const x = VAULT_DOC.x0 + (VAULT_SHELF_SLOT.x - VAULT_DOC.x0) * toss;
      const y = VAULT_DOC.y0 + (VAULT_SHELF_SLOT.y - VAULT_DOC.y0) * toss - Math.sin(toss * Math.PI) * 7;
      drawVaultDoc(buffer, Math.round(x), Math.round(y));
    }

    // İki uzanış: belgeyi iter (14px), sonra kapıyı kapatır (16px, sonunda kısa bir bastırma).
    const nudge = phase(t, 1.6, 1.9) - phase(t, 2.3, 2.6);
    const push = phase(t, 3.6, 3.95) - phase(t, 4.3, 4.6);
    const press = phase(t, 3.95, 4.05) - phase(t, 4.1, 4.25);
    const reach = Math.max(nudge, push);
    const base = { ...seatedCat(COATS.calico, 0), pupilDX: 1 };
    const lookUp = t >= 6.9 ? phase(t, 6.9, 7.1) - phase(t, 7.5, 7.8) : phase(t, 1.9, 2.1) - phase(t, 2.5, 2.8);
    let frame             = {
      ...base,
      shoulderX: base.shoulderX + reach * 3,
      headX: base.headX + reach * 1.5,
      headY: base.headY + reach,
      bodyAngle: base.bodyAngle + reach * 0.06,
      frontNearX: base.frontNearX + nudge * 14 + push * 16 + press * 1.5,
      frontNearY: base.frontNearY - reach * 5.5,
      isPawOverHead: reach > 0.05,
      headTilt: -0.12 * lookUp,
      eyes: isBlinking(t, [0.25, 3.2, 8.0]) ? "closed" : "open",
    };
    const isCelebrating = t > 5.0 && t < 6.3;
    if (isCelebrating) {
      frame = { ...frame, eyes: "happy", mouth: t < 5.7 ? "open" : "smile", headY: frame.headY + (t < 5.7 && Math.sin(t * 9) > 0 ? -0.6 : 0) };
    }
    frame = withTailSwish(frame, time, isCelebrating ? 2.4 : 1.2);
    drawCatWithShadow(buffer, frame);
    drawGlasses(buffer, frame);

    // Asma kilit: kilitlenince kasanın üstünde belirir, yeni belge düşmeden söner.
    if (t > 5.0 && t < 7.0) {
      const alpha = 1 - phase(t, 6.6, 7.0);
      const lift = t < 5.12 ? 1 : 0;
      drawBitmap(buffer, 78, 6 - lift, PADLOCK, {
        K: withAlpha(COLORS.outline, alpha),
        G: withAlpha(PROP.gold, alpha),
        S: withAlpha(PROP.goldShade, alpha),
      });
      drawSparkle(buffer, 75, 8, (t - 5.0) / 0.9);
      drawSparkle(buffer, 90, 5, (t - 5.25) / 0.9, BRAND_LIGHT);
    }
  },
};

/* ------------------------------------------------------------------------------------------ */

export const NAV_CAT_SCENES                                     = {
  faq,
  about,
  demo,
  tour,
  forecast,
  business,
  advisor,
  meeting,
  pricing,
  bookkeeping,
  vault,
};

                                      
                                                                    
                   
                                                                                         
              
 

export function renderNavCatScene(
  buffer             ,
  scene             ,
  time        ,
  options                      = {},
) {
  buffer.clear();
  coatOverride = options.coat ?? null;
  try {
    scene.draw(buffer, ((time % scene.duration) + scene.duration) % scene.duration, time);
  } finally {
    coatOverride = null;
  }
  if (options.hasRim) drawRim(buffer, COLORS.rim);
}
