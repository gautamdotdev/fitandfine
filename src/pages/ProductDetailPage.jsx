import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, Star, Truck, RotateCcw, ShieldCheck, ChevronDown, MessageCircle, X } from 'lucide-react';
import { findProduct, products, whatsappProductUrl } from '../lib/products.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart, useToasts } from '../lib/store.js';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  
  if (!product) return <Navigate to="/not-found" replace />;

  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState("details");
  const [reviewModal, setReviewModal] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [unit, setUnit] = useState("cm");
  
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);

  const price = product.salePrice ?? product.price;
  const related = products.filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug).slice(0, 4);

  const handleAdd = () => {
    if (!size) { setError("Please select a size"); return; }
    add({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0], price, size, color, qty });
    push({ type: "success", message: "Added to cart" });
  };

  const reviews = [
    { name: "Karthik R.", date: "12 Mar 2025", rating: 5, text: "Outstanding quality. The fabric weight is perfect and the cut is beautifully considered.", helpful: 24 },
    { name: "Aditya P.", date: "28 Feb 2025", rating: 5, text: "Worth every rupee. Packaging arrived like a gift and the fit is true to size.", helpful: 18 },
    { name: "Devansh M.", date: "14 Feb 2025", rating: 4, text: "Lovely piece. Knocked off a star only because shipping took 6 days, but the product itself is faultless.", helpful: 11 },
  ];
  const dist = [76, 14, 6, 3, 1];

  return (
    <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 20px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <ChevronRight size={12} />
        <Link to={`/collections/${product.categorySlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>{product.category}</Link>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--color-foreground)' }}>{product.name}</span>
      </nav>

      <div style={{ marginTop: '32px', display: 'grid', gap: '48px' }} className="product-detail-grid">
        {/* Gallery */}
        <div>
          <div style={{ aspectRatio: '4/5', backgroundColor: 'var(--color-muted)', borderRadius: '8px', overflow: 'hidden' }} className="group">
            <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hover-zoom" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${i === imgIdx ? 'var(--color-foreground)' : 'transparent'}`, padding: 0 }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ position: 'sticky', top: '112px', alignSelf: 'start' }}>
          <p className="label-caps" style={{ color: 'var(--color-gold)' }}>{product.category}</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginTop: '8px' }}>{product.name}</h1>
          <a href="#reviews" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)' }}>
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} style={{ fill: i < Math.round(product.rating) ? 'var(--color-gold)' : 'none', opacity: i < Math.round(product.rating) ? 1 : 0.3 }} />)}
            </span>
            <span style={{ color: 'var(--color-muted-foreground)' }}>{product.rating} · {product.reviewCount} reviews</span>
          </a>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem' }}>₹{price.toLocaleString("en-IN")}</span>
            {product.salePrice && <span style={{ color: 'var(--color-muted-foreground)', textDecoration: 'line-through' }}>₹{product.price.toLocaleString("en-IN")}</span>}
          </div>

          <p style={{ marginTop: '20px', color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>{product.description}</p>

          {/* Size */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p className="label-caps">Select Size</p>
              <button onClick={() => setSizeGuide(true)} style={{ fontSize: '12px', textDecoration: 'underline', color: 'var(--color-muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>Size Guide</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {product.sizes.map((s) => (
                <button 
                  key={s} 
                  onClick={() => { setSize(s); setError(""); }} 
                  style={{ 
                    minWidth: '48px', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${size === s ? 'var(--color-foreground)' : 'var(--color-border)'}`,
                    backgroundColor: size === s ? 'var(--color-foreground)' : 'transparent',
                    color: size === s ? 'var(--color-background)' : 'var(--color-foreground)',
                    fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{s}</button>
              ))}
            </div>
            {error && <p style={{ color: 'var(--color-destructive)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
          </div>

          {/* Color */}
          <div style={{ marginTop: '24px' }}>
            <p className="label-caps" style={{ marginBottom: '12px' }}>Color: <span style={{ color: 'var(--color-muted-foreground)' }}>{color}</span></p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {product.colors.map((c) => (
                <button 
                  key={c.name} 
                  onClick={() => setColor(c.name)} 
                  title={c.name}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${color === c.name ? 'var(--color-foreground)' : 'var(--color-border)'}`,
                    backgroundColor: c.hex, cursor: 'pointer', transition: 'all 0.2s', transform: color === c.name ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Qty */}
          <div style={{ marginTop: '24px' }}>
            <p className="label-caps" style={{ marginBottom: '12px' }}>Quantity</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '8px 12px', cursor: 'pointer' }}>−</button>
              <span style={{ padding: '0 16px', fontSize: '14px' }}>{qty}</span>
              <button onClick={() => setQty(Math.min(10, qty + 1))} style={{ padding: '8px 12px', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleAdd} 
              className="label-caps"
              style={{ 
                width: '100%', backgroundColor: 'var(--color-foreground)', color: 'var(--color-background)', padding: '16px', borderRadius: '6px', 
                fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.3s' 
              }}
              onMouseEnter={e => e.target.style.backgroundColor = 'var(--color-gold)'}
              onMouseLeave={e => e.target.style.backgroundColor = 'var(--color-foreground)'}
            >Add to Cart</button>
            <a
              href={whatsappProductUrl(product, size ?? product.sizes[0], color, qty)}
              target="_blank" rel="noreferrer"
              className="label-caps"
              style={{ 
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                backgroundColor: 'var(--color-whatsapp)', color: 'white', padding: '16px', borderRadius: '6px', 
                fontSize: '14px', textDecoration: 'none', transition: 'opacity 0.3s' 
              }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
          </div>

          {/* Trust */}
          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px' }}>
              <Truck style={{ margin: '0 auto 6px', color: 'var(--color-gold)' }} size={18} />
              <p style={{ color: 'var(--color-muted-foreground)' }}>Free shipping<br />over ₹2,999</p>
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px' }}>
              <RotateCcw style={{ margin: '0 auto 6px', color: 'var(--color-gold)' }} size={18} />
              <p style={{ color: 'var(--color-muted-foreground)' }}>Easy 30-day<br />returns</p>
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '6px', padding: '12px' }}>
              <ShieldCheck style={{ margin: '0 auto 6px', color: 'var(--color-gold)' }} size={18} />
              <p style={{ color: 'var(--color-muted-foreground)' }}>Authentic &<br />guaranteed</p>
            </div>
          </div>

          {/* Accordion */}
          <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-border)' }}>
            {[
              { id: "details", title: "Product Details", body: `Fabric: ${product.fabric}. Crafted with a relaxed, contemporary fit. Cold machine wash. Do not bleach. Iron on low.` },
              { id: "fit", title: "Size & Fit", body: "Model is 6'1\" wearing size M. Chest 38\" / Waist 32\". For a relaxed fit, size up. Refer to the size guide above for measurements." },
              { id: "ship", title: "Shipping & Returns", body: "Standard delivery in 3–5 business days. Free shipping on orders over ₹2,999. Returns accepted within 30 days in original condition." },
            ].map((s) => (
              <div key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <button 
                  onClick={() => setOpenSection(openSection === s.id ? null : s.id)} 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', fontSize: '14px', cursor: 'pointer' }}
                >
                  <span className="label-caps">{s.title}</span>
                  <ChevronDown size={16} style={{ transition: 'transform 0.3s', transform: openSection === s.id ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {openSection === s.id && <p style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', paddingBottom: '16px', lineHeight: 1.6 }}>{s.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <section style={{ marginTop: '96px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', marginBottom: '32px' }}>You Might Also Like</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }} className="related-grid">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" style={{ marginTop: '96px', display: 'grid', gap: '48px' }} className="reviews-grid">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem' }}>Reviews</h2>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem' }}>{product.rating}</span>
            <span style={{ color: 'var(--color-muted-foreground)', fontSize: '14px' }}>/ 5</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', marginTop: '4px' }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} style={{ fill: i < Math.round(product.rating) ? 'var(--color-gold)' : 'none', opacity: i < Math.round(product.rating) ? 1 : 0.3 }} />)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '4px' }}>{product.reviewCount} reviews</p>
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dist.map((pct, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ width: '20px' }}>{5 - i}★</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: 'var(--color-gold)', width: `${pct}%` }} />
                </div>
                <span style={{ width: '32px', textAlign: 'right', color: 'var(--color-muted-foreground)' }}>{pct}%</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setReviewModal(true)} 
            className="label-caps"
            style={{ 
              marginTop: '24px', border: '1px solid var(--color-foreground)', padding: '10px 20px', borderRadius: '6px', 
              fontSize: '12px', cursor: 'pointer', transition: 'all 0.3s' 
            }}
            onMouseEnter={e => { e.target.style.backgroundColor = 'var(--color-foreground)'; e.target.style.color = 'var(--color-background)'; }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--color-foreground)'; }}
          >Write a Review</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px' }}>{r.name}</p>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', marginTop: '4px' }}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} style={{ fill: i < r.rating ? 'var(--color-gold)' : 'none', opacity: i < r.rating ? 1 : 0.3 }} />)}
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)' }}>{r.date}</p>
              </div>
              <p style={{ fontSize: '14px', marginTop: '12px', color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>{r.text}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '12px' }}>Helpful? 👍 {r.helpful}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Review modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setReviewModal(false)}>
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '32px', maxWidth: '448px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Write a Review</h3>
              <button onClick={() => setReviewModal(false)} style={{ cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); push({ type: "success", message: "Thank you for your review!" }); setReviewModal(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Name" style={{ width: '100%', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px', fontSize: '14px' }} />
              <input required type="email" placeholder="Email" style={{ width: '100%', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px', fontSize: '14px' }} />
              <div>
                <p className="label-caps" style={{ marginBottom: '8px', fontSize: '10px' }}>Rating</p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => {}} style={{ cursor: 'pointer', color: 'var(--color-gold)' }}><Star size={22} style={{ fill: 'var(--color-gold)' }} /></button>
                  ))}
                </div>
              </div>
              <textarea required placeholder="Your review" rows={4} style={{ width: '100%', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px', fontSize: '14px', resize: 'vertical' }} />
              <button className="label-caps" style={{ backgroundColor: 'var(--color-foreground)', color: 'var(--color-background)', padding: '12px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* Size Guide modal */}
      {sizeGuide && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setSizeGuide(false)}>
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', padding: '32px', maxWidth: '672px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Size Guide</h3>
              <button onClick={() => setSizeGuide(false)} style={{ cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button onClick={() => setUnit("cm")} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', border: `1px solid ${unit === 'cm' ? 'var(--color-foreground)' : 'var(--color-border)'}`, backgroundColor: unit === 'cm' ? 'var(--color-foreground)' : 'transparent', color: unit === 'cm' ? 'var(--color-background)' : 'inherit' }}>cm</button>
              <button onClick={() => setUnit("in")} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '12px', border: `1px solid ${unit === 'in' ? 'var(--color-foreground)' : 'var(--color-border)'}`, backgroundColor: unit === 'in' ? 'var(--color-foreground)' : 'transparent', color: unit === 'in' ? 'var(--color-background)' : 'inherit' }}>inches</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }} className="label-caps">
                    <th style={{ padding: '8px 0' }}>Size</th>
                    <th style={{ padding: '8px 0' }}>Chest</th>
                    <th style={{ padding: '8px 0' }}>Waist</th>
                    <th style={{ padding: '8px 0' }}>Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XS", 86, 71, 89], ["S", 91, 76, 94], ["M", 96, 81, 99], ["L", 101, 86, 104], ["XL", 106, 91, 109], ["XXL", 111, 96, 114],
                  ].map(([s, c, w, h]) => (
                    <tr key={s} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{s}</td>
                      <td style={{ padding: '12px 0' }}>{unit === 'cm' ? c : Math.round(c / 2.54)}</td>
                      <td style={{ padding: '12px 0' }}>{unit === 'cm' ? w : Math.round(w / 2.54)}</td>
                      <td style={{ padding: '12px 0' }}>{unit === 'cm' ? h : Math.round(h / 2.54)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '16px' }}>Measurements taken with garment laid flat. For best fit, compare against a piece you already own.</p>
          </div>
        </div>
      )}

      {/* Mobile sticky WA */}
      <div className="mobile-wa-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '16px', backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}>
        <a 
          href={whatsappProductUrl(product, size ?? product.sizes[0], color, qty)} 
          target="_blank" rel="noreferrer" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--color-whatsapp)', color: 'white', padding: '14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
        >
          <MessageCircle size={16} /> Ask on WhatsApp
        </a>
      </div>

      <style>{`
        .product-detail-grid { grid-template-columns: 1fr; }
        .related-grid { grid-template-columns: repeat(2, 1fr); }
        .reviews-grid { grid-template-columns: 1fr; }
        .mobile-wa-bar { display: block; }
        @media (min-width: 1024px) {
          .product-detail-grid { grid-template-columns: 1.1fr 1fr !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .reviews-grid { grid-template-columns: 280px 1fr !important; }
          .mobile-wa-bar { display: none !important; }
        }
        .hover-zoom:hover { transform: scale(1.1); }
      `}</style>
    </div>
  );
}
