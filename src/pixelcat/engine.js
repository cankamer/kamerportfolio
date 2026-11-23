// Ported from Haneko (webapp/src/lib/pixel-cat/engine.ts); types stripped, logic unchanged.
/**
 * Piksel-art Haneko kedisinin çizim motoru (yayın durumu ekranı ve landing menüsünün önizleme
 * sahneleri).
 *
 * Kedi el çizimi kare kare sprite değil: gövde/baş/bacak/kuyruk basit şekillerden (elips,
 * kapsül, çokgen) düşük çözünürlüklü bir tampona piksel piksel taranır, her parçanın çevresine
 * otomatik kontur çekilir. Böylece bir "poz" yalnızca sayılardan oluşur ve iki poz arasında
 * ara kare üretmek düz bir lineer karışım olur.
 *
 * DOM'a ya da canvas API'sine bağlı değil (yalnızca RGBA dizisine yazar) — bu sayede aynı kod
 * Node'da PNG'ye de basılabiliyor. Renk paletleri `public/mascot/` altındaki maskotlardan alındı
 * (calico, Scottish fold, tekir); kürk karede `coat` olarak seçilir.
 */

export const SCENE_WIDTH = 88;
export const SCENE_HEIGHT = 56;

export const GROUND_Y = 50;
export const PAW_Y = 48.5;

                                                             

export function hex(value        , alpha = 255)       {
  return [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
    alpha,
  ];
}

export const COLORS = {
  outline: hex("#1f1a26"),
  white: hex("#fbf7f2"),
  whiteShade: hex("#d6cdd9"),
  orange: hex("#ee8a32"),
  orangeShade: hex("#c0641f"),
  black: hex("#433d4b"),
  blackShade: hex("#332e3a"),
  pink: hex("#f3a3b6"),
  eye: hex("#8fcf4f"),
  pupil: hex("#1f1a26"),
  glint: hex("#ffffff"),
  whisker: hex("#1f1a26", 110),
  yarn: hex("#e45b7f"),
  yarnShade: hex("#b03a5e"),
  yarnLight: hex("#f7a8bf"),
  bowl: hex("#5b8def"),
  bowlShade: hex("#3d66c2"),
  bowlRim: hex("#9dbdf7"),
  bowlInside: hex("#2d4c94"),
  kibble: hex("#b9773b"),
  kibbleShade: hex("#8a5426"),
  zzz: hex("#9d93ad"),
  heart: hex("#f0607f"),
  alert: hex("#f6b92b"),
  shadow: [24, 18, 34, 40]        ,
  rim: hex("#e9e4f2", 70),
}         ;

/** Kürkün üç bölgesi: beyaz (göğüs, ağız, pati), ana renk ve koyu desen (calico lekesi, tekir çizgisi). */
                                     

/**
 * `calico`: büyük lekeler (sırtta koyu, ortada ana renk). `tabby`: ana renk üzerinde koyu çizgiler,
 * alında "M", halkalı kuyruk.
 */
                                      

                       
                       
                           
                           
            
                                                         
                     
 

export const COATS = {
  calico: {
    pattern: "calico",
    color: { white: COLORS.white, main: COLORS.orange, dark: COLORS.black },
    shade: { white: COLORS.whiteShade, main: COLORS.orangeShade, dark: COLORS.blackShade },
    eye: COLORS.eye,
    isFoldEar: false,
  },
  // public/mascot/svg/fold-*: gümüş tekir, mavi göz.
  fold: {
    pattern: "tabby",
    color: { white: hex("#f1f4f8"), main: hex("#c6ccd8"), dark: hex("#8e96a7") },
    shade: { white: hex("#d2d8e2"), main: hex("#a2a9b9"), dark: hex("#737b8d") },
    eye: hex("#6baad1"),
    isFoldEar: true,
  },
  orangeTabby: {
    pattern: "tabby",
    color: { white: hex("#fbf1e4"), main: hex("#f0a04b"), dark: hex("#c46a22") },
    shade: { white: hex("#e6d2bb"), main: hex("#c97a2e"), dark: hex("#a1531a") },
    eye: COLORS.eye,
    isFoldEar: false,
  },
  tuxedo: {
    pattern: "calico",
    color: { white: COLORS.white, main: COLORS.black, dark: COLORS.black },
    shade: { white: COLORS.whiteShade, main: COLORS.blackShade, dark: COLORS.blackShade },
    eye: hex("#f2c94c"),
    isFoldEar: false,
  },
}                                        ;

/* ------------------------------------------------------------------------------------------ */
/* Piksel tamponu ve şekil tarama                                                             */
/* ------------------------------------------------------------------------------------------ */

export class PixelBuffer {
           width        ;
           height        ;
           data                   ;

  constructor(width        , height        ) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  clear() {
    this.data.fill(0);
  }

  set(x        , y        , color      ) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    const alpha = color[3];
    if (alpha >= 255) {
      this.data[i] = color[0];
      this.data[i + 1] = color[1];
      this.data[i + 2] = color[2];
      this.data[i + 3] = 255;
      return;
    }
    if (alpha <= 0) return;
    const a = alpha / 255;
    const baseAlpha = this.data[i + 3] / 255;
    const outAlpha = a + baseAlpha * (1 - a);
    for (let c = 0; c < 3; c++) {
      this.data[i + c] = (color[c] * a + this.data[i + c] * baseAlpha * (1 - a)) / outAlpha;
    }
    this.data[i + 3] = outAlpha * 255;
  }
}

                        
               
               
               
               
                                              
 

