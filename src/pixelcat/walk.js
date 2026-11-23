// Ported from Haneko (webapp/src/lib/pixel-cat/walk.ts); types stripped, logic unchanged.
/**
 * Kedi motorunun yürüme pozu (AI sohbeti boş zemini, 2026-11-22). Motorun öbür pozları gibi
 * yalnız sayılar: ayakta duran kedi + adım döngüsü. Sahne koordinatları 88×56.
 *
 * Gerçek kedi yürüyüşü (ilk sürüm çapraz çiftlerle "robot gibi" bulundu): bacaklar sırayla kalkar
 * (arka-uzak → ön-uzak → arka-yakın → ön-yakın, çeyrek döngü arayla), her pati döngünün %60'ında
 * yerde. Kalça ve omuz kendi bacaklarıyla hafifçe iner kalkar, gövde buna göre çok az yalpalar;
 * baş omzu biraz gecikmeyle izler ve hafifçe sallanır; kuyruk yavaşça dalgalanır.
 *
 * Pati kaymasın diye (kullanıcı bildirdi: "kayıyor gibi"): yerdeki pati gövdeye göre sabit hızla
 * tam 1 sahne pikseli/kare geri gider. Çizen taraf kediyi her karede tam 1 sahne pikseli (bir
 * karo) ilerletirse yere basan pati ekranda yerinden hiç oynamaz.
 */

import { PAW_Y, SIT, easeInOut } from "./engine.js";

const STANDING             = {
  ...SIT,
  bodyX: 36, bodyY: 38.5, bodyRx: 12.5, bodyRy: 6.5, bodyAngle: 0.02,
  headX: 50.5, headY: 32.5, headTilt: 0, earPerk: 1, pupilDX: 1,
  shoulderX: 45, shoulderY: 41, hipX: 28, hipY: 40.5,
  // Patilerin adım ortası: omzun/kalçanın hemen altı (uzak bacak motorda 2 px geriden çizilir,
  // patisi yakınınkinin 1,5 px gerisinde). Eskiden ön-yakın omzun 3 px önündeydi: pati en geride
  // tam dik kalıyordu, geriye açılı kalkmıyordu (kullanıcı bildirdi).
  frontNearX: 45.5, frontNearY: PAW_Y, frontFarX: 44, frontFarY: PAW_Y,
  backNearX: 28.5, backNearY: PAW_Y, backFarX: 27, backFarY: PAW_Y,
  tailCtrlX: 16, tailCtrlY: 34, tailTipX: 13, tailTipY: 26,
  eyes: "open", mouth: "none", isTailInFront: false, isSleeping: false, isPawOverHead: false,
};

/** Bir adım döngüsündeki kare sayısı; kedi kare başına 1 sahne pikseli ilerler. */
export const WALK_FRAMES = 14;
/** Patinin yerde geçirdiği döngü payı (yavaş yürüyüşte yarıdan fazla). */
const DUTY = 0.6;
/** Yerdeki pati karede tam 1 piksel geri gitsin: 2 × STRIDE = DUTY × WALK_FRAMES. */
const STRIDE = (DUTY * WALK_FRAMES) / 2;
const LIFT = 1.8;

/** Bacakların döngüdeki gecikmesi: arka-uzak, ön-uzak, arka-yakın, ön-yakın sırasıyla kalkar. */
const LEG_DELAY = { backFar: 0, frontFar: 0.25, backNear: 0.5, frontNear: 0.75 }         ;

/** Yürüyen kedinin sahnede kapladığı alan (kuyruk ucu, kulak, bıyık ve gölgesiz pati dahil). */
export const WALK_CROP = { x: 8, y: 17, width: 56, height: 35 }         ;

/** Tek bacağın gövdeye göre konumu ve yerden yüksekliği; `u` bacağın kendi döngüsü. */
function legOffset(u        )                   {
  const t = ((u % 1) + 1) % 1;
  if (t < DUTY) return [STRIDE - (2 * STRIDE * t) / DUTY, 0];
  const swing = (t - DUTY) / (1 - DUTY);
  return [-STRIDE + easeInOut(swing) * 2 * STRIDE, Math.sin(Math.PI * swing) * LIFT];
}

/**
 * `frameIndex` 0..WALK_FRAMES-1 (fazlası döngüye sarılır); aynı kare hep aynı pozu verir
 * (önbelleğe alınabilir). `isBlinking`: gözler o karede kapalı.
 */
export function walkFrame(coat      , frameIndex        , isBlinking = false)             {
  const phase = (frameIndex % WALK_FRAMES) / WALK_FRAMES;
  const turn = phase * Math.PI * 2;
  const [frontNearX, frontNearLift] = legOffset(phase - LEG_DELAY.frontNear);
  const [frontFarX, frontFarLift] = legOffset(phase - LEG_DELAY.frontFar);
  const [backNearX, backNearLift] = legOffset(phase - LEG_DELAY.backNear);
  const [backFarX, backFarLift] = legOffset(phase - LEG_DELAY.backFar);

  // Kalça arka patiler, omuz ön patiler yerde ortadayken en yüksekte; ikisi çeyrek döngü kaymalı.
  const hipRise = 0.45 * Math.cos(2 * turn);
  const shoulderRise = 0.45 * Math.cos(2 * turn - Math.PI / 2);
  // Baş omzu biraz geriden izler ve döngüde bir kez hafifçe sallanır.
  const headRise = 0.5 * Math.cos(2 * turn - Math.PI / 2 - 0.7);
  const tailSway = Math.sin(turn);

  return {
    ...STANDING,
    coat,
    eyes: isBlinking ? "closed" : "open",
    bodyY: STANDING.bodyY - (hipRise + shoulderRise) / 2,
    bodyAngle: STANDING.bodyAngle + (hipRise - shoulderRise) * 0.025,
    hipY: STANDING.hipY - hipRise,
    shoulderY: STANDING.shoulderY - shoulderRise,
    headY: STANDING.headY - headRise,
    headTilt: Math.sin(turn + 0.6) * 0.04,
    frontNearX: STANDING.frontNearX + frontNearX,
    frontNearY: PAW_Y - frontNearLift,
    frontFarX: STANDING.frontFarX + frontFarX,
    frontFarY: PAW_Y - frontFarLift,
    backNearX: STANDING.backNearX + backNearX,
    backNearY: PAW_Y - backNearLift,
    backFarX: STANDING.backFarX + backFarX,
    backFarY: PAW_Y - backFarLift,
    // Kuyruk ucu yumuşak bir yay çizer: sağa-sola ve biraz yukarı-aşağı, gövdeden geç gelir.
    tailCtrlX: STANDING.tailCtrlX + Math.sin(turn - 0.9) * 0.8,
    tailTipX: STANDING.tailTipX + tailSway * 1.8,
    tailTipY: STANDING.tailTipY + Math.cos(turn) * 0.9,
  };
}
