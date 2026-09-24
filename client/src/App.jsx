import { useEffect, useRef, useState } from "react";
import UserDialog from "./UserDialog";
import BagDrawer from "./BagDrawer";
import AccountPanel from "./AccountPanel";

const stored = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { localStorage.removeItem(key); return fallback; } };

const fallbackProducts = [
  { id: 1, name: "Heavyweight Tee", category: "Tees", price: 890, color: "bg-[#b9d2c1]", tone: "#b9d2c1", label: "NEW", desc: "เสื้อยืดคอตตอนเนื้อหนัก ทรง boxy ที่ใส่สบายในทุกวัน", details: ["100% cotton", "230 GSM", "Pre-shrunk"], sizes: ["S", "M", "L", "XL"] },
  { id: 2, name: "Weekend Baggy", category: "Baggies", price: 1690, color: "bg-[#cdb9a4]", tone: "#cdb9a4", label: "BEST", desc: "กางเกงแบกกี้ทรงหลวม เอวปรับได้ และมีกระเป๋าข้าง", details: ["Cotton twill", "Relaxed fit", "Adjustable waist"], sizes: ["S", "M", "L", "XL"] },
  { id: 3, name: "Essential Hoodie", category: "Hoodies", price: 1990, color: "bg-[#394450]", tone: "#394450", label: "NEW", desc: "ฮู้ดดี้ทรง oversize เนื้อเฟลซนุ่ม พร้อมใส่ตลอดฤดูกาล", details: ["Cotton fleece", "Brushed interior", "Oversized fit"], sizes: ["S", "M", "L", "XL"] },
  { id: 4, name: "Sun Faded Tee", category: "Tees", price: 790, color: "bg-[#df9c72]", tone: "#df9c72", label: "", desc: "เสื้อยืดสีเฟดให้บรรยากาศวินเทจ นุ่มตั้งแต่ครั้งแรก", details: ["Washed cotton", "Relaxed fit", "Soft finish"], sizes: ["S", "M", "L"] },
  { id: 5, name: "Utility Cargo", category: "Baggies", price: 1890, color: "bg-[#79876c]", tone: "#79876c", label: "NEW", desc: "กางเกง cargo ทรงตรงพร้อมกระเป๋าใช้งาน 6 ช่อง", details: ["Durable cotton", "Six pockets", "Straight leg"], sizes: ["S", "M", "L", "XL"] },
  { id: 6, name: "Daily Zip Hoodie", category: "Hoodies", price: 2190, color: "bg-[#9c766a]", tone: "#9c766a", label: "", desc: "ฮู้ดดี้ซิปหน้าทรงพอดีตัวสำหรับการแต่งเลเยอร์", details: ["Heavy fleece", "Metal zipper", "Rib cuffs"], sizes: ["S", "M", "L"] }
];

function Garment({ product, large = false }) {
  const pants = product.category === "Baggies";
  return <div className={`relative flex h-full items-center justify-center overflow-hidden ${product.color}`}>
    <div className={`absolute top-[13%] h-10 w-10 rounded-t-full border-2 border-ink border-b-0 ${large ? "scale-125" : ""}`} />
    <div style={{ backgroundColor: product.tone }} className={`relative mt-12 border-2 border-ink shadow-[7px_7px_0_#151515] ${pants ? "h-[62%] w-[48%] [clip-path:polygon(15%_0,85%_0,98%_100%,56%_100%,50%_42%,44%_100%,2%_100%)]" : "h-[54%] w-[58%] [clip-path:polygon(24%_0,76%_0,87%_13%,100%_21%,88%_43%,78%_37%,78%_100%,22%_100%,22%_37%,12%_43%,0_21%,13%_13%)]"}`}>
      {product.category === "Hoodies" && <span className="absolute left-0 right-0 top-[45%] text-center font-display text-2xl text-paper">24</span>}
    </div>
  </div>;
}

