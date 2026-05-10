import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart, useToasts, useWishlist } from '../lib/store.js';
import { useState } from 'react';

export function ProductCard({ product, badge }) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const onSale = !!product.salePrice;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        transition: 'transform 0.5s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',
          overflow: 'hidden',
          borderRadius: '12px',
          backgroundColor: 'var(--color-muted)',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.5s',
        }}>
          {/* Primary image */}
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'all 0.7s',
              opacity: hovered ? 0 : 1,
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
            loading="lazy"
          />
          {/* Hover image */}
          <img
            src={product.images[1] || product.images[0]}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'all 0.7s',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
            loading="lazy"
          />

          <div style={{ position: 'absolute', inset: 0, backgroundColor: hovered ? 'rgba(0,0,0,0.05)' : 'transparent', transition: 'background 0.5s' }} />

          {(badge || product.isNew) && (
            <span className="label-caps" style={{
              position: 'absolute', top: '12px', right: '12px',
              backgroundColor: 'rgba(24,23,20,0.9)',
              backdropFilter: 'blur(4px)',
              color: 'var(--color-background)',
              padding: '6px 10px', borderRadius: '50px',
              fontSize: '9px', fontWeight: 700, zIndex: 10,
            }}>{badge ?? 'New'}</span>
          )}
          {onSale && (
            <span className="label-caps" style={{
              position: 'absolute', bottom: '12px', left: '12px',
              backgroundColor: 'var(--color-gold)', color: 'white',
              padding: '6px 10px', borderRadius: '50px',
              fontSize: '9px', fontWeight: 700, zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>Sale</span>
          )}

          {/* Quick Add overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px',
            transform: hovered ? 'translateY(0)' : 'translateY(16px)',
            opacity: hovered ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 20,
          }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                add({
                  productId: product.id, slug: product.slug,
                  name: product.name, image: product.images[0],
                  price: product.salePrice ?? product.price,
                  size: product.sizes[Math.floor(product.sizes.length / 2)],
                  color: product.colors[0].name, qty: 1,
                });
                push({ type: 'success', message: 'Added to cart' });
              }}
              className="label-caps"
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                color: 'var(--color-foreground)',
                padding: '12px',
                borderRadius: '50px',
                fontSize: '10px', fontWeight: 700,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.95)';
                e.currentTarget.style.color = 'var(--color-foreground)';
              }}
            >
              Quick Add
            </button>
          </div>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWish(product.id);
          push({ type: 'success', message: wished ? 'Removed from wishlist' : 'Added to wishlist' });
        }}
        aria-label="Wishlist"
        style={{
          position: 'absolute', top: '12px', left: '12px',
          width: '36px', height: '36px', borderRadius: '50%',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.5s', zIndex: 30, cursor: 'pointer',
          backgroundColor: wished ? 'var(--color-destructive)' : 'rgba(255,255,255,0.8)',
          color: wished ? 'white' : 'var(--color-foreground)',
          opacity: wished ? 1 : (hovered ? 1 : 0),
          transform: wished ? 'scale(1.1)' : 'scale(1)',
          boxShadow: wished ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
        }}
        onMouseEnter={e => { if (!wished) e.currentTarget.style.backgroundColor = 'white'; }}
        onMouseLeave={e => { if (!wished) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'; }}
      >
        <Heart size={15} style={{ fill: wished ? 'white' : 'none' }} strokeWidth={2} />
      </button>

      {/* Product info */}
      <div style={{ paddingTop: '20px', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <p className="label-caps" style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '0.18em' }}>{product.category}</p>
            <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3
                style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginTop: '6px', transition: 'color 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = 'var(--color-gold)'}
                onMouseLeave={e => e.target.style.color = ''}
              >{product.name}</h3>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {onSale ? (
              <>
                <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>₹{product.salePrice.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-muted-foreground)', textDecoration: 'line-through', opacity: 0.6 }}>₹{product.price.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-muted-foreground)', marginTop: '4px', opacity: 0.7, fontStyle: 'italic' }}>{product.fabric}</p>
      </div>
    </div>
  );
}