export function ellipse(cx        , cy        , rx        , ry        , angle = 0)        {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const reach = Math.max(rx, ry);
  return {
    minX: cx - reach,
    minY: cy - reach,
    maxX: cx + reach,
    maxY: cy + reach,
    contains: (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      const lx = dx * cos + dy * sin;
      const ly = -dx * sin + dy * cos;
      return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
    },
  };
}

function distanceToSegment(x        , y        , ax        , ay        , bx        , by        ) {
  const vx = bx - ax;
  const vy = by - ay;
  const lengthSq = vx * vx + vy * vy;
  const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / lengthSq));
  const px = ax + vx * t - x;
  const py = ay + vy * t - y;
  return { distance: Math.sqrt(px * px + py * py), t };
}

export function capsule(ax        , ay        , bx        , by        , radius        )        {
  return {
    minX: Math.min(ax, bx) - radius,
    minY: Math.min(ay, by) - radius,
    maxX: Math.max(ax, bx) + radius,
    maxY: Math.max(ay, by) + radius,
    contains: (x, y) => distanceToSegment(x, y, ax, ay, bx, by).distance <= radius,
  };
}

export function polygon(points                                          )        {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    contains: (x, y) => {
      let isInside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) isInside = !isInside;
      }
      return isInside;
    },
  };
}

export function union(...shapes         )        {
  return {
    minX: Math.min(...shapes.map((s) => s.minX)),
    minY: Math.min(...shapes.map((s) => s.minY)),
    maxX: Math.max(...shapes.map((s) => s.maxX)),
    maxY: Math.max(...shapes.map((s) => s.maxY)),
    contains: (x, y) => shapes.some((s) => s.contains(x, y)),
  };
}

function clip(shape       , maxY        )        {
  return { ...shape, maxY: Math.min(shape.maxY, maxY), contains: (x, y) => y <= maxY && shape.contains(x, y) };
}

/**
 * `edgeDepth`: pikselin şeklin alt kenarına uzaklığı (0 = en alt satır). Dolgu fonksiyonu bunu
 * alt kenara gölge bandı çekmek için kullanır.
 */
                                                                            

export function paint(buffer             , shape       , fill      , outline              = COLORS.outline) {
  const x0 = Math.floor(shape.minX) - 1;
  const y0 = Math.floor(shape.minY) - 1;
  const x1 = Math.ceil(shape.maxX) + 1;
  const y1 = Math.ceil(shape.maxY) + 1;
  const width = x1 - x0 + 1;
  const height = y1 - y0 + 3;
  const mask = new Uint8Array(width * height);
  for (let y = y0; y <= y1 + 2; y++) {
    for (let x = x0; x <= x1; x++) {
      if (shape.contains(x + 0.5, y + 0.5)) mask[(y - y0) * width + (x - x0)] = 1;
    }
  }
  const isInside = (x        , y        ) =>
    x >= x0 && x <= x1 && y >= y0 && y <= y1 + 2 && mask[(y - y0) * width + (x - x0)] === 1;

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isInside(x, y)) {
        const edgeDepth = !isInside(x, y + 1) ? 0 : !isInside(x, y + 2) ? 1 : 2;
        const color = fill(x, y, edgeDepth);
        if (color) buffer.set(x, y, color);
      } else if (
        outline &&
        (isInside(x - 1, y) || isInside(x + 1, y) || isInside(x, y - 1) || isInside(x, y + 1))
      ) {
        buffer.set(x, y, outline);
      }
    }
  }
}

export const solid = (color      )       => () => color;

/** Kürk dolgusu: bölge fonksiyonu desenin rengini seçer, alt kenar bir ton koyulaşır. */
function fur(coat      , region                               , shadeDepth = 0, isFar = false)       {
  return (x, y, edgeDepth) => {
    const kind = region(x + 0.5, y + 0.5);
    return isFar || edgeDepth <= shadeDepth ? coat.shade[kind] : coat.color[kind];
  };
}

export function drawBitmap(
  buffer             ,
  left        ,
  top        ,
  rows                   ,
  palette                      ,
) {
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const color = palette[row[dx]];
      if (color) buffer.set(Math.round(left) + dx, Math.round(top) + dy, color);
    }
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Sahne karesi: poz + aksesuarlar + efektler                                                 */
/* ------------------------------------------------------------------------------------------ */

                                                            
                                                              

/** Karışabilen (lerp) sayısal alanlar. */
                        
                
                
                 
                 
                    
                
                
                   
                  
                  
                    
                    
               
               
                     
                     
                    
                    
                    
                    
                   
                   
                    
                    
                   
                   
                
                
                   
                
                 
 

                         
             
                 
                    
                         
                      
                                                                     
                         
                                                   
                         
                          
 

                                                      

const NUMERIC_KEYS = [
  "bodyX", "bodyY", "bodyRx", "bodyRy", "bodyAngle", "headX", "headY", "headTilt", "earPerk",
  "pupilDX", "shoulderX", "shoulderY", "hipX", "hipY", "frontNearX", "frontNearY", "frontFarX",
  "frontFarY", "backNearX", "backNearY", "backFarX", "backFarY", "tailCtrlX", "tailCtrlY",
  "tailTipX", "tailTipY", "yarnX", "yarnY", "yarnRoll", "bowlX", "kibble",
]                                                     ;

/** Sayısal alanları karıştırır, ayrık alanlar (göz, ağız, efekt) hedef kareden gelir. */
export function mixFrames(from            , to            , progress        )             {
  const result             = { ...to };
  for (const key of NUMERIC_KEYS) result[key] = from[key] + (to[key] - from[key]) * progress;
  return result;
}

