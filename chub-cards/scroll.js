(() => {
  const panel = document.querySelector('main');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let target = panel.scrollTop;
  let lastTime = 0;
  let paintedPosition = panel.scrollTop;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    target = panel.scrollTop;
  }

  function animate(time) {
    const elapsed = Math.min(time - lastTime, 64);
    lastTime = time;
    target = Math.max(0, Math.min(target, panel.scrollHeight - panel.clientHeight));
    const remaining = target - panel.scrollTop;
    if (Math.abs(remaining) < 1) {
      panel.scrollTop = target;
      paintedPosition = panel.scrollTop;
      frame = 0;
      return;
    }
    panel.scrollTop += remaining * (1 - Math.exp(-elapsed / 85));
    paintedPosition = panel.scrollTop;
    frame = requestAnimationFrame(animate);
  }

  panel.addEventListener('wheel', (event) => {
    // Keep browser zoom, horizontal gestures, and fine trackpad scrolling native.
    const coarseWheel = event.deltaMode !== 0 ||
      (Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 50);
    if (reducedMotion.matches || event.ctrlKey || event.metaKey ||
        event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !coarseWheel || !event.cancelable) {
      stop();
      return;
    }

    event.preventDefault();
    const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? panel.clientHeight : 1;
    if (!frame) target = panel.scrollTop;
    // Reverse immediately when the user changes direction.
    if ((target - panel.scrollTop) * event.deltaY < 0) target = panel.scrollTop;
    target = Math.max(0, Math.min(target + event.deltaY * unit,
      panel.scrollHeight - panel.clientHeight));
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }, { passive: false });

  // Let touch, keyboard, scrollbar dragging, and focus navigation take over.
  panel.addEventListener('pointerdown', stop, { passive: true });
  panel.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  window.addEventListener('resize', stop);
  reducedMotion.addEventListener('change', stop);
  panel.addEventListener('scroll', () => {
    if (frame && Math.abs(panel.scrollTop - paintedPosition) > 2) stop();
  }, { passive: true });
})();
