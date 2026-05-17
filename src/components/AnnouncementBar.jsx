import { useEffect, useRef } from "react";

const MESSAGES = [
  "Easy 7-Day Returns",
  "100% Cash on Delivery",
  "Free Shipping on orders above ₹1599",
];

const HALF = [...MESSAGES, ...MESSAGES, ...MESSAGES, ...MESSAGES];
const TRACK = [...HALF, ...HALF];

const CSS = `
  .ann-bar {
    background: #1a1a1a;
    color: #f5f0e8;
    height: 34px;
    overflow: hidden;
    position: relative;
    width: 100%;
  }
  .ann-track {
    display: flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
    will-change: transform;
  }
  .ann-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 0 40px;
    color: #d4c5a0;
    flex-shrink: 0;
  }
  .ann-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #c9a84c;
    flex-shrink: 0;
  }
`;

const SPEED = 60;

export function AnnouncementBar() {
  const trackRef = useRef(null);
  const xRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const halfWidth = track.scrollWidth / 2;

    const tick = (ts) => {
      if (lastRef.current === null) lastRef.current = ts;
      const delta = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      xRef.current -= SPEED * delta;
      if (xRef.current <= -halfWidth) xRef.current += halfWidth;

      track.style.transform = `translateX(${xRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="ann-bar" role="marquee" aria-label="Store announcements">
        <div className="ann-track" ref={trackRef}>
          {TRACK.map((msg, i) => (
            <span className="ann-item" key={i}>
              <span className="ann-dot" />
              {msg}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}