const OFFSTAGE_X = 104;

/* ------------------------------------------------------------------------------------------ */
/* Kedi çizimi                                                                                */
/* ------------------------------------------------------------------------------------------ */

function bodyRegion(frame            ) {
  const cos = Math.cos(frame.bodyAngle);
  const sin = Math.sin(frame.bodyAngle);
  const isTabby = frame.coat.pattern === "tabby";
  return (x        , y        )      => {
    const dx = x - frame.bodyX;
    const dy = y - frame.bodyY;
    const u = (dx * cos + dy * sin) / frame.bodyRx;
    const v = (-dx * sin + dy * cos) / frame.bodyRy;
    if (v > 0.38 + 0.12 * Math.sin(u * 6)) return "white";
    if (u > 0.62 + 0.1 * Math.sin(v * 5)) return "white";
    if (isTabby) return Math.sin(u * 10 + v * 2.2) > 0.55 ? "dark" : "main";
    if (u < -0.15 + 0.18 * Math.sin(v * 4 + 1)) return "dark";
    return "main";
  };
}

export function drawShadow(buffer             , frame            ) {
  const left = Math.min(frame.backFarX, frame.hipX, frame.bodyX - frame.bodyRx) - 2;
  const right = Math.max(frame.frontNearX, frame.bodyX + frame.bodyRx) + 3;
  paint(buffer, ellipse((left + right) / 2, GROUND_Y + 0.5, (right - left) / 2, 1.6), solid(COLORS.shadow), null);
}

function sampleTail(frame            ) {
  const cos = Math.cos(frame.bodyAngle);
  const sin = Math.sin(frame.bodyAngle);
  const baseU = -0.9 * frame.bodyRx;
  const baseV = 0.1 * frame.bodyRy;
  const baseX = frame.bodyX + baseU * cos - baseV * sin;
  const baseY = frame.bodyY + baseU * sin + baseV * cos;
  const points                          = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    points.push([
      a * baseX + b * frame.tailCtrlX + c * frame.tailTipX,
      a * baseY + b * frame.tailCtrlY + c * frame.tailTipY,
    ]);
  }
  return points;
}

function drawTail(buffer             , frame            ) {
  const points = sampleTail(frame);
  const segments = points.length - 1;
  const nearest = (x        , y        ) => {
    let best = { distance: Infinity, s: 0 };
    for (let i = 0; i < segments; i++) {
      const [ax, ay] = points[i];
      const [bx, by] = points[i + 1];
      const hit = distanceToSegment(x, y, ax, ay, bx, by);
      if (hit.distance < best.distance) best = { distance: hit.distance, s: (i + hit.t) / segments };
    }
    return best;
  };
  const radiusAt = (s        ) => 2.3 - 0.7 * s;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const shape        = {
    minX: Math.min(...xs) - 3,
    minY: Math.min(...ys) - 3,
    maxX: Math.max(...xs) + 3,
    maxY: Math.max(...ys) + 3,
    contains: (x, y) => {
      const hit = nearest(x, y);
      return hit.distance <= radiusAt(hit.s);
    },
  };
  const isTabby = frame.coat.pattern === "tabby";
  paint(
    buffer,
    shape,
    fur(frame.coat, (x, y) => {
      const { s } = nearest(x, y);
      if (s > 0.78) return "dark";
      if (isTabby) return Math.sin(s * 24) > 0.45 ? "dark" : "main";
      if (s > 0.38 && s < 0.55) return "dark";
      return "main";
    }),
  );
}

function drawLeg(
  buffer             ,
  coat      ,
  fromX        ,
  fromY        ,
  pawX        ,
  pawY        ,
  options                                                                    ,
) {
  const parts          = [
    capsule(fromX, fromY, pawX, pawY, options.radius),
    ellipse(pawX + 0.8, pawY, options.radius + 0.6, 1.9),
  ];
  if (options.haunch) parts.push(ellipse(fromX, fromY, options.haunch, options.haunch * 0.9));
  const sockStart = 3.2;
  paint(
    buffer,
    union(...parts),
    fur(
      coat,
      (x, y) => (Math.hypot(x - pawX, y - pawY) < sockStart || y > pawY - 1 ? "white" : options.upperFur),
      0,
      options.isFar,
    ),
  );
}

/** Baş yerel koordinatını (eğim uygulanmış) dünya koordinatına çevirir. */
export function headPoint(frame            , lx        , ly        )                   {
  const cos = Math.cos(frame.headTilt);
  const sin = Math.sin(frame.headTilt);
  return [frame.headX + lx * cos - ly * sin, frame.headY + lx * sin + ly * cos];
}

const HEAD_RX = 8;
const HEAD_RY = 6.5;

function drawEar(buffer             , frame            , side        ) {
  const { coat } = frame;
  const earColor = coat.color[coat.pattern === "calico" && side < 0 ? "dark" : "main"];
  if (coat.isFoldEar) {
    // Katlanık kulak: başın üstünde öne yatmış küçük bir kapak, içi görünmez.
    paint(
      buffer,
      polygon([
        headPoint(frame, side * 7.4, -2.6),
        headPoint(frame, side * 6.6, -7.4 - frame.earPerk * 0.6),
        headPoint(frame, side * 2.6, -7.2),
        headPoint(frame, side * 1.8, -5.4),
      ]),
      solid(earColor),
    );
    return;
  }
  const perk = frame.earPerk;
  const tipX = side * (6.5 + (1 - perk) * 3);
  const tipY = -6 - perk * 5;
  const outer = polygon([
    headPoint(frame, side * 7.8, -1.5),
    headPoint(frame, tipX, tipY),
    headPoint(frame, side * 1.2, -6),
  ]);
  const inner = polygon([
    headPoint(frame, side * 6.2, -3),
    headPoint(frame, tipX - side * 0.6, tipY + 2.2),
    headPoint(frame, side * 3, -5.5),
  ]);
  paint(buffer, outer, solid(earColor));
  paint(buffer, inner, solid(COLORS.pink), null);
}