function Cartoon() {
  return <div className="relative mx-auto h-[420px] w-[280px] md:h-[500px] md:w-[340px]" aria-label="ภาพการ์ตูนคนใส่ฮู้ด">
    <div className="absolute left-0 top-7 h-72 w-72 rounded-full bg-rust md:h-80 md:w-80" />
    <div className="absolute left-[28%] top-14 z-[2] h-32 w-28 rounded-[48%] border-2 border-ink bg-[#70452f] before:absolute before:-left-2 before:-top-4 before:h-12 before:w-32 before:rounded-[50%] before:bg-ink" />
    <div className="absolute left-[9%] top-40 z-[1] h-56 w-64 rounded-t-[45%] border-2 border-ink bg-[#3c4651]" />
    <div className="absolute left-[9%] top-[355px] h-20 w-24 border-2 border-ink bg-[#4d5b61] md:top-[380px]" />
    <div className="absolute right-[9%] top-[355px] h-20 w-24 border-2 border-ink bg-[#4d5b61] md:top-[380px]" />
    <span className="absolute left-[25%] top-[245px] z-[2] font-display text-4xl text-paper">24</span>
  </div>;
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
const matchesCategory = (product, category) => {
  const value = String(product.category || "").toLowerCase();
  if (category === "All") return true;
  if (category === "New Arrival") return product.label === "NEW" || product.featured;
  if (["44 Tees", "T-Shirts", "Longsleeve", "Tees"].includes(category)) return value.includes("tee") || value.includes("t-shirt");
  if (category === "Shirting") return value.includes("shirt") || value.includes("jacket");
  if (["Sweatshirts", "Hoodie", "Hoodies"].includes(category)) return value.includes("hood");
  if (["Pants", "Shorts", "Baggies"].includes(category)) return value.includes("bagg") || value.includes("pant") || value.includes("short");
  if (category === "Bags") return value.includes("bag");
  if (category === "Headwear") return value.includes("cap") || value.includes("head");
  if (category === "Accessories") return value.includes("access");
  return false;
};

function CategoryMenu({ products, active, onChoose, onClose }) {
  return <div className="fixed inset-0 z-[70] bg-white text-[#111]" role="dialog" aria-modal="true" aria-label="Product categories"><div className="flex h-full flex-col overflow-y-auto md:grid md:grid-cols-[260px_1fr]"><aside className="border-b border-black p-7 md:border-b-0 md:border-r md:p-10"><div className="flex items-center justify-between"><a href="#top" onClick={onClose} className="font-display text-3xl leading-[.65]">24<br/><span className="ml-2 text-lg">STREET</span></a><button onClick={onClose} className="text-3xl" aria-label="Close categories">×</button></div><p className="mt-16 text-xs text-black/60">Home <span className="px-1">›</span> Catalog</p><p className="mt-7 text-[10px] font-bold tracking-[.2em]">CATEGORIES</p><nav className="mt-5 grid gap-3 text-xs">{categoryItems.map(category => { const amount = products.filter(product => matchesCategory(product, category)).length; return <button key={category} onClick={() => onChoose(category)} className={`flex items-center justify-between text-left transition hover:pl-2 ${active === category ? "font-bold underline underline-offset-4" : "text-black/60"}`}><span>{category.toUpperCase()}</span><span className="text-[9px]">{amount}</span></button>; })}</nav></aside><section className="flex min-h-[420px] flex-col justify-end bg-[#eceae5] p-7 md:p-14"><p className="text-[10px] tracking-[.22em]">24 STREET / PRODUCT INDEX</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(60px,9vw,140px)] leading-[.72]">FIND YOUR<br/><em className="font-serif font-normal">UNIFORM.</em></h2><p className="mt-8 max-w-sm text-xs leading-6 text-black/65">เลือกหมวดหมู่เพื่อดูสินค้าในร้าน ระบบจะแสดงเฉพาะสินค้าที่ตรงกับหมวดนั้นทันที</p></section></div></div>;
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
  const [filter, setFilter] = useState("All"); const [selected, setSelected] = useState(null); const [bag, setBag] = useState(0); const [bagOpen, setBagOpen] = useState(false); const [accountOpen, setAccountOpen] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const [user, setUser] = useState(() => stored("24street_user", null)); const [products, setProducts] = useState(fallbackProducts); const [bagItems, setBagItems] = useState(() => stored("24street_bag", []));
  const loadProducts = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return fetch(`${apiUrl}/api/products`).then(response => response.ok ? response.json() : Promise.reject()).then(data => {
      if (!data.length) return;
      setProducts(data.map((product, index) => ({
        ...product,
        id: product._id,
        category: ({ "t-shirts": "Tees", "baggy-pants": "Baggies", hoodies: "Hoodies" })[product.category] || product.category,
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
  useEffect(() => { localStorage.setItem("24street_bag", JSON.stringify(bagItems)); }, [bagItems]);
  // Admins land in the single management workspace immediately after sign-in or refresh.
  useEffect(() => { if (user?.role === "admin") setAccountOpen(true); }, [user]);
  const filters = ["All", "Tees", "Baggies", "Hoodies"];
  const shown = products.filter(product => matchesCategory(product, filter));
  const addToBag = (product, size) => { setBag(n => n + 1); setBagItems(items => { const found = items.find(item => item.id === product.id && item.size === size); return found ? items.map(item => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { id: product.id, name: product.name, price: product.price, size, quantity: 1 }]; }); setSelected(null); setBagOpen(true); };
  const signedIn = account => { localStorage.setItem("24street_user", JSON.stringify(account)); setUser(account); setAccountOpen(false); };
  const signedOut = () => { localStorage.removeItem("24street_user"); localStorage.removeItem("24street_token"); setUser(null); setAccountOpen(false); };
  if (accountOpen) return <AccountPanel user={user} onClose={() => { setAccountOpen(false); loadProducts(); }} onSignedIn={signedIn} onLogout={signedOut} />;
  if (bagOpen) return <BagDrawer items={bagItems} onChange={setBagItems} onClose={() => setBagOpen(false)} onCheckout={() => { setBagOpen(false); setAccountOpen(true); }} />;
  if (menuOpen) return <CategoryMenu products={products} active={filter} onClose={() => setMenuOpen(false)} onChoose={category => { setFilter(category); setMenuOpen(false); requestAnimationFrame(() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })); }} />;
  return <><header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b-2 border-ink bg-paper px-5 md:px-[6vw]"><a href="#top" className="font-display text-3xl leading-[.7] tracking-tight">24<br/>STREET<sup className="ml-1 font-mono text-[9px]">™</sup></a><nav className="flex items-center gap-4 text-xs md:gap-8"><a href="#shop">SHOP</a><a href="#story">STORY</a><button onClick={() => setAccountOpen(true)} className="hidden underline md:block">{user ? user.name.toUpperCase() : "ACCOUNT"}</button><button className="bg-ink px-4 py-3 text-paper">BAG {bag}</button></nav></header>
  <main id="top"><section className="relative grid min-h-[600px] overflow-hidden border-b-2 border-ink bg-[#e0d8cb] md:grid-cols-2"><div className="z-10 px-8 pb-14 pt-24 md:pl-[9vw]"><p className="text-[11px] tracking-[.15em]">✦ THE EVERYDAY UNIFORM ✦</p><h1 className="my-7 font-display text-[clamp(74px,10vw,150px)] leading-[.78] tracking-[-.06em]">OLD SOUL.<br/><span className="font-serif font-normal">NEW</span> STREETS.</h1><a href="#shop" className="inline-block bg-ink px-5 py-4 text-xs text-paper">SHOP THE DROP →</a></div><div className="relative flex items-end justify-center"><Cartoon /></div><div className="absolute left-[5vw] top-12 grid h-20 w-20 -rotate-12 place-items-center rounded-full border-2 border-ink bg-paper text-center font-display text-lg leading-none">EST.<br/>2024</div></section>
  <div className="overflow-hidden whitespace-nowrap border-b-2 border-ink bg-rust py-3 font-display text-xl tracking-widest">24 STREET · QUALITY GOODS · DAILY ROTATION · 24 STREET · QUALITY GOODS · DAILY ROTATION ·</div>
  <section id="shop" className="px-5 py-16 md:px-[6vw] md:py-20"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-[10px] tracking-[.2em]">01 / LATEST GOODS</p><h2 className="mt-4 font-display text-[clamp(70px,9vw,120px)] leading-[.7] tracking-[-.06em]">THE <span className="font-serif font-normal">DROP</span></h2></div><div className="flex flex-wrap gap-2">{filters.map(x => <button key={x} onClick={() => setFilter(x)} className={`tag ${filter === x ? "bg-ink text-paper" : ""}`}>{x.toUpperCase()}</button>)}</div></div><div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{shown.map(product => <article key={product.id} className="relative cursor-pointer" onClick={() => setSelected(product)}><div className="h-56 md:h-80"><Garment product={product} /></div>{product.label && <span className="absolute left-2 top-2 bg-ink px-2 py-1 text-[9px] text-paper">{product.label}</span>}<div className="flex justify-between gap-3 pt-3"><div><p className="text-[9px] uppercase tracking-wider">{product.category}</p><h3 className="mt-1 font-display text-xl">{product.name}</h3></div><p className="pt-4 text-xs">฿{product.price.toLocaleString("th-TH")}</p></div></article>)}</div></section>
  <button onClick={() => setMenuOpen(true)} className="fixed bottom-5 left-5 z-30 border border-ink bg-paper px-4 py-3 text-[10px] tracking-[.16em] shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">CATEGORIES +</button>
  <DepthHero onShop={() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })} onMenu={() => setMenuOpen(true)} />
  <section id="story" className="relative border-y-2 border-ink bg-sage px-8 py-24 md:px-[18vw]"><div className="absolute left-[7vw] top-6 -rotate-3 bg-sun px-2 py-2 text-[10px]">NO FAST FASHION</div><p className="font-serif text-[clamp(42px,5vw,72px)] leading-none">Clothes with a little more <em>character,</em> made for the long way around.</p></section></main>
  <footer className="flex justify-between gap-3 px-5 py-5 text-[9px] md:px-[5vw]"><span>© 2024 24 STREET</span><span>BANGKOK / EVERYWHERE</span><span>IG · LINE · EMAIL</span></footer>{selected && <ProductDialog product={selected} onClose={() => setSelected(null)} onAdd={addToBag} />}{accountOpen && <UserDialog onClose={() => setAccountOpen(false)} onSignedIn={signedIn} />}</>;
}
