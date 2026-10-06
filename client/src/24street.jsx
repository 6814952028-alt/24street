import { useEffect, useRef, useState } from "react";
import UserDialog from "./UserDialog";
import BagDrawer from "./BagDrawer";
import AccountPanel from "./AccountPanel";
import CheckoutPanel from "./CheckoutPanel";
import API_URL from "./api";

const stored = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { localStorage.removeItem(key); return fallback; } };

const fallbackProducts = [
  { id: 1, name: "Heavyweight Tee", category: "T-SHIRTS", price: 890, color: "bg-[#b9d2c1]", tone: "#b9d2c1", label: "NEW", desc: "เสื้อยืดคอตตอนเนื้อหนัก ทรง boxy ที่ใส่สบายในทุกวัน", details: ["100% cotton", "230 GSM", "Pre-shrunk"], sizes: ["S", "M", "L", "XL"] },
  { id: 2, name: "Weekend Baggy", category: "PANTS", price: 1690, color: "bg-[#cdb9a4]", tone: "#cdb9a4", label: "BEST", desc: "กางเกงแบกกี้ทรงหลวม เอวปรับได้ และมีกระเป๋าข้าง", details: ["Cotton twill", "Relaxed fit", "Adjustable waist"], sizes: ["S", "M", "L", "XL"] },
  { id: 3, name: "Essential Hoodie", category: "HOODIES", price: 1990, color: "bg-[#394450]", tone: "#394450", label: "NEW", desc: "ฮู้ดดี้ทรง oversize เนื้อเฟลซนุ่ม พร้อมใส่ตลอดฤดูกาล", details: ["Cotton fleece", "Brushed interior", "Oversized fit"], sizes: ["S", "M", "L", "XL"] },
  { id: 4, name: "Sun Faded Tee", category: "T-SHIRTS", price: 790, color: "bg-[#df9c72]", tone: "#df9c72", label: "", desc: "เสื้อยืดสีเฟดให้บรรยากาศวินเทจ นุ่มตั้งแต่ครั้งแรก", details: ["Washed cotton", "Relaxed fit", "Soft finish"], sizes: ["S", "M", "L"] },
  { id: 5, name: "Utility Cargo", category: "PANTS", price: 1890, color: "bg-[#79876c]", tone: "#79876c", label: "NEW", desc: "กางเกง cargo ทรงตรงพร้อมกระเป๋าใช้งาน 6 ช่อง", details: ["Durable cotton", "Six pockets", "Straight leg"], sizes: ["S", "M", "L", "XL"] },
  { id: 6, name: "Daily Zip Hoodie", category: "HOODIES", price: 2190, color: "bg-[#9c766a]", tone: "#9c766a", label: "", desc: "ฮู้ดดี้ซิปหน้าทรงพอดีตัวสำหรับการแต่งเลเยอร์", details: ["Heavy fleece", "Metal zipper", "Rib cuffs"], sizes: ["S", "M", "L"] }
];

function Garment({ product, large = false }) {
  if (product.images && product.images.length > 0) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#ece6dd]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.images[1] && <img src={product.images[1]} alt={`${product.name} alternate view`} onError={event => { event.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
      </div>
    );
  }

  const pants = product.category === "Baggies";
  return (
    <div className={`relative flex h-full items-center justify-center overflow-hidden ${product.color}`}>
      <div className={`absolute top-[13%] h-10 w-10 rounded-t-full border-2 border-ink border-b-0 ${large ? "scale-125" : ""}`} />
      <div style={{ backgroundColor: product.tone }} className={`relative mt-12 border-2 border-ink shadow-[7px_7px_0_#151515] ${pants ? "h-[62%] w-[48%] [clip-path:polygon(15%_0,85%_0,98%_100%,56%_100%,50%_42%,44%_100%,2%_100%)]" : "h-[54%] w-[58%] [clip-path:polygon(24%_0,76%_0,87%_13%,100%_21%,88%_43%,78%_37%,78%_100%,22%_100%,22%_37%,12%_43%,0_21%,13%_13%)]"}`}>
        {product.category === "Hoodies" && <span className="absolute left-0 right-0 top-[45%] text-center font-display text-2xl text-paper">24</span>}
      </div>
    </div>
  );
}