const eyePalette = (coat      )                       => ({
  G: coat.eye,
  P: COLORS.pupil,
  W: COLORS.glint,
  K: COLORS.outline,
});

function eyeRows(state          , pupilSide                  )                    {
  switch (state) {
    case "open":
      return pupilSide === "left" ? ["WG", "PG", "PG"] : ["GW", "GP", "GP"];
    case "half":
      return pupilSide === "left" ? ["KK", "PG"] : ["KK", "GP"];
    case "happy":
      return [".K.", "K.K"];
    case "closed":
      return ["...", "KKK"];
  }
}

function drawHead(buffer             , frame            ) {
  drawEar(buffer, frame, -1);
  drawEar(buffer, frame, 1);

  const cos = Math.cos(frame.headTilt);
  const sin = Math.sin(frame.headTilt);
  const isTabby = frame.coat.pattern === "tabby";
  paint(
    buffer,
    ellipse(frame.headX, frame.headY, HEAD_RX, HEAD_RY, frame.headTilt),
    fur(frame.coat, (x, y) => {
      const dx = x - frame.headX;
      const dy = y - frame.headY;
      const u = (dx * cos + dy * sin) / HEAD_RX;
      const v = (-dx * sin + dy * cos) / HEAD_RY;
      if ((u / 0.62) ** 2 + ((v - 0.62) / 0.6) ** 2 <= 1) return "white";
      if (isTabby) {
        // Alında "M": üç kısa dikey çizgi; yanaklarda birer yatay çizgi.
        if (v < -0.3 && Math.abs(u) < 0.42 && Math.abs(((u + 0.42) % 0.28) - 0.07) < 0.07) return "dark";
        if (Math.abs(u) > 0.72 && Math.abs(v - 0.1) < 0.1) return "dark";
        return "main";
      }
      if (Math.abs(u) < 0.13 && v > -0.75) return "white";
      return u < 0 ? "dark" : "main";
    }),
  );

  // Gözler: göz bebeği bakış yönüne kayar; ortada iken iki göz de izleyene bakar.
  const leftPupil = frame.pupilDX < -0.3 ? "left" : "right";
  const rightPupil = frame.pupilDX > 0.3 ? "right" : "left";
  const eyeTop = frame.eyes === "open" ? -1 : 0;
  const [lx, ly] = headPoint(frame, -3.8, eyeTop);
  const [rx, ry] = headPoint(frame, 2.6, eyeTop);
  const leftRows = eyeRows(frame.eyes, leftPupil);
  const rightRows = eyeRows(frame.eyes, rightPupil);
  const shift = leftRows[0].length === 3 ? -0.5 : 0;
  const palette = eyePalette(frame.coat);
  drawBitmap(buffer, lx + shift, ly, leftRows, palette);
  drawBitmap(buffer, rx + shift, ry, rightRows, palette);

  const [nx, ny] = headPoint(frame, 0, 2);
  buffer.set(Math.round(nx), Math.round(ny), COLORS.pink);
  drawMouth(buffer, frame, Math.round(nx), Math.round(ny));

  for (const side of [-1, 1]         ) {
    for (const [x0, y0, y1] of [
      [8.5, 1.5, 1],
      [8.5, 3.5, 4.5],
    ]         ) {
      const [ax, ay] = headPoint(frame, side * x0, y0);
      const [bx, by] = headPoint(frame, side * (x0 + 2.5), y1);
      buffer.set(Math.round(ax), Math.round(ay), COLORS.whisker);
      buffer.set(Math.round((ax + bx) / 2), Math.round((ay + by) / 2), COLORS.whisker);
      buffer.set(Math.round(bx), Math.round(by), COLORS.whisker);
    }
  }
}

function drawMouth(buffer             , frame            , noseX        , noseY        ) {
  const k = COLORS.outline;
  switch (frame.mouth) {
    case "none":
      buffer.set(noseX - 1, noseY + 1, k);
      buffer.set(noseX + 1, noseY + 1, k);
      break;
    case "smile":
      buffer.set(noseX, noseY + 1, k);
      buffer.set(noseX - 1, noseY + 2, k);
      buffer.set(noseX + 1, noseY + 2, k);
      break;
    case "open":
      drawBitmap(buffer, noseX - 1, noseY + 1, ["KKK", "KPK", ".K."], { K: k, P: COLORS.pink });
      break;
    case "tongue":
      buffer.set(noseX - 1, noseY + 1, k);
      buffer.set(noseX + 1, noseY + 1, k);
      buffer.set(noseX, noseY + 1, COLORS.pink);
      buffer.set(noseX, noseY + 2, COLORS.pink);
      break;
  }
}

