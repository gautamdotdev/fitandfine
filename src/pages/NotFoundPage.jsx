import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '120px 40px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', color: 'var(--color-gold)', lineHeight: 1 }}>404</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginTop: '24px' }}>Page Not Found</h1>
      <p style={{ marginTop: '12px', color: 'var(--color-muted-foreground)', maxWidth: '320px', margin: '12px auto 0' }}>
        The piece you are looking for doesn't seem to exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="label-caps"
        style={{ 
          marginTop: '32px', display: 'inline-block', backgroundColor: 'var(--color-foreground)', color: 'var(--color-background)', 
          padding: '16px 32px', borderRadius: '50px', fontSize: '14px', textDecoration: 'none', transition: 'background-color 0.3s' 
        }}
        onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-gold)'}
        onMouseLeave={e => e.target.style.backgroundColor = 'var(--color-foreground)'}
      >Return Home</Link>
    </div>
  );
}
