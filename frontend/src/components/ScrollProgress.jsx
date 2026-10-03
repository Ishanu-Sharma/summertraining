import { useEffect, useRef } from "react";

/**
 * The thin bar across the top that fills as you scroll. Written straight to the
 * element's style via a ref and read inside requestAnimationFrame, so a scroll
 * never triggers a React render and never reads layout in the scroll handler
 * itself (which is what causes scroll jank).
 *
 * Hidden under prefers-reduced-motion in CSS: it is decoration, and it moves
 * continuously.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let queued = false;

    const update = () => {
      queued = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const ratio = scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__bar" ref={barRef} />
    </div>
  );
}