export function drawCat(buffer             , frame            ) {
  const { coat } = frame;
  // Calico: arka bacaklar koyu leke, ön bacaklar beyaz. Tekir: ikisi de ana renk.
  const backFur      = coat.pattern === "calico" ? "dark" : "main";
  const frontFur      = coat.pattern === "calico" ? "white" : "main";
  if (!frame.isTailInFront) drawTail(buffer, frame);

  drawLeg(buffer, coat, frame.hipX - 2, frame.hipY - 1, frame.backFarX, frame.backFarY, {
    radius: 2.2,
    isFar: true,
    upperFur: backFur,
  });
  drawLeg(buffer, coat, frame.shoulderX - 2, frame.shoulderY - 1, frame.frontFarX, frame.frontFarY, {
    radius: 2,
    isFar: true,
    upperFur: frontFur,
  });

  paint(
    buffer,
    ellipse(frame.bodyX, frame.bodyY, frame.bodyRx, frame.bodyRy, frame.bodyAngle),
    fur(coat, bodyRegion(frame), 1),
  );

  drawLeg(buffer, coat, frame.hipX, frame.hipY, frame.backNearX, frame.backNearY, {
    radius: 2.3,
    isFar: false,
    haunch: 4.6,
    upperFur: backFur,
  });
  const drawNearFrontLeg = () =>
    drawLeg(buffer, coat, frame.shoulderX, frame.shoulderY, frame.frontNearX, frame.frontNearY, {
      radius: 2.1,
      isFar: false,
      upperFur: frontFur,
    });
  if (!frame.isPawOverHead) drawNearFrontLeg();

  if (frame.isTailInFront) drawTail(buffer, frame);
  drawHead(buffer, frame);
  if (frame.isPawOverHead) drawNearFrontLeg();
}

/* ------------------------------------------------------------------------------------------ */
/* Aksesuarlar ve efektler                                                                    */
/* ------------------------------------------------------------------------------------------ */

const YARN_RADIUS = 4.6;

function drawYarn(buffer             , frame            ) {
  if (frame.yarnX > SCENE_WIDTH + 8) return;
  const cx = frame.yarnX;
  const cy = frame.yarnY;
  // Arkasında yerde kalan ip.
  for (let i = 0; i < 9; i++) {
    const x = Math.round(cx + YARN_RADIUS + 1 + i);
    const y = GROUND_Y - (i % 4 === 1 ? 1 : 0);
    if (y <= GROUND_Y) buffer.set(x, y, COLORS.yarnShade);
  }
  const roll = frame.yarnRoll;
  paint(buffer, ellipse(cx, cy, YARN_RADIUS, YARN_RADIUS), (x, y, edgeDepth) => {
    const u = x + 0.5 - cx;
    const v = y + 0.5 - cy;
    // Yuvarlanma açısıyla dönen iki kavisli iplik ailesi; biri topun bir yarısında, diğeri öbüründe.
    const along = u * Math.cos(roll) + v * Math.sin(roll);
    const across = -u * Math.sin(roll) + v * Math.cos(roll);
    const family = across > 0.3 * along ? along + across * across * 0.18 : across - along * along * 0.18;
    const isStrandLine = ((family % 2.4) + 2.4) % 2.4 < 0.8;
    if (edgeDepth === 0 || u + v > 4.4) return isStrandLine ? COLORS.yarnShade : COLORS.yarn;
    if (u + v < -3.2 && !isStrandLine) return COLORS.yarnLight;
    return isStrandLine ? COLORS.yarnShade : COLORS.yarn;
  });
}

function drawBowl(buffer             , frame            ) {
  if (frame.bowlX > SCENE_WIDTH + 12) return;
  const cx = frame.bowlX;
  const rimY = 45;
  if (frame.kibble > 0.02) {
    const mound = clip(ellipse(cx, rimY + 0.5, 6, 0.8 + 3 * frame.kibble), rimY + 1);
    paint(buffer, mound, (x, y) =>
      (x * 7 + y * 3) % 5 === 0 ? COLORS.kibbleShade : COLORS.kibble,
    );
  } else {
    paint(buffer, ellipse(cx, rimY, 6.5, 1.2), solid(COLORS.bowlInside), null);
  }
  const body = union(
    polygon([
      [cx - 8, rimY],
      [cx + 8, rimY],
      [cx + 6, GROUND_Y + 1],
      [cx - 6, GROUND_Y + 1],
    ]),
  );
  paint(buffer, body, (x, y, edgeDepth) => {
    if (y <= rimY) return COLORS.bowlRim;
    if (edgeDepth === 0 || x + 0.5 > cx + 4) return COLORS.bowlShade;
    return COLORS.bowl;
  });
}

const Z_GLYPH = ["KKKK", "..K.", ".K..", "KKKK"];
const HEART_GLYPH = [".K.K.", "KKKKK", "KKKKK", ".KKK.", "..K.."];
const ALERT_GLYPH = ["KK", "KK", "KK", "..", "KK"];

export function withAlpha(color      , alpha        )       {
  return [color[0], color[1], color[2], Math.round(color[3] * Math.max(0, Math.min(1, alpha)))];
}

export function drawZzz(buffer             , frame            , time        ) {
  const period = 3;
  for (let i = 0; i < 3; i++) {
    const phase = ((time + i * (period / 3)) % period) / period;
    const x = frame.headX + 5 + phase * 13 + Math.sin(phase * Math.PI * 2) * 1.5;
    const y = frame.headY - 8 - phase * 24;
    const alpha = phase < 0.15 ? phase / 0.15 : phase > 0.75 ? (1 - phase) / 0.25 : 1;
    drawBitmap(buffer, x, y, Z_GLYPH, { K: withAlpha(COLORS.zzz, alpha) });
  }
}

