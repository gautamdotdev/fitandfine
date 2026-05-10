import { useState, useEffect } from "react";

function useCountdown(target) {
  const [diff, setDiff] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.max(0, diff);
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total % 86400000) / 3600000),
    mins: Math.floor((total % 3600000) / 60000),
    secs: Math.floor((total % 60000) / 1000),
  };
}

// Always set countdown to 12 hours from page load
function getTargetTime() {
  return Date.now() + 12 * 60 * 60 * 1000;
}

const TARGET_TIME = getTargetTime();

function Pad({ n }) {
  return String(n).padStart(2, "0");
}

export default function ComingSoonPage() {
  const [target] = useState(TARGET_TIME);
  const { days, hours, mins, secs } = useCountdown(target);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSent(true);
      setEmail("");
    }
  };

  return (
    <div className="cs-root">
      {/* Grain overlay */}
      <div className="cs-grain" />

      {/* Decorative lines */}
      <div className="cs-line cs-line-left" />
      <div className="cs-line cs-line-right" />

      {/* Logo */}
      <header className="cs-header">
        <span className="cs-logo">
          FIT <span className="cs-amp">&</span> FINE.
        </span>
      </header>

      {/* Main */}
      <main className="cs-main">
        <p className="cs-eyebrow">An Exclusive Collection</p>

        <h1 className="cs-title">
          <span className="cs-title-line">Something</span>
          <span className="cs-title-line cs-title-italic">Exceptional</span>
          <span className="cs-title-line">Is Coming</span>
        </h1>

        <p className="cs-sub">
          A new chapter in considered menswear.
          <br />
          Crafted with intent. Arriving soon.
        </p>

        {/* Countdown */}
        <div className="cs-countdown">
          {[
            ["Days", days],
            ["Hours", hours],
            ["Mins", mins],
            ["Secs", secs],
          ].map(([label, val]) => (
            <div key={label} className="cs-unit">
              <span className="cs-num">
                <Pad n={val} />
              </span>
              <span className="cs-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="cs-divider">
          <span className="cs-divider-line" />
          <span className="cs-divider-dot" />
          <span className="cs-divider-line" />
        </div>

        {/* Email capture */}
        {!sent ? (
          <form className="cs-form" onSubmit={handleSubmit}>
            <p className="cs-form-label">Be the first to know</p>
            <div className="cs-input-row">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cs-input"
              />
              <button type="submit" className="cs-btn">
                Notify Me
              </button>
            </div>
          </form>
        ) : (
          <div className="cs-thanks">
            <span className="cs-check">✓</span>
            <span>You're on the list. We'll be in touch.</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="cs-footer">
        <span>© 2026 Fit & Fine</span>
        <span className="cs-footer-dot">·</span>
        <a href="mailto:hello@fitandfine.com" className="cs-footer-link">
          hello@fitandfine.com
        </a>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        .cs-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          background-color: #F5F0E8;
          color: #1a1610;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }

        /* Grain */
        .cs-grain {
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* Decorative vertical lines */
        .cs-line {
          position: fixed;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(166,134,84,0.25), transparent);
          z-index: 0;
          pointer-events: none;
        }
        .cs-line-left  { left: clamp(24px, 8vw, 120px); }
        .cs-line-right { right: clamp(24px, 8vw, 120px); }

        /* Header */
        .cs-header {
          position: relative;
          z-index: 1;
          animation: cs-fade-up 0.9s ease both;
        }
        .cs-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #1a1610;
        }
        .cs-amp {
          color: #A68654;
          font-style: italic;
        }

        /* Main */
        .cs-main {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        }

        .cs-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #A68654;
          margin-bottom: 28px;
          animation: cs-fade-up 0.9s 0.1s ease both;
        }

        .cs-title {
          display: flex;
          flex-direction: column;
          gap: 0;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(56px, 10vw, 110px);
          line-height: 1.0;
          letter-spacing: -0.01em;
          color: #1a1610;
          margin-bottom: 32px;
        }
        .cs-title-line {
          display: block;
          animation: cs-fade-up 0.9s ease both;
        }
        .cs-title-line:nth-child(1) { animation-delay: 0.15s; }
        .cs-title-line:nth-child(2) { animation-delay: 0.25s; }
        .cs-title-line:nth-child(3) { animation-delay: 0.35s; }
        .cs-title-italic {
          font-style: italic;
          color: #A68654;
        }

        .cs-sub {
          font-family: 'Jost', sans-serif;
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 300;
          line-height: 1.8;
          color: #6b5f4e;
          margin-bottom: 48px;
          animation: cs-fade-up 0.9s 0.4s ease both;
        }

        /* Countdown */
        .cs-countdown {
          display: flex;
          gap: clamp(24px, 5vw, 56px);
          margin-bottom: 48px;
          animation: cs-fade-up 0.9s 0.5s ease both;
        }
        .cs-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .cs-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 300;
          line-height: 1;
          color: #1a1610;
          min-width: 2ch;
          text-align: center;
        }
        .cs-label {
          font-family: 'Jost', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A68654;
        }

        /* Divider */
        .cs-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          margin-bottom: 40px;
          animation: cs-fade-up 0.9s 0.55s ease both;
        }
        .cs-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(166,134,84,0.4));
        }
        .cs-divider-line:last-child {
          background: linear-gradient(to left, transparent, rgba(166,134,84,0.4));
        }
        .cs-divider-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #A68654;
          flex-shrink: 0;
        }

        /* Form */
        .cs-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 440px;
          animation: cs-fade-up 0.9s 0.6s ease both;
        }
        .cs-form-label {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6b5f4e;
        }
        .cs-input-row {
          display: flex;
          width: 100%;
          border: 1px solid rgba(166,134,84,0.4);
          border-radius: 4px;
          overflow: hidden;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          transition: border-color 0.2s;
        }
        .cs-input-row:focus-within {
          border-color: #A68654;
        }
        .cs-input {
          flex: 1;
          padding: 14px 18px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 300;
          background: transparent;
          border: none;
          outline: none;
          color: #1a1610;
          min-width: 0;
        }
        .cs-input::placeholder { color: #a99b87; }
        .cs-btn {
          padding: 14px 24px;
          background: #1a1610;
          color: #F5F0E8;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cs-btn:hover { background: #A68654; }

        /* Thanks */
        .cs-thanks {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #6b5f4e;
          letter-spacing: 0.05em;
          animation: cs-fade-up 0.5s ease both;
        }
        .cs-check {
          color: #A68654;
          font-size: 16px;
        }

        /* Footer */
        .cs-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: #a99b87;
          letter-spacing: 0.08em;
          animation: cs-fade-up 0.9s 0.7s ease both;
        }
        .cs-footer-dot { color: #A68654; }
        .cs-footer-link {
          color: #a99b87;
          text-decoration: none;
          transition: color 0.2s;
        }
        .cs-footer-link:hover { color: #A68654; }

        @keyframes cs-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