function DepthHero({ onShop, onMenu }) {
  const element = useRef(null);
  useEffect(() => {
    const section = element.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let frame;
    const update = () => { const box = section.getBoundingClientRect(); section.style.setProperty("--depth", Math.max(-1, Math.min(1, -box.top / box.height)).toFixed(3)); frame = null; };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", scroll, { passive: true });
    return () => { window.removeEventListener("scroll", scroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <section ref={element} className="depth-hero relative isolate min-h-[680px] overflow-hidden bg-ink text-paper md:min-h-[820px]">
    <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90" alt="24 Street collection" className="depth-photo absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35" />
    <div className="depth-title absolute inset-x-6 bottom-12 z-10 md:inset-x-[7vw] md:bottom-16"><p className="text-[10px] tracking-[.25em]">24 STREET / AUTUMN WINTER 2026</p><h1 className="mt-5 font-display text-[clamp(70px,12vw,180px)] leading-[.7] tracking-[-.06em]">THE CITY<br /><span className="font-serif font-normal">IN MOTION.</span></h1><button onClick={onShop} className="mt-8 bg-paper px-5 py-4 text-[10px] text-ink">DISCOVER THE DROP →</button></div>
    <div className="depth-badge absolute left-6 top-28 z-10 grid h-24 w-24 place-items-center rounded-full border border-paper text-center font-display text-lg leading-none md:left-[7vw]">EST.<br />2024</div><div className="absolute right-6 top-28 z-10 text-right md:right-[7vw]"><button onClick={onMenu} className="border border-paper px-3 py-2 text-[9px] tracking-[.16em] transition hover:bg-paper hover:text-ink">VIEW CATEGORIES</button><p className="mt-4 text-[10px] tracking-[.2em]">BANGKOK<br />THAILAND</p></div>
  </section>;
}

const categoryItems = ["All", "New Arrival", "44 Tees", "T-Shirts", "Shirting", "Sweatshirts", "Hoodie", "Longsleeve", "Pants", "Shorts", "Bags", "Headwear", "Underwear", "Accessories"];
const isCategoryMatch = (prodCat, selectedCategory) => {
  const selected = String(selectedCategory ?? "").trim();
  if (!selected || selected.toUpperCase() === "ALL" || selected.toUpperCase() === "ALL PRODUCTS") return true;
  if (!prodCat) return false;
  const productCategory = String(prodCat).toLowerCase().trim();
  const targetCategory = selected.toLowerCase().trim();
  if (productCategory === targetCategory) return true;
  if (["t-shirts", "tees"].includes(targetCategory) && ["tees", "t-shirts", "t-shirt"].includes(productCategory)) return true;
  if (["pants", "baggies"].includes(targetCategory) && ["pants", "baggies", "jeans", "cargo"].includes(productCategory)) return true;
  if (targetCategory === "hoodies" && ["hoodies", "hoodie"].includes(productCategory)) return true;
  return productCategory.includes(targetCategory) || targetCategory.includes(productCategory);
};

function CategoryMenu({ products, active, onChoose, onClose }) {
  return <div className="fixed inset-0 z-[70] bg-white text-[#111]" role="dialog" aria-modal="true" aria-label="Product categories"><div className="flex h-full flex-col overflow-y-auto md:grid md:grid-cols-[260px_1fr]"><aside className="border-b border-black p-7 md:border-b-0 md:border-r md:p-10"><div className="flex items-center justify-between"><a href="#top" onClick={onClose} className="font-display text-3xl leading-[.65]">24<br/><span className="ml-2 text-lg">STREET</span></a><button onClick={onClose} className="text-3xl" aria-label="Close categories">×</button></div><p className="mt-16 text-xs text-black/60">Home <span className="px-1">›</span> Catalog</p><p className="mt-7 text-[10px] font-bold tracking-[.2em]">CATEGORIES</p><nav className="mt-5 grid gap-3 text-xs">{categoryItems.map(category => { const amount = products.filter(product => String(category).toLowerCase().trim() === "new arrival" ? product.label === "NEW" || product.featured : isCategoryMatch(product.category, category)).length; return <button key={category} onClick={() => onChoose(category)} className={`flex items-center justify-between text-left transition hover:pl-2 ${String(active).toLowerCase().trim() === String(category).toLowerCase().trim() ? "font-bold underline underline-offset-4" : "text-black/60"}`}><span>{category.toUpperCase()}</span><span className="text-[9px]">{amount}</span></button>; })}</nav></aside><section className="flex min-h-[420px] flex-col justify-end bg-[#eceae5] p-7 md:p-14"><p className="text-[10px] tracking-[.22em]">24 STREET / PRODUCT INDEX</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(60px,9vw,140px)] leading-[.72]">FIND YOUR<br/><em className="font-serif font-normal">UNIFORM.</em></h2><p className="mt-8 max-w-sm text-xs leading-6 text-black/65">เลือกหมวดหมู่เพื่อดูสินค้าในร้าน ระบบจะแสดงเฉพาะสินค้าที่ตรงกับหมวดนั้นทันที</p></section></div></div>;
}

function ProductDialog({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product.sizes[0]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onMouseDown={onClose}>
    <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-auto bg-paper md:grid-cols-2" onMouseDown={e => e.stopPropagation()}>
      <button className="absolute right-3 top-2 z-10 text-4xl" onClick={onClose} aria-label="ปิด">×</button>
      <div className="min-h-[320px]"><Garment product={product} large /></div>
      <div className="p-8 md:p-12"><p className="text-[10px] tracking-[.2em]">{product.category.toUpperCase()}</p><h2 className="mt-3 font-display text-5xl leading-none">{product.name}</h2><p className="mt-4 text-lg">฿{product.price.toLocaleString("th-TH")}</p><p className="my-7 text-sm leading-7">{product.desc}</p><div className="border-y border-ink py-4 text-xs"><b>DETAILS</b>{product.details.map(detail => <span className="mt-2 block" key={detail}>— {detail}</span>)}</div><label className="my-6 flex items-center justify-between text-xs">SIZE <select value={size} onChange={e => setSize(e.target.value)} className="border border-ink bg-paper p-2">{product.sizes.map(s => <option key={s}>{s}</option>)}</select></label><button onClick={() => onAdd(product, size)} className="w-full bg-ink py-4 text-xs text-paper">ADD TO BAG →</button></div>
    </div>
  </div>;
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("ALL"); const [selected, setSelected] = useState(null); const [bag, setBag] = useState(() => stored("24street_bag", []).reduce((total, item) => total + item.quantity, 0)); const [bagOpen, setBagOpen] = useState(false); const [checkoutOpen, setCheckoutOpen] = useState(false); const [checkoutAfterLogin, setCheckoutAfterLogin] = useState(false); const [accountOpen, setAccountOpen] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const [user, setUser] = useState(() => stored("24street_user", null)); const [allProducts, setAllProducts] = useState(fallbackProducts); const [bagItems, setBagItems] = useState(() => stored("24street_bag", []));
  const loadProducts = () => {
    const apiUrl = API_URL;
    return fetch(`${apiUrl}/api/products`).then(response => response.ok ? response.json() : Promise.reject()).then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      setAllProducts(data.map((product, index) => ({
        ...product,
        id: product._id,
        category: ({ "t-shirts": "T-SHIRTS", "baggy-pants": "PANTS", hoodies: "HOODIES" })[product.category] || product.category,
        color: ["bg-[#b9d2c1]", "bg-[#cdb9a4]", "bg-[#394450]", "bg-[#df9c72]"][index % 4],
        tone: ["#b9d2c1", "#cdb9a4", "#394450", "#df9c72"][index % 4],
        desc: product.description,
        details: product.materials || [],
        sizes: [...new Set((product.variants || []).map(variant => variant.size))].filter(Boolean).length ? [...new Set(product.variants.map(variant => variant.size))] : ["ONE SIZE"],
      })));
    }).catch(() => {});
  };
  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => { localStorage.setItem("24street_bag", JSON.stringify(bagItems)); setBag(bagItems.reduce((total, item) => total + item.quantity, 0)); }, [bagItems]);
  useEffect(() => { const query = new URLSearchParams(window.location.search); if (query.get("checkout") === "success") { setBagItems([]); setBag(0); window.history.replaceState({}, "", window.location.pathname + window.location.hash); } }, []);
  useEffect(() => { if (user?.role === "admin") setAccountOpen(true); }, [user]);
  const filters = ["ALL", "T-SHIRTS", "PANTS", "HOODIES"];
  const displayedProducts = allProducts.filter(product => String(selectedCategory).trim().toLowerCase() === "new-arrival"
    ? product.label === "NEW" || product.featured
    : isCategoryMatch(product.category, selectedCategory));
  const addToBag = (product, size) => { const variant = product.variants?.find(item => item.size === size) || product.variants?.[0]; const next = { id: product.id, sku: variant?.sku || "", name: product.name, price: product.price, size, color: variant?.color || "", image: product.images?.[0] || "", quantity: 1 }; setBagItems(items => { const found = items.find(item => item.id === next.id && item.sku === next.sku && item.size === next.size); return found ? items.map(item => item.id === next.id && item.sku === next.sku && item.size === next.size ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item) : [...items, next]; }); setSelected(null); setBagOpen(true); };
  const signedIn = account => { localStorage.setItem("24street_user", JSON.stringify(account)); setUser(account); setAccountOpen(false); if (checkoutAfterLogin) { setCheckoutAfterLogin(false); setCheckoutOpen(true); } };
  const signedOut = () => { localStorage.removeItem("24street_user"); localStorage.removeItem("24street_token"); setUser(null); setAccountOpen(false); };
  const beginCheckout = () => { setBagOpen(false); if (user) setCheckoutOpen(true); else { setCheckoutAfterLogin(true); setAccountOpen(true); } };
  if (checkoutOpen) return <CheckoutPanel items={bagItems} user={user} onClose={() => setCheckoutOpen(false)} onOrderCreated={() => { setBagItems([]); setBag(0); }} />;
  if (accountOpen) return <AccountPanel user={user} onClose={() => { setAccountOpen(false); loadProducts(); }} onSignedIn={signedIn} onLogout={signedOut} />;
  if (bagOpen) return <BagDrawer items={bagItems} onChange={items => { setBagItems(items); setBag(items.reduce((total, item) => total + item.quantity, 0)); }} onClose={() => setBagOpen(false)} onCheckout={beginCheckout} />;
  if (menuOpen) return <CategoryMenu products={allProducts} active={selectedCategory} onClose={() => setMenuOpen(false)} onChoose={category => { setSelectedCategory(String(category).toLowerCase().trim()); setMenuOpen(false); requestAnimationFrame(() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })); }} />;
  return <><header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b-2 border-ink bg-paper px-5 md:px-[6vw]"><a href="#top" className="font-display text-3xl leading-[.7] tracking-tight">24<br/>STREET<sup className="ml-1 font-mono text-[9px]">™</sup></a><nav className="flex items-center gap-4 text-xs md:gap-8"><a href="#shop">SHOP</a><a href="#story">STORY</a><button onClick={() => setAccountOpen(true)} className="max-w-20 truncate underline md:max-w-none">{user ? user.name.toUpperCase() : "ACCOUNT"}</button><button onClick={() => setBagOpen(true)} className="bg-ink px-4 py-3 text-paper">BAG {bag}</button></nav></header>
  <main id="top"><section className="relative overflow-hidden border-b border-ink/15 bg-[#e7dfd3] px-5 py-12 md:px-[7vw] md:py-16"><div className="mx-auto grid max-w-screen-2xl items-center gap-10 md:grid-cols-[1fr_0.82fr] md:gap-16"><div className="order-2 py-2 md:order-1 md:py-12"><p className="text-[10px] font-medium tracking-[.24em] text-ink/65">&#10022; THE EVERYDAY UNIFORM &#10022;</p><h1 className="my-7 font-display text-[clamp(4rem,8vw,8.5rem)] leading-[.83] tracking-[-.055em]">OLD SOUL.<br/><span className="font-serif font-normal italic">NEW</span> STREETS.</h1><p className="mb-8 max-w-md text-xs leading-6 text-ink/65 md:text-sm">Considered essentials. Made for everyday rotation.</p><a href="#shop" className="group inline-flex items-center gap-8 rounded-sm bg-ink px-6 py-4 text-[10px] font-medium tracking-[.16em] text-paper transition-colors duration-300 hover:bg-rust">SHOP THE DROP <span aria-hidden="true" className="text-base transition-transform duration-300 group-hover:translate-x-1.5">&#8594;</span></a></div><div className="order-1 md:order-2"><div className="group relative mx-auto aspect-[3/4] w-full max-w-lg overflow-hidden rounded-2xl bg-[#c8b7a5] shadow-2xl"><img src="https://i.postimg.cc/9FKGy5Jm/637e036f0e0277b26453284e18997284.jpg" alt="Streetwear look from the 24 Street collection" fetchPriority="high" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"/><div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"/><span className="absolute bottom-5 left-5 rounded-full border border-paper/80 px-4 py-2 text-[9px] tracking-[.18em] text-paper">BANGKOK / EVERYWHERE</span></div></div></div><div className="pointer-events-none absolute left-5 top-5 hidden -rotate-12 font-display text-xs tracking-[.12em] text-ink/50 md:block md:left-[3vw]">EST. 2024</div></section>
  <div className="ticker border-b border-ink/15 bg-rust py-4 text-ink" aria-label="24 Street quality goods, daily rotation"><div className="ticker-track" aria-hidden="true"><div className="ticker-group"><span>24 STREET <b>&#10036;</b> QUALITY GOODS <b>&#10036;</b> DAILY ROTATION <b>&#10036;</b></span></div><div className="ticker-group"><span>24 STREET <b>&#10036;</b> QUALITY GOODS <b>&#10036;</b> DAILY ROTATION <b>&#10036;</b></span></div></div></div>
  <section id="shop" className="px-5 py-16 md:px-[7vw] md:py-24"><div className="mx-auto max-w-screen-2xl"><div className="flex flex-col justify-between gap-7 border-b border-ink/15 pb-7 md:flex-row md:items-end md:pb-9"><div><p className="text-[10px] tracking-[.2em] text-ink/55">01 / LATEST GOODS</p><h2 className="mt-4 font-display text-[clamp(4rem,8vw,7.5rem)] leading-[.78] tracking-[-.055em]">THE <span className="font-serif font-normal italic">DROP</span></h2></div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter products">{filters.map(x => <button key={x} type="button" aria-pressed={selectedCategory.toLowerCase().trim() === x.toLowerCase().trim()} onClick={() => setSelectedCategory(String(x).toLowerCase().trim())} className={`rounded-full border px-4 py-2.5 text-[9px] tracking-[.16em] transition-colors duration-200 ${selectedCategory.toLowerCase().trim() === x.toLowerCase().trim() ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/65 hover:border-ink hover:text-ink"}`}>{x.toUpperCase()}</button>)}</div></div><div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">{displayedProducts.map(product => <article key={product.id} className="group relative cursor-pointer border border-black transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none" onClick={() => setSelected(product)}><div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ece6dd]"><Garment product={product} /><span className="absolute left-3 top-3 bg-paper px-2.5 py-1.5 text-[8px] tracking-[.14em]">{product.label || "24 STREET"}</span><span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-paper text-lg opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">&#8599;</span><span className="absolute inset-x-0 bottom-0 translate-y-full bg-black py-2 text-center font-mono text-xs font-bold uppercase tracking-widest text-white transition-transform duration-300 group-hover:translate-y-0">VIEW DETAILS</span></div><div className="flex items-start justify-between gap-3 pt-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-ink/55">{product.category}</p><h3 className="mt-1.5 font-display text-lg tracking-wide md:text-xl">{product.name}</h3></div><p className="pt-4 text-xs">&#3647;{product.price.toLocaleString("th-TH")}</p></div></article>)}</div></div></section>
  <button onClick={() => setMenuOpen(true)} className="fixed bottom-5 left-5 z-30 border border-ink bg-paper px-4 py-3 text-[10px] tracking-[.16em] shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">CATEGORIES +</button>
  <DepthHero onShop={() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })} onMenu={() => setMenuOpen(true)} />
  <section id="story" className="relative border-y-2 border-ink bg-sage px-8 py-24 md:px-[18vw]"><div className="absolute left-[7vw] top-6 -rotate-3 bg-sun px-2 py-2 text-[10px]">NO FAST FASHION</div><p className="font-serif text-[clamp(42px,5vw,72px)] leading-none">Clothes with a little more <em>character,</em> made for the long way around.</p></section></main>
  <footer className="flex justify-between gap-3 px-5 py-5 text-[9px] md:px-[5vw]"><span>© 2024 24 STREET</span><span>BANGKOK / EVERYWHERE</span><span>IG · LINE · EMAIL</span></footer>{selected && <ProductDialog product={selected} onClose={() => setSelected(null)} onAdd={addToBag} />}{accountOpen && <UserDialog onClose={() => setAccountOpen(false)} onSignedIn={signedIn} />}</>;
}