export function drawHearts(buffer             , frame            , progress        ) {
  [0, 0.25].forEach((delay, i) => {
    const p = (progress - delay) / 0.75;
    if (p <= 0 || p >= 1) return;
    const x = frame.headX - 3 + i * 7 + Math.sin(p * Math.PI * 3 + i) * 1.5;
    const y = frame.headY - 12 - p * 12;
    drawBitmap(buffer, x, y, HEART_GLYPH, { K: withAlpha(COLORS.heart, p > 0.7 ? (1 - p) / 0.3 : 1) });
  });
}

export function drawAlert(buffer             , frame            , progress        ) {
  const pop = Math.min(1, progress / 0.2);
  const y = frame.headY - 16 - pop * 2;
  const color = withAlpha(COLORS.alert, progress > 0.8 ? (1 - progress) / 0.2 : 1);
  drawBitmap(buffer, frame.headX + 9, y, ALERT_GLYPH, { K: color });
}

/**
 * Koyu zeminde koyu kontur kaybolur: kontur renkli her pikselin boş komşularına yarı saydam açık
 * bir piksel basar, siluet zeminden ayrılır.
 */
export function drawRim(buffer             , color      ) {
  const { width, height, data } = buffer;
  const isOutline = (x        , y        ) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    const i = (y * width + x) * 4;
    return data[i + 3] === 255 && data[i] === COLORS.outline[0] && data[i + 1] === COLORS.outline[1] && data[i + 2] === COLORS.outline[2];
  };
  const rim                          = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] !== 0) continue;
      if (isOutline(x - 1, y) || isOutline(x + 1, y) || isOutline(x, y - 1) || isOutline(x, y + 1)) rim.push([x, y]);
    }
  }
  for (const [x, y] of rim) buffer.set(x, y, color);
}

                                
                                                             
                   
 

export function renderScene(buffer             , frame            , time        , options                = {}) {
  buffer.clear();
  drawShadow(buffer, frame);
  drawYarn(buffer, frame);
  drawCat(buffer, frame);
  drawBowl(buffer, frame);
  if (frame.isSleeping) drawZzz(buffer, frame, time);
  if (frame.heartsProgress !== undefined) drawHearts(buffer, frame, frame.heartsProgress);
  if (frame.alertProgress !== undefined) drawAlert(buffer, frame, frame.alertProgress);
  if (options.hasRim) drawRim(buffer, COLORS.rim);
}

/* ------------------------------------------------------------------------------------------ */
/* Pozlar                                                                                     */
/* ------------------------------------------------------------------------------------------ */

const PROPS_OFFSTAGE = { yarnX: OFFSTAGE_X, yarnY: GROUND_Y - YARN_RADIUS, yarnRoll: 0, bowlX: OFFSTAGE_X, kibble: 1 };

export const SIT             = {
  bodyX: 38, bodyY: 40.5, bodyRx: 10, bodyRy: 8, bodyAngle: -0.55,
  headX: 47, headY: 27, headTilt: 0, earPerk: 1, pupilDX: 0,
  shoulderX: 45, shoulderY: 39, hipX: 33, hipY: 44,
  frontNearX: 47, frontNearY: PAW_Y, frontFarX: 44, frontFarY: PAW_Y,
  backNearX: 38.5, backNearY: PAW_Y, backFarX: 35, backFarY: PAW_Y,
  tailCtrlX: 18, tailCtrlY: 50, tailTipX: 17, tailTipY: 38,
  ...PROPS_OFFSTAGE,
  coat: COATS.calico, eyes: "open", mouth: "none", isTailInFront: false, isSleeping: false, isPawOverHead: false,
};

const SLEEP             = {
  ...SIT,
  bodyX: 40, bodyY: 44, bodyRx: 14, bodyRy: 6.5, bodyAngle: 0,
  headX: 55, headY: 43.5, headTilt: 0.12, earPerk: 0.25,
  shoulderX: 50, shoulderY: 46, hipX: 30, hipY: 45.5,
  frontNearX: 59, frontNearY: PAW_Y, frontFarX: 56, frontFarY: PAW_Y,
  backNearX: 35, backNearY: PAW_Y, backFarX: 32, backFarY: PAW_Y,
  tailCtrlX: 22, tailCtrlY: 53, tailTipX: 42, tailTipY: 50,
  eyes: "closed", isTailInFront: true, isSleeping: true,
};

const STRETCH             = {
  ...SIT,
  bodyX: 38, bodyY: 39, bodyRx: 13, bodyRy: 6.5, bodyAngle: 0.28,
  headX: 54, headY: 41, headTilt: 0.1, earPerk: 0.6,
  shoulderX: 47, shoulderY: 43, hipX: 29, hipY: 36,
  frontNearX: 61, frontNearY: PAW_Y, frontFarX: 58, frontFarY: PAW_Y,
  backNearX: 30, backNearY: PAW_Y, backFarX: 27, backFarY: PAW_Y,
  tailCtrlX: 18, tailCtrlY: 28, tailTipX: 24, tailTipY: 20,
  eyes: "happy", mouth: "open",
};

const CROUCH             = {
  ...SIT,
  bodyX: 36, bodyY: 43, bodyRx: 12, bodyRy: 6.5, bodyAngle: 0.08,
  headX: 50, headY: 39, headTilt: 0, earPerk: 1, pupilDX: 1,
  shoulderX: 45, shoulderY: 44, hipX: 28, hipY: 42.5,
  frontNearX: 52, frontNearY: PAW_Y, frontFarX: 49, frontFarY: PAW_Y,
  backNearX: 33, backNearY: PAW_Y, backFarX: 30, backFarY: PAW_Y,
  tailCtrlX: 14, tailCtrlY: 46, tailTipX: 12, tailTipY: 37,
};

