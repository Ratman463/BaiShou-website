import Lenis from 'lenis';
import Snap from 'lenis/snap';
import type { VirtualScrollData } from 'lenis';

const MOBILE_BREAKPOINT = '(max-width: 768px)';
const WHEEL_THRESHOLD = 28;
const WHEEL_GESTURE_GAP = 90;

function getSections() {
  return Array.from(document.querySelectorAll<HTMLElement>('.snap-page'));
}

function initMobileScrollNav(onSectionChange?: (sectionId: string) => void): () => void {
  const sections = getSections();
  if (sections.length === 0) return () => {};

  document.documentElement.dataset.scrollMode = 'free';

  let activeId = sections[0].id;

  const setActiveSection = (id: string) => {
    if (!id || id === activeId) return;
    activeId = id;
    onSectionChange?.(id);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      const current = visible[0]?.target;
      if (current instanceof HTMLElement && current.id) {
        setActiveSection(current.id);
      }
    },
    {
      root: null,
      rootMargin: '-42% 0px -42% 0px',
      threshold: [0, 0.1, 0.25, 0.5],
    }
  );

  sections.forEach((section) => observer.observe(section));
  onSectionChange?.(sections[0].id);

  return () => {
    observer.disconnect();
    delete document.documentElement.dataset.scrollMode;
  };
}

function initDesktopSnapScroll(onSectionChange?: (sectionId: string) => void): () => void {
  const sections = getSections();
  if (sections.length === 0) return () => {};

  document.documentElement.dataset.scrollMode = 'snap';

  const lenis = new Lenis({
    autoRaf: true,
    duration: 1.1,
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1.2,
  });

  let isTransitioning = false;

  const notifySection = (index?: number) => {
    if (typeof index !== 'number') return;
    const section = sections[index];
    if (section?.id) onSectionChange?.(section.id);
  };

  const snap = new Snap(lenis, {
    type: 'lock',
    duration: 1.1,
    debounce: 0,
    distanceThreshold: 99999,
    onSnapStart: (item) => {
      isTransitioning = true;
      notifySection(item.index);
    },
    onSnapComplete: (item) => {
      isTransitioning = false;
      notifySection(item.index);
    },
  });

  snap.addElements(sections, { align: 'start' });
  snap.stop();

  let wheelDelta = 0;
  let lastWheelAt = 0;

  const navigate = (direction: 1 | -1) => {
    if (isTransitioning) return;
    if (direction > 0) snap.next();
    else snap.previous();
  };

  const onVirtualScroll = (data: VirtualScrollData) => {
    if (document.documentElement.classList.contains('modal-open')) return;
    if (data.event.type === 'touchmove') return;

    if (isTransitioning) {
      wheelDelta = 0;
      return;
    }

    const now = performance.now();
    if (now - lastWheelAt > WHEEL_GESTURE_GAP) wheelDelta = 0;
    lastWheelAt = now;

    wheelDelta += data.deltaY;
    if (Math.abs(wheelDelta) < WHEEL_THRESHOLD) return;

    navigate(wheelDelta > 0 ? 1 : -1);
    wheelDelta = 0;
  };

  lenis.on('virtual-scroll', onVirtualScroll);

  const onAnchorClick = (event: Event) => {
    const link = event.currentTarget;
    if (!(link instanceof HTMLAnchorElement)) return;

    const id = link.getAttribute('href')?.slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target || !sections.includes(target)) return;

    event.preventDefault();
    if (isTransitioning) return;

    const index = sections.indexOf(target);
    if (index >= 0) snap.goTo(index);
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', onAnchorClick);
  });

  onSectionChange?.(sections[0].id);

  const isTypingTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      target.isContentEditable
    );
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (document.documentElement.classList.contains('modal-open')) return;
    if (isTypingTarget(event.target)) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        navigate(1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        navigate(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (!isTransitioning) snap.goTo(0);
        break;
      case 'End':
        event.preventDefault();
        if (!isTransitioning) snap.goTo(sections.length - 1);
        break;
      default:
        break;
    }
  };

  window.addEventListener('keydown', onKeyDown);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      link.removeEventListener('click', onAnchorClick);
    });
    lenis.off('virtual-scroll', onVirtualScroll);
    snap.destroy();
    lenis.destroy();
    delete document.documentElement.dataset.scrollMode;
  };
}

function createScrollController(onSectionChange?: (sectionId: string) => void) {
  const mobileMq = window.matchMedia(MOBILE_BREAKPOINT);

  let cleanup = mobileMq.matches
    ? initMobileScrollNav(onSectionChange)
    : initDesktopSnapScroll(onSectionChange);

  const onModeChange = () => {
    cleanup();
    cleanup = mobileMq.matches
      ? initMobileScrollNav(onSectionChange)
      : initDesktopSnapScroll(onSectionChange);
  };

  mobileMq.addEventListener('change', onModeChange);

  return () => {
    mobileMq.removeEventListener('change', onModeChange);
    cleanup();
  };
}

/**
 * 桌面端：Lenis + Snap 分屏吸附
 * 移动端：原生自由滚动 + IntersectionObserver 更新导航高亮
 */
export function initLenisScroll(onSectionChange?: (sectionId: string) => void): () => void {
  return createScrollController(onSectionChange);
}
