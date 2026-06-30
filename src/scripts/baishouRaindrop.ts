type RaindropFXInstance = {
  start: () => Promise<void>;
  stop: () => void;
  destroy: () => void;
  resize: (width: number, height: number) => void;
};

type RaindropFXConstructor = new (options: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  background: HTMLImageElement | HTMLCanvasElement;
  mist?: boolean;
  dropletsPerSeconds?: number;
  spawnLimit?: number;
  raindropDiffuseLight?: number[];
  raindropSpecularLight?: number[];
  backgroundBlurSteps?: number;
}) => RaindropFXInstance;

declare global {
  interface Window {
    RaindropFX?: RaindropFXConstructor;
  }
}

const RAINDROP_SCRIPT = '/vendor/baishou/raindrop-fx.js';
const BACKGROUND_URL = '/assets/images/dark-city-bg.jpg';

export type BaishouRaindropController = {
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

const hasWebGL2 = () => {
  try {
    const test = document.createElement('canvas');
    return !!(test.getContext('webgl2') || test.getContext('experimental-webgl2'));
  } catch {
    return false;
  }
};

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

const loadBackground = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load background ${url}`));
    image.src = url;
  });

export const initBaishouRaindrop = (
  canvas: HTMLCanvasElement
): BaishouRaindropController | null => {
  if (!hasWebGL2()) return null;

  let fx: RaindropFXInstance | null = null;
  let running = false;
  let starting = false;
  let width = 0;
  let height = 0;
  let background: HTMLImageElement | null = null;
  let scriptReady = false;
  let backgroundReady = false;

  const measure = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const ensureAssets = async () => {
    if (!scriptReady) {
      await loadScript(RAINDROP_SCRIPT);
      scriptReady = true;
    }

    if (!window.RaindropFX) {
      throw new Error('RaindropFX is unavailable');
    }

    if (!backgroundReady) {
      background = await loadBackground(BACKGROUND_URL);
      backgroundReady = true;
    }
  };

  const createFx = async () => {
    await ensureAssets();
    if (!window.RaindropFX || !background) return;

    measure();

    if (fx) {
      fx.destroy();
      fx = null;
    }

    fx = new window.RaindropFX({
      canvas,
      width,
      height,
      background,
      mist: false,
      dropletsPerSeconds: 280,
      spawnLimit: 900,
      raindropDiffuseLight: [0.45, 0.5, 0.6],
      raindropSpecularLight: [0.15, 0.15, 0.15],
      backgroundBlurSteps: 4,
    });

    await fx.start();
  };

  const start = () => {
    if (running || starting) return;
    starting = true;

    createFx()
      .then(() => {
        running = true;
      })
      .catch((error) => {
        console.warn('[BaishouRaindrop] start failed', error);
        stop();
      })
      .finally(() => {
        starting = false;
      });
  };

  const stop = () => {
    running = false;
    starting = false;
    if (fx) {
      try {
        fx.stop();
        fx.destroy();
      } catch {
        /* ignore cleanup errors */
      }
      fx = null;
    }
  };

  const onResize = () => {
    if (!running || !fx) return;
    measure();
    try {
      fx.resize(width, height);
    } catch {
      /* ignore resize errors */
    }
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