const EAT             = {
  ...SIT,
  bodyX: 40, bodyY: 40, bodyRx: 12, bodyRy: 7, bodyAngle: 0.2,
  headX: 58, headY: 42, headTilt: 0.25, earPerk: 0.9,
  shoulderX: 49, shoulderY: 42, hipX: 31, hipY: 40,
  frontNearX: 52, frontNearY: PAW_Y, frontFarX: 49, frontFarY: PAW_Y,
  backNearX: 33, backNearY: PAW_Y, backFarX: 30, backFarY: PAW_Y,
  tailCtrlX: 20, tailCtrlY: 28, tailTipX: 26, tailTipY: 22,
  eyes: "happy",
};

/* ------------------------------------------------------------------------------------------ */
/* Zaman çizelgesi                                                                            */
/* ------------------------------------------------------------------------------------------ */

export const clamp01 = (value        ) => Math.max(0, Math.min(1, value));
export const easeInOut = (t        ) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
/** `t`'nin [start, end] aralığındaki yumuşatılmış ilerlemesi. */
export const phase = (t        , start        , end        ) => easeInOut(clamp01((t - start) / (end - start)));

export function withTailSwish(frame            , time        , amount = 2.5)             {
  return { ...frame, tailTipX: frame.tailTipX + Math.sin(time * 2.4) * amount, tailCtrlX: frame.tailCtrlX + Math.sin(time * 2.4 - 0.8) * amount * 0.4 };
}

                   
                   
                                                 
 

const sleepLoop          = {
  duration: 4,
  frame: (t) => {
    const breath = Math.sin((t / 4) * Math.PI * 2 * 1);
    return {
      ...SLEEP,
      bodyRy: SLEEP.bodyRy + breath * 0.45,
      bodyY: SLEEP.bodyY - breath * 0.3,
      headY: SLEEP.headY - breath * 0.25,
      earPerk: SLEEP.earPerk + (t > 2.6 && t < 2.8 ? 0.5 : 0),
    };
  },
};

const wakeUp          = {
  duration: 2.8,
  frame: (t, time) => {
    if (t < 0.9) {
      return {
        ...SLEEP,
        earPerk: t < 0.25 ? SLEEP.earPerk : 1,
        eyes: t < 0.3 ? "closed" : t < 0.55 ? "open" : t < 0.65 ? "closed" : "open",
        isSleeping: false,
        isTailInFront: true,
        alertProgress: clamp01(t / 0.9),
      };
    }
    if (t < 1.9) {
      const p = phase(t, 0.9, 1.4);
      return { ...mixFrames({ ...SLEEP, isSleeping: false }, STRETCH, p), isTailInFront: p < 0.5 };
    }
    return withTailSwish(mixFrames(STRETCH, SIT, phase(t, 1.9, 2.6)), time, 1);
  },
};

const fallAsleep          = {
  duration: 2.6,
  frame: (t) => {
    if (t < 1.1) {
      const isYawning = t > 0.2 && t < 1;
      return { ...SIT, eyes: isYawning ? "happy" : "half", mouth: isYawning ? "open" : "none", earPerk: 0.7 };
    }
    const p = phase(t, 1.1, 2.3);
    return { ...mixFrames({ ...SIT, earPerk: 0.7 }, SLEEP, p), eyes: p < 0.6 ? "half" : "closed", isSleeping: p >= 1, isTailInFront: p > 0.5 };
  },
};

const idleSit          = {
  duration: 3.2,
  frame: (t, time) => {
    const isBlinking = (t > 1.3 && t < 1.45) || (t > 2.9 && t < 3.0);
    const look = t < 0.6 ? 0 : t < 1.2 ? -1 : t < 2.2 ? 1 : 0;
    return withTailSwish({ ...SIT, eyes: isBlinking ? "closed" : "open", pupilDX: look, earPerk: t > 2.3 && t < 2.45 ? 0.6 : 1 }, time);
  },
};

const BALL_REST_X = 64;

const playYarn          = {
  duration: 7,
  frame: (t, time) => {
    // Top sağdan yuvarlanarak gelir.
    let yarnX = OFFSTAGE_X + (BALL_REST_X - OFFSTAGE_X) * phase(t, 0, 1.1);
    let yarnY = GROUND_Y - YARN_RADIUS;
    let frame = mixFrames(SIT, CROUCH, phase(t, 0.6, 1.2));
    frame = { ...frame, pupilDX: 1 };

    // Popo sallama.
    if (t > 1.2 && t < 2.4) {
      const wiggle = Math.sin(t * 22) * 0.8;
      frame = { ...frame, bodyX: frame.bodyX + wiggle * 0.5, hipX: frame.hipX + wiggle, bodyAngle: frame.bodyAngle + wiggle * 0.03, tailTipX: frame.tailTipX + wiggle * 2 };
    }
    // Sıçrayıp pati atma.
    const pounce = phase(t, 2.4, 2.7) - phase(t, 3.3, 3.8);
    const raise = phase(t, 2.4, 2.65) - phase(t, 2.65, 2.85);
    const slam = phase(t, 2.65, 2.85) - phase(t, 3.3, 3.7);
    frame = {
      ...frame,
      bodyX: frame.bodyX + pounce * 3,
      shoulderX: frame.shoulderX + pounce * 3,
      headX: frame.headX + pounce * 3,
      headY: frame.headY - raise * 2,
      frontNearX: frame.frontNearX + pounce * 3 + raise * 10 + slam * 9,
      frontNearY: frame.frontNearY - raise * 14 - slam * 4,
      mouth: raise > 0.2 ? "open" : "none",
      isPawOverHead: raise + slam > 0.1,
    };
    // Vuruştan sonra top kaçar, sonra geri yuvarlanır.
    const away = phase(t, 2.8, 3.8) - phase(t, 4.3, 5.1);
    yarnX += away * 14;
    yarnY -= Math.sin(clamp01((t - 2.8) / 0.5) * Math.PI) * 4;
    // İkinci, hızlı dokunuş ve topu sahneden yollama.
    const tap = phase(t, 5.1, 5.3) - phase(t, 5.3, 5.5);
    frame = {
      ...frame,
      frontNearX: frame.frontNearX + tap * 9,
      frontNearY: frame.frontNearY - tap * 4,
      isPawOverHead: frame.isPawOverHead || tap > 0.1,
    };
    yarnX += phase(t, 5.35, 6.6) * (OFFSTAGE_X - BALL_REST_X);
    frame = mixFrames(frame, { ...SIT, pupilDX: 1 }, phase(t, 6, 6.9));

    const yarnRoll = -(yarnX - OFFSTAGE_X) / YARN_RADIUS;
    return withTailSwish({ ...frame, yarnX, yarnY, yarnRoll, pupilDX: 1 }, time, 1.5);
  },
};

