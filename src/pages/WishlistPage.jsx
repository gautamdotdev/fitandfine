import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../lib/store.js';
import { useShop } from '../context/ShopContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

export default function WishlistPage() {
  const { ids } = useWishlist();
  const { products } = useShop();
  const items = products.filter((p) => ids.includes(p.id) || ids.includes(p._id));

  if (items.length === 0) {
    return (
      <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Heart size={32} style={{ color: 'var(--color-muted-foreground)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Your wishlist is empty</h1>
        <p style={{ marginTop: '12px', color: 'var(--color-muted-foreground)', maxWidth: '320px', margin: '12px auto 0' }}>
          Save your favorite pieces here to keep an eye on them.
        </p>
        <Link 
          to="/collections" 
          className="label-caps"
          style={{ 
            marginTop: '32px', display: 'inline-block', backgroundColor: 'var(--color-foreground)', color: 'var(--color-background)', 
            padding: '16px 32px', borderRadius: '50px', fontSize: '14px', textDecoration: 'none', transition: 'background-color 0.3s' 
          }}
          onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-gold)'}
          onMouseLeave={e => e.target.style.backgroundColor = 'var(--color-foreground)'}
        >Start Exploring</Link>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <p className="label-caps" style={{ color: 'var(--color-gold)' }}>Saved Pieces</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginTop: '8px' }}>Wishlist</h1>
      
      <div style={{ marginTop: '48px', display: 'grid', gap: '24px' }} className="wishlist-grid">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <div style={{ marginTop: '64px', textAlign: 'center', padding: '48px', backgroundColor: 'var(--color-surface)', borderRadius: '12px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Found something you love?</h2>
        <p style={{ marginTop: '12px', color: 'var(--color-muted-foreground)' }}>Add items to your bag to complete your order via WhatsApp.</p>
        <Link 
          to="/cart" 
          className="label-caps"
          style={{ 
            marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-foreground)', 
            paddingBottom: '4px', textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' 
          }}
          onMouseEnter={e => e.target.style.color = 'var(--color-gold)'}
          onMouseLeave={e => e.target.style.color = ''}
        >View Bag <ArrowRight size={14} /></Link>
      </div>

      <style>{`
        .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 1024px) {
          .wishlist-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
