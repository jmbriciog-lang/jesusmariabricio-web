// Fondo animado del hero: red de nodos con deriva lenta.
// Sube o baja este único número para ajustar la intensidad de toda la animación.
const INTENSITY = 0.7; // 0 = apagado · 1 = máximo

(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  const DENSITY = 7500; // px² por nodo — más alto = menos nodos
  const MAX_SPEED = 0.14 * INTENSITY; // px/frame
  const LINK_DIST = 150;
  const NODE_RADIUS = 2.1;
  const NODE_OPACITY = 0.75 * INTENSITY;
  const LINE_OPACITY = 0.38 * INTENSITY;
  const NODE_COLOR = "222, 228, 240";
  const LINE_COLOR = "232, 53, 43";

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let rafId = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.max(18, Math.round((width * height) / DENSITY));
    nodes = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * LINE_OPACITY;
          ctx.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = `rgba(${NODE_COLOR}, ${NODE_OPACITY})`;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId) return;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!reduceMotion) start();
  });

  resize();

  if (reduceMotion || INTENSITY <= 0) {
    // Un único frame estático: sin movimiento, sin coste de CPU en segundo plano.
    step();
    cancelAnimationFrame(rafId);
    rafId = null;
  } else {
    start();
  }
})();
