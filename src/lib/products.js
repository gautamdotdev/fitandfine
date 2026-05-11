// ============================================
// FIT & FINE — Product Data & Utilities
// ============================================

const img = (id, w = 700) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const tshirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const waistSizes = ["28", "30", "32", "34", "36"];

const COMMON_COLORS = {
  white: { name: "White", hex: "#F2EEE7" },
  black: { name: "Black", hex: "#1A1714" },
  navy: { name: "Navy", hex: "#1F2A44" },
  ecru: { name: "Ecru", hex: "#D9CFBE" },
  sage: { name: "Sage", hex: "#9CA98A" },
  indigo: { name: "Indigo", hex: "#3B4A6B" },
  charcoal: { name: "Charcoal", hex: "#3A3633" },
  camel: { name: "Camel", hex: "#B08A5B" },
  ivory: { name: "Ivory", hex: "#EDE6D6" },
  stone: { name: "Stone", hex: "#A89A86" },
};

export const products = [
  {
    id: "1",
    slug: "FIT & FINE-classic-white-tee",
    name: "FIT & FINE Classic White Tee",
    category: "T-Shirts",
    categorySlug: "t-shirts",
    price: 1299,
    fabric: "100% Supima Cotton",
    description:
      "An effortless wardrobe foundation. Cut from long-staple Supima cotton for an exceptional hand-feel that softens with every wear.",
    sizes: tshirtSizes,
    colors: [COMMON_COLORS.white, COMMON_COLORS.ecru],
    images: [
      img("1598033129183-c4f50c736f10"),
      img("1521572163474-6864f9cf17ab"),
      img("1583743814966-8936f5b7be1a"),
      img("1576566588028-4147f3842f27"),
    ],
    newArrival: true,
    rating: 4.7,
    reviewCount: 184,
  },
  {
    id: "2",
    slug: "indigo-washed-linen-shirt",
    name: "Indigo Washed Linen Shirt",
    category: "Shirts",
    categorySlug: "shirts",
    price: 2899,
    salePrice: 2199,
    fabric: "Premium Linen Blend",
    description:
      "Garment-washed for a relaxed drape and softened hand. The quiet hero of warm-weather dressing.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [COMMON_COLORS.indigo, COMMON_COLORS.stone],
    images: [
      img("1602810316693-3667c854239a"),
      img("1609505848912-b7c3b9c99049"),
      img("1591047139829-d91aecb6caea"),
      img("1594938298603-c8148c4b7b15"),
    ],
    rating: 4.6,
    reviewCount: 92,
  },
  {
    id: "3",
    slug: "slim-fit-dark-wash-jeans",
    name: "Slim Fit Dark Wash Jeans",
    category: "Jeans",
    categorySlug: "jeans",
    price: 3499,
    fabric: "Japanese Selvedge Denim",
    description:
      "Woven on shuttle looms in Okayama. A considered slim cut that holds its shape and wears with character.",
    sizes: waistSizes,
    colors: [COMMON_COLORS.indigo, COMMON_COLORS.black],
    images: [
      img("1542272604-787c3835535d"),
      img("1604176354204-9268737828e4"),
      img("1582552938357-32b906df40cb"),
      img("1473966968600-fa801b869a1a"),
    ],
    newArrival: true,
    rating: 4.8,
    reviewCount: 213,
  },
  {
    id: "4",
    slug: "ecru-essential-polo",
    name: "Ecru Essential Polo",
    category: "T-Shirts",
    categorySlug: "t-shirts",
    price: 1899,
    fabric: "Pique Cotton",
    description:
      "A refined take on the polo: textured pique, mother-of-pearl buttons, and a tailored placket.",
    sizes: tshirtSizes,
    colors: [COMMON_COLORS.ecru, COMMON_COLORS.white, COMMON_COLORS.navy],
    images: [
      img("1586363107002-4eb62c42e8ef"),
      img("1586790170083-2f9ceadc732d"),
      img("1618354691373-d851c5c3a990"),
      img("1583743814966-8936f5b7be1a"),
    ],
    rating: 4.5,
    reviewCount: 67,
  },
  {
    id: "5",
    slug: "charcoal-twill-trousers",
    name: "Charcoal Twill Trousers",
    category: "Trousers",
    categorySlug: "trousers",
    price: 4299,
    fabric: "Wool Blend",
    description:
      "Tailored from a fine Italian wool blend with a structured drape. A foundation piece for the considered wardrobe.",
    sizes: waistSizes,
    colors: [COMMON_COLORS.charcoal, COMMON_COLORS.black],
    images: [
      img("1519085360753-af0119f7cbe7"),
      img("1617127365659-c47fa864d8bc"),
      img("1507003211169-0a1dd7228f2d"),
      img("1552374196-c4e7ffc6e126"),
    ],
    rating: 4.7,
    reviewCount: 142,
  },
  {
    id: "6",
    slug: "ivory-linen-overshirt",
    name: "Ivory Linen Overshirt",
    category: "Shirts",
    categorySlug: "shirts",
    price: 3199,
    fabric: "Garment-washed Linen",
    description:
      "Equal parts shirt and light jacket. Worn open over a tee or buttoned with tailored trousers.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [COMMON_COLORS.ivory, COMMON_COLORS.sage],
    images: [
      img("1598962324947-d1a12a76f23c"),
      img("1591047139829-d91aecb6caea"),
      img("1602810316693-3667c854239a"),
      img("1594938298603-c8148c4b7b15"),
    ],
    newArrival: true,
    rating: 4.4,
    reviewCount: 38,
  },
  {
    id: "7",
    slug: "vintage-straight-jeans",
    name: "Vintage Straight Jeans",
    category: "Jeans",
    categorySlug: "jeans",
    price: 3799,
    fabric: "12oz Raw Denim",
    description:
      "Unwashed raw denim with a true straight leg. Built to fade with the contours of your life.",
    sizes: waistSizes,
    colors: [COMMON_COLORS.indigo],
    images: [
      img("1582552938357-32b906df40cb"),
      img("1542272604-787c3835535d"),
      img("1604176354204-9268737828e4"),
      img("1473966968600-fa801b869a1a"),
    ],
    rating: 4.6,
    reviewCount: 88,
  },
  {
    id: "8",
    slug: "navy-organic-tee",
    name: "Navy Organic Tee",
    category: "T-Shirts",
    categorySlug: "t-shirts",
    price: 1399,
    fabric: "Organic Cotton",
    description:
      "GOTS-certified organic cotton, midweight and beautifully cut. A quiet workhorse.",
    sizes: tshirtSizes,
    colors: [COMMON_COLORS.navy, COMMON_COLORS.black, COMMON_COLORS.sage],
    images: [
      img("1521572163474-6864f9cf17ab"),
      img("1576566588028-4147f3842f27"),
      img("1598033129183-c4f50c736f10"),
      img("1583743814966-8936f5b7be1a"),
    ],
    newArrival: true,
    rating: 4.5,
    reviewCount: 156,
  },
  {
    id: "9",
    slug: "camel-chino-trousers",
    name: "Camel Chino Trousers",
    category: "Trousers",
    categorySlug: "trousers",
    price: 3999,
    fabric: "Stretch Cotton Twill",
    description:
      "A modernised chino with a touch of stretch. Tailored cleanly through the leg.",
    sizes: waistSizes,
    colors: [COMMON_COLORS.camel, COMMON_COLORS.stone, COMMON_COLORS.charcoal],
    images: [
      img("1617127365659-c47fa864d8bc"),
      img("1519085360753-af0119f7cbe7"),
      img("1507003211169-0a1dd7228f2d"),
      img("1552374196-c4e7ffc6e126"),
    ],
    rating: 4.6,
    reviewCount: 74,
  },
  {
    id: "10",
    slug: "stone-oxford-shirt",
    name: "Stone Oxford Shirt",
    category: "Shirts",
    categorySlug: "shirts",
    price: 2599,
    fabric: "120-thread Oxford Cloth",
    description:
      "A precisely cut Oxford in a softened stone. Equally at home tucked or worn loose.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [COMMON_COLORS.stone, COMMON_COLORS.white, COMMON_COLORS.navy],
    images: [
      img("1602810316693-3667c854239a"),
      img("1591047139829-d91aecb6caea"),
      img("1609505848912-b7c3b9c99049"),
      img("1594938298603-c8148c4b7b15"),
    ],
    rating: 4.7,
    reviewCount: 121,
  },
  {
    id: "11",
    slug: "black-slim-jeans",
    name: "Black Slim Jeans",
    category: "Jeans",
    categorySlug: "jeans",
    price: 3299,
    fabric: "Stretch Denim",
    description:
      "A clean black slim with comfort stretch. Sharper than chinos, softer than rigid denim.",
    sizes: waistSizes,
    colors: [COMMON_COLORS.black],
    images: [
      img("1604176354204-9268737828e4"),
      img("1542272604-787c3835535d"),
      img("1582552938357-32b906df40cb"),
      img("1473966968600-fa801b869a1a"),
    ],
    rating: 4.5,
    reviewCount: 96,
  },
  {
    id: "12",
    slug: "sage-relaxed-tee",
    name: "Sage Relaxed Tee",
    category: "T-Shirts",
    categorySlug: "t-shirts",
    price: 1199,
    fabric: "Modal Cotton",
    description:
      "A drapey modal-cotton blend in a muted sage. Relaxed through the body and shoulders.",
    sizes: tshirtSizes,
    colors: [COMMON_COLORS.sage, COMMON_COLORS.ecru, COMMON_COLORS.stone],
    images: [
      img("1576566588028-4147f3842f27"),
      img("1521572163474-6864f9cf17ab"),
      img("1598033129183-c4f50c736f10"),
      img("1583743814966-8936f5b7be1a"),
    ],
    newArrival: true,
    rating: 4.4,
    reviewCount: 52,
  },
];

