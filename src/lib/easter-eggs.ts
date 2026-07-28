// Konami code
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;
export function initKonamiCode(onActivate: () => void) {
  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex >= KONAMI.length) { onActivate(); konamiIndex = 0; }
    } else { konamiIndex = 0; }
  });
}
// Hidden constellation
export function initConstellation(onComplete: () => void) {
  let clicks = 0;
  document.querySelectorAll('.star-pixel, .stars').forEach(el => {
    el.addEventListener('click', () => {
      clicks++;
      if (clicks >= 5) { onComplete(); clicks = 0; }
    });
  });
}
// Mouse shake detector
export function initMouseShake(onShake: () => void) {
  let lastX = 0, lastY = 0, shakes = 0, lastTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    const dx = Math.abs(e.clientX - lastX);
    const dy = Math.abs(e.clientY - lastY);
    if (dx > 50 && dy > 50 && now - lastTime < 100) {
      shakes++;
      if (shakes > 10) { onShake(); shakes = 0; }
    }
    lastX = e.clientX; lastY = e.clientY; lastTime = now;
  });
}
// Footer click counter
export function initFooterClicks(selector: string, onTriple: () => void) {
  let clicks = 0;
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener('click', () => {
    clicks++;
    setTimeout(() => clicks = 0, 2000);
    if (clicks >= 3) { onTriple(); clicks = 0; }
  });
}
