type AuroraParticle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  breathFreq: number;
  breathPhase: number;
  coreR: number;
  coreA: number;
  col: string;
};

export type BaishouAuroraController = {
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

const AURORA_COLORS = ['91,168,245', '167,139,250', '52,211,153', '244,114,182'];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const makeParticle = (index: number, width: number, height: number): AuroraParticle => {
  const asp = 1.7;
  const r = rnd(320, 620);
  return {
    x: rnd(0, width),
    y: rnd(0, height),
    r,
    vx: rnd(-0.6, 0.6) * asp,
    vy: rnd(-0.8, -0.15) * asp,
    a: rnd(0.13, 0.24),
    breathFreq: rnd(0.0003, 0.0008) * asp,
    breathPhase: rnd(0, Math.PI * 2),
    coreR: r * rnd(0.08, 0.2),
    coreA: rnd(0.45, 0.8),
    col: AURORA_COLORS[index % AURORA_COLORS.length],
  };
};

export const initBaishouAurora = (
  canvas: HTMLCanvasElement
): BaishouAuroraController | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const particles: AuroraParticle[] = [];
  let animationId = 0;
  let running = false;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const wrap = (particle: AuroraParticle) => {
    if (particle.x < -60) particle.x = width + 60;
    if (particle.x > width + 60) particle.x = -60;
    if (particle.y < -60) particle.y = height + 60;
    if (particle.y > height + 60) particle.y = -60;
  };

  const initParticles = () => {
    particles.length = 0;
    for (let i = 0; i < 12; i += 1) {
      particles.push(makeParticle(i, width, height));
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  };

  const draw = () => {
    if (!running) return;

    const time = performance.now();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      wrap(particle);

      const breath = 0.5 + 0.5 * Math.sin(time * particle.breathFreq + particle.breathPhase);
      const alpha = particle.a * (0.45 + 0.55 * breath);

      const glow = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.r
      );
      glow.addColorStop(0, `rgba(${particle.col},${alpha})`);
      glow.addColorStop(0.4, `rgba(${particle.col},${alpha * 0.4})`);
      glow.addColorStop(1, `rgba(${particle.col},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();

      if (particle.coreR > 0) {
        const core = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.coreR
        );
        core.addColorStop(0, `rgba(255,255,255,${particle.coreA})`);
        core.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.coreR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    animationId = window.requestAnimationFrame(draw);
  };

  const start = () => {
    if (running) return;
    running = true;
    resize();
    draw();
  };

  const stop = () => {
    running = false;
    window.cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const onResize = () => {
    if (!running) return;
    resize();
  };

  window.addEventListener('resize', onResize);

  return {
    start,
    stop,
    destroy: () => {
      stop();
      window.removeEventListener('resize', onResize);
    },
  };
};