export const findProduct = (slug) => products.find((p) => p.slug === slug);
export const productsByCategory = (cat) =>
  products.filter((p) => p.categorySlug === cat);

export const categories = [
  {
    slug: "t-shirts",
    name: "T-Shirts",
    image: img("1598033129183-c4f50c736f10", 800),
  },
  {
    slug: "shirts",
    name: "Shirts",
    image: img("1602810316693-3667c854239a", 800),
  },
  { slug: "jeans", name: "Jeans", image: img("1542272604-787c3835535d", 800) },
  {
    slug: "trousers",
    name: "Trousers",
    image:
      "https://imgs.search.brave.com/o9PW0epkGU_Bw5Ol24LioBnO5XdrAb4a1mCW1wUS4Sc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYW1w/dXNzdXRyYS5jb20v/Y2RuL3Nob3AvZmls/ZXMvQ1NNU1NUUjkx/NjZfNV9hMzBhYjcy/NC04YTdkLTRjNTIt/YmRiMi01N2NhNThl/NjYxYmEuanBnP3Y9/MTc1MzQzMDMxNyZ3/aWR0aD0yMDAw",
  },
];

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1400&q=85&auto=format&fit=crop";
export const EDITORIAL_IMAGE =
  "https://media.gq.com/photos/667591e59d2c94677772c192/16:9/w_6256,h_3519,c_limit/Lede-GQR-LinenShirts-9406.jpg";
export const STORY_IMAGE =
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=1200&q=85&auto=format&fit=crop";

const rawNum = import.meta.env.VITE_WHATSAPP_NUMBER || "918780142005";
export const WHATSAPP_NUMBER = rawNum.length === 10 ? `91${rawNum}` : rawNum;
export const CONTACT_NAME =
  import.meta.env.VITE_CONTACT_NAME || "Zala Bhavyarajsinh";

export function whatsappProductUrl(p, size, color, qty) {
  const price = (p.salePrice ?? p.price) * qty;
  const text = `Hi ${CONTACT_NAME}, I'm interested in *${p.name}*\nSize: ${size} | Color: ${color} | Qty: ${qty}\nPrice: ₹${price.toLocaleString("en-IN")}\nCould you confirm availability and delivery?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappCartUrl(items, total) {
  const lines = items
    .map(
      (i, n) =>
        `${n + 1}. ${i.name} (Size ${i.size}, ${i.color}) — ₹${i.price.toLocaleString("en-IN")} x${i.qty}`,
    )
    .join("\n");
  const text = `Hi ${CONTACT_NAME}, I'd like to order the following:\n${lines}\nTotal: ₹${total.toLocaleString("en-IN")}\nPlease confirm availability.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
