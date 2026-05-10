import { useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import { products, productsByCategory } from '../lib/products.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { useToasts } from '../lib/store.js';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const COLORS = ['White', 'Black', 'Navy', 'Ecru', 'Sage', 'Indigo', 'Charcoal', 'Camel', 'Ivory', 'Stone'];

const btnStyle = (active) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  border: `1px solid ${active ? 'var(--color-foreground)' : 'var(--color-border)'}`,
  fontSize: '12px',
  backgroundColor: active ? 'var(--color-foreground)' : 'transparent',
  color: active ? 'var(--color-background)' : 'var(--color-foreground)',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="label-caps" style={{ marginBottom: '12px', fontSize: '11px' }}>{title}</p>
      {children}
    </div>
  );
}

function Sidebar({ selectedSizes, setSelectedSizes, selectedColors, setSelectedColors, maxPrice, setMaxPrice, toggleArr }) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '14px' }}>
      <FilterGroup title="Size">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleArr(selectedSizes, setSelectedSizes, s)}
              style={btnStyle(selectedSizes.includes(s))}
              onMouseEnter={e => { if (!selectedSizes.includes(s)) e.currentTarget.style.borderColor = 'var(--color-foreground)'; }}
              onMouseLeave={e => { if (!selectedSizes.includes(s)) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >{s}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={`Price: up to ₹${maxPrice.toLocaleString('en-IN')}`}>
        <input
          type="range" min={500} max={10000} step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'oklch(0.74 0.108 80)' }}
        />
      </FilterGroup>
      <FilterGroup title="Color">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => toggleArr(selectedColors, setSelectedColors, c)}
              style={btnStyle(selectedColors.includes(c))}
              onMouseEnter={e => { if (!selectedColors.includes(c)) e.currentTarget.style.borderColor = 'var(--color-foreground)'; }}
              onMouseLeave={e => { if (!selectedColors.includes(c)) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >{c}</button>
          ))}
        </div>
      </FilterGroup>
    </aside>
  );
}

export default function CollectionCategoryPage() {
  const { category } = useParams();
  const items = productsByCategory(category);
  const push = useToasts((s) => s.push);

  if (items.length === 0 && !['t-shirts', 'shirts', 'jeans', 'trousers'].includes(category)) {
    return <Navigate to="/not-found" replace />;
  }

  const title = items[0]?.category ?? category.replace('-', ' ');

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sort, setSort] = useState('newest');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleArr = (arr, setter, v) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = useMemo(() => {
    let r = items.slice();
    if (selectedSizes.length) r = r.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length) r = r.filter((p) => p.colors.some((c) => selectedColors.includes(c.name)));
    r = r.filter((p) => (p.salePrice ?? p.price) <= maxPrice);
    if (sort === 'low') r.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    if (sort === 'high') r.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    if (sort === 'best') r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [items, selectedSizes, selectedColors, maxPrice, sort]);

  const activeChips = [
    ...selectedSizes.map((s) => ({ label: `Size: ${s}`, clear: () => setSelectedSizes(selectedSizes.filter((x) => x !== s)) })),
    ...selectedColors.map((c) => ({ label: `Color: ${c}`, clear: () => setSelectedColors(selectedColors.filter((x) => x !== c)) })),
    ...(maxPrice < 10000 ? [{ label: `Under ₹${maxPrice}`, clear: () => setMaxPrice(10000) }] : []),
  ];

  const selectStyle = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    outline: 'none',
    color: 'var(--color-foreground)',
    cursor: 'pointer',
  };

  return (
    <div className="page-transition" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-foreground)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-muted-foreground)'}
        >Home</Link>
        <ChevronRight size={12} />
        <span>Collections</span>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--color-foreground)' }}>{title}</span>
      </nav>

      {/* Header */}
      <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Men's {title}</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-foreground)', marginTop: '8px' }}>
            Showing {filtered.length} of {items.length} products
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="label-caps mobile-filter-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid var(--color-border)', padding: '8px 16px',
              borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
            <option value="newest">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="best">Best Selling</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {activeChips.map((c, i) => (
            <button
              key={i}
              onClick={c.clear}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '50px', padding: '4px 12px',
                fontSize: '12px', cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-foreground)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {c.label} <X size={12} />
            </button>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ marginTop: '40px', display: 'grid', gap: '40px' }} className="collection-layout">
        {/* Desktop Sidebar */}
        <div className="desktop-sidebar">
          <Sidebar
            selectedSizes={selectedSizes} setSelectedSizes={setSelectedSizes}
            selectedColors={selectedColors} setSelectedColors={setSelectedColors}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            toggleArr={toggleArr}
          />
        </div>

        {/* Products */}
        <div>
          <div style={{ display: 'grid', gap: '24px' }} className="products-grid">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted-foreground)' }}>
              No products match these filters.
            </p>
          )}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <button
              onClick={() => push({ type: 'info', message: 'No more products to load' })}
              className="label-caps"
              style={{
                border: '1px solid var(--color-border)', padding: '12px 32px',
                borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-foreground)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >Load More</button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fade-in-up" style={{
            position: 'absolute', right: 0, top: 0, height: '100%',
            width: '100%',
            backgroundColor: 'var(--color-background)',
            padding: '32px 20px', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Filters</h3>
              <button onClick={() => setDrawerOpen(false)} style={{ display: 'flex', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <Sidebar
              selectedSizes={selectedSizes} setSelectedSizes={setSelectedSizes}
              selectedColors={selectedColors} setSelectedColors={setSelectedColors}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              toggleArr={toggleArr}
            />
          </div>
        </div>
      )}

      <style>{`
        .collection-layout { grid-template-columns: 1fr; }
        .desktop-sidebar { display: none; }
        .products-grid { grid-template-columns: repeat(1, 1fr); }
        .mobile-filter-btn { display: flex !important; }
        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .collection-layout { grid-template-columns: 240px 1fr !important; }
          .desktop-sidebar { display: block !important; }
          .mobile-filter-btn { display: none !important; }
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