const BOWL_REST_X = 64;

const eatFood          = {
  duration: 7,
  frame: (t, time) => {
    const bowlX = OFFSTAGE_X + (BOWL_REST_X - OFFSTAGE_X) * phase(t, 0, 0.9) + (OFFSTAGE_X - BOWL_REST_X) * phase(t, 6.2, 7);
    const lean = phase(t, 1, 1.5) - phase(t, 4.9, 5.4);
    let frame = mixFrames({ ...SIT, pupilDX: 1, mouth: "smile" }, EAT, lean);
    if (t < 1) frame = { ...frame, eyes: "open", mouth: t > 0.6 ? "smile" : "none", pupilDX: 1 };
    const kibble = 1 - phase(t, 1.5, 4.9);
    if (lean > 0.95) {
      const chew = Math.sin(t * 16);
      frame = { ...frame, headY: frame.headY + chew * 0.7, headTilt: frame.headTilt + chew * 0.05, mouth: chew > 0 ? "open" : "none", eyes: "happy" };
    }
    if (t > 5.2) frame = { ...frame, eyes: "happy", mouth: "tongue" };
    return withTailSwish({
      ...frame,
      bowlX,
      kibble,
      heartsProgress: t > 5.2 ? clamp01((t - 5.2) / 1.8) : undefined,
    }, time, 1.2);
  },
};

const groom          = {
  duration: 4,
  frame: (t, time) => {
    const lift = phase(t, 0.2, 0.7) - phase(t, 3.2, 3.8);
    const lick = Math.sin(t * 14);
    let frame             = {
      ...SIT,
      headTilt: -0.15 * lift,
      frontNearX: SIT.frontNearX + lift * 5,
      frontNearY: SIT.frontNearY - lift * 14 + (lift > 0.9 ? lick * 0.8 : 0),
      isPawOverHead: lift > 0.3,
    };
    if (lift > 0.6) frame = { ...frame, eyes: "happy", mouth: lick > 0 ? "tongue" : "none" };
    return withTailSwish(frame, time, 1.5);
  },
};

const AWAKE_LOOP                     = [idleSit, playYarn, idleSit, eatFood, idleSit, groom];

                                           

/** Hareket azaltma tercihinde gösterilen sabit kare. */
export function staticFrame(mode         )             {
  return mode === "sleeping" ? SLEEP : SIT;
}

const BLEND_SECONDS = 0.35;

/**
 * Modlar arası geçişi ve aktivite döngüsünü yönetir. Her segment kendi yerel zamanından kare
 * üretir; segment değişiminde önceki karenin üzerine kısa bir karışım uygulanır, böylece
 * kesintiye uğrayan bir aktivite bile (ör. top ekrandayken uyutmak) zıplamadan devam eder.
 */
export class PixelCatDirector {
          mode         ;
          intro                 = null;
          loopIndex = 0;
          segmentStart        ;
          blendFrom                    = null;
          lastFrame                    = null;

  constructor(mode         , now        ) {
    this.mode = mode;
    this.segmentStart = now;
  }

  setMode(mode         , now        ) {
    if (mode === this.mode) return;
    this.mode = mode;
    this.intro = mode === "awake" ? wakeUp : fallAsleep;
    this.loopIndex = 0;
    this.segmentStart = now;
    this.blendFrom = this.lastFrame;
  }

          currentSegment()          {
    if (this.intro) return this.intro;
    return this.mode === "sleeping" ? sleepLoop : AWAKE_LOOP[this.loopIndex % AWAKE_LOOP.length];
  }

  frameAt(now        )             {
    // Sekme arka plandayken uzun süre geçtiyse segmentleri tek tek tüketmek yerine sıfırla.
    if (now - this.segmentStart > 60) this.segmentStart = now;

    let segment = this.currentSegment();
    while (now - this.segmentStart >= segment.duration) {
      this.segmentStart += segment.duration;
      if (this.intro) this.intro = null;
      else this.loopIndex += 1;
      this.blendFrom = this.lastFrame;
      segment = this.currentSegment();
    }

    const localTime = now - this.segmentStart;
    let frame = segment.frame(localTime, now);
    if (this.blendFrom && localTime < BLEND_SECONDS) {
      frame = mixFrames(this.blendFrom, frame, easeInOut(localTime / BLEND_SECONDS));
    }
    this.lastFrame = frame;
    return frame;
  }
}
