import { Link } from 'react-router-dom';
import { categories } from '../lib/products.js';

export default function CollectionsIndexPage() {
  return (
    <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <div style={{ textAlign: 'center', maxWidth: '672px', margin: '0 auto 64px' }}>
        <p className="label-caps" style={{ color: 'var(--color-gold)' }}>The Edit</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginTop: '8px' }}>Collections</h1>
        <p style={{ color: 'var(--color-muted-foreground)', marginTop: '16px' }}>
          Each piece is chosen for its timeless appeal and exceptional quality.
          Explore our considered categories designed to form the foundation of a modern wardrobe.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '32px' }} className="collections-index-grid">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/collections/${cat.slug}`}
            style={{
              position: 'relative', aspectRatio: '16/9', overflow: 'hidden',
              borderRadius: '12px', backgroundColor: 'var(--color-muted)',
              display: 'block', textDecoration: 'none',
            }}
            className="collection-card"
          >
            <img
              src={cat.image}
              alt={cat.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1s' }}
              className="collection-img"
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent)',
              opacity: 0.8, transition: 'opacity 0.5s',
            }} className="collection-overlay" />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', padding: '24px',
            }}>
              <span
                className="label-caps collection-explore"
                style={{ marginBottom: '8px', fontSize: '11px', opacity: 0, transform: 'translateY(16px)', transition: 'all 0.5s' }}
              >Explore</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{cat.name}</h2>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .collections-index-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .collections-index-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .collection-card:hover .collection-img { transform: scale(1.05); }
        .collection-card:hover .collection-overlay { opacity: 0.6 !important; }
        .collection-card:hover .collection-explore { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
    </div>
  );
}
