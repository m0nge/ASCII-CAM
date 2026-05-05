// ── conjuntos de caracteres ──
const CHARSETS = [
  ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  ' ░▒▓█',
  ' .:1234567890',
  ' .-+*#@'
];

// ── estado ──
let currentCharset = CHARSETS[2];
let stream        = null;
let animId        = null;
let inverted      = false;
let blockSize     = 6;
let color         = '#00ff41';

// ── elementos del DOM ──
const video      = document.getElementById('hidden-video');
const canvas     = document.getElementById('hidden-canvas');
const ctx        = canvas.getContext('2d', { willReadFrequently: true });
const output     = document.getElementById('ascii-output');
const statusEl   = document.getElementById('status');
const btnStart   = document.getElementById('btn-start');
const btnStop    = document.getElementById('btn-stop');
const btnSnap    = document.getElementById('btn-snapshot');

// ── helpers ──
function setStatus(msg) {
  statusEl.textContent = msg;
}

function show(el)  { el.classList.remove('hidden'); }
function hide(el)  { el.classList.add('hidden'); }

// ── calcular columnas y filas según viewport y tamaño de bloque ──
function getGrid() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Ancho de un carácter monoespaciado en px (approx)
  const charPxW = blockSize * 0.55;
  const charPxH = blockSize * 1.1;

  const cols = Math.floor(vw / charPxW);
  const rows = Math.floor(vh / charPxH);

  return { cols, rows, charPxW, charPxH };
}

// ── iniciar cámara ──
async function startCamera() {
  try {
    setStatus('solicitando permiso...');
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width:  { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    video.srcObject = stream;
    await video.play();

    hide(btnStart);
    show(btnStop);
    show(btnSnap);
    setStatus('cámara activa ■');

    renderLoop();
  } catch (err) {
    setStatus('error: ' + err.message);
    output.textContent =
      'No se pudo acceder a la cámara.\n' +
      'Asegurate de dar permiso cuando el navegador lo solicite.\n\n' +
      '( ' + err.message + ' )';
  }
}

// ── detener cámara ──
function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (animId) cancelAnimationFrame(animId);
  stream = null;
  animId = null;

  output.textContent = 'Cámara detenida.';
  show(btnStart);
  hide(btnStop);
  hide(btnSnap);
  setStatus('detenido');
}

// ── loop de renderizado ──
function renderLoop() {
  if (!stream) return;
  renderFrame();
  animId = requestAnimationFrame(renderLoop);
}

// ── renderizar un frame ──
function renderFrame() {
  if (video.readyState < 2) return;

  const { cols, rows } = getGrid();

  // Tamaño del canvas oculto = cols*blockSize x rows*blockSize
  const cw = cols * blockSize;
  const ch = rows * blockSize;

  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width  = cw;
    canvas.height = ch;
  }

  // Dibujar video espejado
  ctx.save();
  ctx.translate(cw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, cw, ch);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, cw, ch);
  const pixels  = imgData.data;

  const set    = currentCharset;
  const maxIdx = set.length - 1;
  let result   = '';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let total = 0;
      let count = 0;
      const x0 = col * blockSize;
      const y0 = row * blockSize;

      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const idx = ((y0 + dy) * cw + (x0 + dx)) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          // luminancia percibida
          total += 0.299 * r + 0.587 * g + 0.114 * b;
          count++;
        }
      }

      let brightness = (total / count) / 255;
      if (inverted) brightness = 1 - brightness;

      const charIdx = Math.floor(brightness * maxIdx);
      result += set[charIdx];
    }
    result += '\n';
  }

  output.textContent = result;
}

// ── snapshot: descarga como .txt ──
function takeSnapshot() {
  if (!stream) return;
  renderFrame();
  const snap = output.textContent;
  const blob = new Blob([snap], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'ascii_snapshot_' + Date.now() + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus('snapshot guardado ✓');
  setTimeout(() => setStatus('cámara activa ■'), 2000);
}

// ── controles ──
function changeColor() {
  color = document.getElementById('color-select').value;
  output.style.color = color;
}

function changeCharset() {
  const idx = parseInt(document.getElementById('charset-select').value, 10);
  currentCharset = CHARSETS[idx];
}

function invertToggle() {
  inverted = document.getElementById('invert-check').checked;
}

function changeRes(val) {
  blockSize = parseInt(val, 10);
  document.getElementById('res-val').textContent = val;
}

// ── re-render al cambiar tamaño de ventana ──
window.addEventListener('resize', () => {
  if (stream) renderFrame();
});

changeCharset();
