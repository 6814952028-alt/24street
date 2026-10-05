import { useEffect, useRef, useState } from "react";
import UserDialog from "./UserDialog";
import BagDrawer from "./BagDrawer";
import AccountPanel from "./AccountPanel";
import CheckoutPanel from "./CheckoutPanel";
import ResilientImage from "./ResilientImage";
import API_URL from "./api";
import { t, categoryNames } from "./i18n";

const stored = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { localStorage.removeItem(key); return fallback; } };

function GarmentFallback({ product, large = false }) {
  const pants = ["baggy-pants", "shorts"].includes(product.category);
  return (
    <div className={`relative flex h-full items-center justify-center overflow-hidden ${product.color}`}>
      <div className={`absolute top-[13%] h-10 w-10 rounded-t-full border-2 border-ink border-b-0 ${large ? "scale-125" : ""}`} />
      <div style={{ backgroundColor: product.tone }} className={`relative mt-12 border-2 border-ink shadow-[7px_7px_0_#151515] ${pants ? "h-[62%] w-[48%] [clip-path:polygon(15%_0,85%_0,98%_100%,56%_100%,50%_42%,44%_100%,2%_100%)]" : "h-[54%] w-[58%] [clip-path:polygon(24%_0,76%_0,87%_13%,100%_21%,88%_43%,78%_37%,78%_100%,22%_100%,22%_37%,12%_43%,0_21%,13%_13%)]"}`}>
        {["Hoodies", "hoodies", "sweatshirts"].includes(product.category) && <span className="absolute left-0 right-0 top-[45%] text-center font-display text-2xl text-paper">24</span>}
      </div>
    </div>
  );
}

function Garment({ product, large = false }) {
  const fallback = <GarmentFallback product={product} large={large} />;
  if (!product.images?.length) return fallback;
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#ece6dd]">
      <ResilientImage
        src={product.images[0]}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallback={fallback}
      />
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
    <ResilientImage src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90" alt="24 Street collection" className="depth-photo absolute inset-0 h-full w-full object-cover" fallback={<div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,#9c766a_0%,#394450_34%,#151515_76%)]"><span className="absolute right-[12%] top-[18%] font-display text-[clamp(120px,30vw,420px)] leading-none text-paper/10">24</span></div>} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35" />
    <div className="depth-title absolute inset-x-6 bottom-12 z-10 md:inset-x-[7vw] md:bottom-16"><p className="text-[10px] tracking-[.25em]">24 STREET / AUTUMN WINTER 2026</p><h1 className="mt-5 font-display text-[clamp(70px,12vw,180px)] leading-[.7] tracking-[-.06em]">THE CITY<br /><span className="font-serif font-normal">IN MOTION.</span></h1><button onClick={onShop} className="mt-8 bg-paper px-5 py-4 text-[10px] text-ink">DISCOVER THE DROP →</button></div>
    <div className="depth-badge absolute left-6 top-28 z-10 grid h-24 w-24 place-items-center rounded-full border border-paper text-center font-display text-lg leading-none md:left-[7vw]">EST.<br />2024</div><div className="absolute right-6 top-28 z-10 text-right md:right-[7vw]"><button onClick={onMenu} className="border border-paper px-3 py-2 text-[9px] tracking-[.16em] transition hover:bg-paper hover:text-ink">VIEW CATEGORIES</button><p className="mt-4 text-[10px] tracking-[.2em]">BANGKOK<br />THAILAND</p></div>
  </section>;
}

const categoryItems = ["all", "new-arrival", "t-shirts", "hoodies", "sweatshirts", "baggy-pants", "shorts", "bags", "headwear", "underwear", "accessories"];
const matchesCategory = (product, category) => category === "all"
  || (category === "new-arrival" && (product.label === "NEW" || product.featured))
  || product.category === category;

function CategoryMenu({ products, active, onChoose, onClose, language }) {
  const names = categoryNames(language);
  return <div className="fixed inset-0 z-[70] bg-white text-[#111]" role="dialog" aria-modal="true" aria-label={t(language, "categories")}><div className="flex h-full flex-col overflow-y-auto md:grid md:grid-cols-[260px_1fr]"><aside className="border-b border-black p-7 md:border-b-0 md:border-r md:p-10"><div className="flex items-center justify-between"><a href="#top" onClick={onClose} className="font-display text-3xl leading-[.65]">24<br/><span className="ml-2 text-lg">STREET</span></a><button onClick={onClose} className="text-3xl" aria-label={t(language, "close")}>×</button></div><p className="mt-16 text-xs text-black/60">{t(language, "home")} <span className="px-1">›</span> {t(language, "categories")}</p><p className="mt-7 text-[10px] font-bold tracking-[.2em]">{t(language, "category").toUpperCase()}</p><nav className="mt-5 grid gap-3 text-xs">{categoryItems.map(id => { const amount = products.filter(product => matchesCategory(product, id)).length; const name = names[id] || t(language, id); return <button key={id} onClick={() => onChoose(id)} className={`flex items-center justify-between text-left transition hover:pl-2 ${active === id ? "font-bold underline underline-offset-4" : "text-black/60"}`}><span>{name.toUpperCase()}</span><span className="text-[9px]">{amount}</span></button>; })}</nav></aside><section className="flex min-h-[420px] flex-col justify-end bg-[#eceae5] p-7 md:p-14"><p className="text-[10px] tracking-[.22em]">24 STREET / PRODUCT INDEX</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(60px,9vw,140px)] leading-[.72]">{t(language, "findUniform")}</h2><p className="mt-8 max-w-sm text-xs leading-6 text-black/65">{t(language, "chooseCategory")}</p></section></div></div>;
}

function ProductDialog({ product, bagItems, onClose, onAdd, language }) {
  const variants = product.variants || [];
  const initialVariant = variants.find(variant => variant.sku && Number(variant.stock) > 0) || variants[0];
  const [size, setSize] = useState(initialVariant?.size || "");
  const [color, setColor] = useState(initialVariant?.color || "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const sizes = [...new Set(variants.map(variant => variant.size).filter(Boolean))];
  const colors = [...new Set(variants.map(variant => variant.color).filter(Boolean))];
  const remainingFor = item => Math.max(0, Math.min(20, Number(item.stock) || 0) - bagItems.filter(line => line.id === product.id && line.sku === item.sku).reduce((total, line) => total + line.quantity, 0));
  const variant = variants.find(item => item.size === size && item.color === color && item.sku);
  const available = variant ? remainingFor(variant) : 0;
  const requestedQuantity = Math.min(quantity, available);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onMouseDown={onClose}>
    <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-auto bg-paper md:grid-cols-2" onMouseDown={e => e.stopPropagation()}>
      <button className="absolute right-3 top-2 z-10 text-4xl" onClick={onClose} aria-label="ปิด">×</button>
      <div className="min-h-[320px]"><Garment product={product} large /></div>
      <div className="p-8 md:p-12"><p className="text-[10px] tracking-[.2em]">{(categoryNames(language)[product.category] || product.category).toUpperCase()}</p><h2 className="mt-3 font-display text-5xl leading-none">{product.name}</h2><p className="mt-4 text-lg"><span className="mr-2 text-xs">{t(language, "price")}</span>฿{product.price.toLocaleString("th-TH")}</p><p className="my-7 text-sm leading-7">{product.desc}</p><div className="border-y border-ink py-4 text-xs"><b>{t(language, "details").toUpperCase()}</b>{product.details.map(detail => <span className="mt-2 block" key={detail}>— {detail}</span>)}</div>{variants.length ? <div className="my-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs">{t(language, "size").toUpperCase()}<select value={size} onChange={event => { const nextSize = event.target.value; const currentColorAvailable = variants.some(item => item.size === nextSize && item.color === color && remainingFor(item) > 0); const nextVariant = variants.find(item => item.size === nextSize && item.sku && remainingFor(item) > 0); setSize(nextSize); if (!currentColorAvailable && nextVariant) setColor(nextVariant.color); setQuantity(1); setMessage(""); }} className="border border-ink bg-paper p-2">{sizes.map(item => <option key={item} value={item} disabled={!variants.some(entry => entry.size === item && entry.sku && remainingFor(entry) > 0)}>{item}</option>)}</select></label><label className="grid gap-2 text-xs">{t(language, "color").toUpperCase()}<select value={color} onChange={event => { setColor(event.target.value); setQuantity(1); setMessage(""); }} className="border border-ink bg-paper p-2">{colors.map(item => <option key={item} value={item} disabled={!variants.some(entry => entry.color === item && entry.sku && remainingFor(entry) > 0)}>{item}</option>)}</select></label><label className="grid gap-2 text-xs">{t(language, "quantity").toUpperCase()}<select value={available ? requestedQuantity : 1} disabled={available === 0} onChange={event => setQuantity(Number(event.target.value))} className="border border-ink bg-paper p-2 disabled:opacity-50">{Array.from({ length: available }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value}</option>)}</select></label><p className="self-end pb-2 text-xs" role="status">{available > 0 ? `${available} ${t(language, "available")}` : t(language, "outOfStock")}</p></div> : <p role="status" className="my-6 text-sm text-red-700">{t(language, "noVariants")}</p>}{message && <p role="alert" className="mb-3 text-xs text-red-700">{message}</p>}<button disabled={!variant || available === 0} onClick={() => { const error = onAdd(product, variant, requestedQuantity); if (error) setMessage(error); }} className="w-full bg-ink py-4 text-xs text-paper disabled:cursor-not-allowed disabled:opacity-50">{t(language, "addToBag").toUpperCase()} →</button></div>
    </div>
  </div>;
}

export default function App() {
  const [language, setLanguage] = useState(() => stored("24street_language", "th"));
  const [filter, setFilter] = useState("all"); const [selected, setSelected] = useState(null); const [bag, setBag] = useState(() => stored("24street_bag", []).reduce((total, item) => total + item.quantity, 0)); const [bagOpen, setBagOpen] = useState(false); const [checkoutOpen, setCheckoutOpen] = useState(false); const [checkoutAfterLogin, setCheckoutAfterLogin] = useState(false); const [accountOpen, setAccountOpen] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const [user, setUser] = useState(() => stored("24street_user", null)); const [products, setProducts] = useState([]); const [catalogStatus, setCatalogStatus] = useState("loading"); const [catalogError, setCatalogError] = useState(""); const [bagItems, setBagItems] = useState(() => stored("24street_bag", []));
  const loadProducts = () => {
    setCatalogStatus("loading");
    setCatalogError("");
    return fetch(`${API_URL}/api/products`).then(response => {
      if (!response.ok) throw new Error(`Catalog request failed (HTTP ${response.status})`);
      return response.json();
    }).then(data => {
      if (!Array.isArray(data)) throw new Error("Catalog response was invalid");
      const mapped = data.map((product, index) => ({
        ...product,
        name: language === "th" ? product.name : (product.nameEn || product.name),
        id: String(product._id || ""),
        category: product.category,
        color: ["bg-[#b9d2c1]", "bg-[#cdb9a4]", "bg-[#394450]", "bg-[#df9c72]"][index % 4],
        tone: ["#b9d2c1", "#cdb9a4", "#394450", "#df9c72"][index % 4],
        desc: product.description,
        details: product.materials || [],
        variants: Array.isArray(product.variants) ? product.variants : [],
      }));
      setProducts(mapped);
      setCatalogStatus("ready");
      setBagItems(items => items.map(item => {
        const product = mapped.find(entry => entry.id === String(item.id));
        const variant = product?.variants.find(entry => entry.sku === item.sku);
        return product && variant ? { ...item, id: product.id, name: product.name, price: product.price, size: variant.size, color: variant.color, stock: Number(variant.stock) || 0, available: product.status === "active", image: product.images?.[0] || "" } : { ...item, available: false, stock: 0 };
      }));
    }).catch(error => {
      setProducts([]);
      setCatalogStatus("error");
      setCatalogError(error.message || "The catalog could not be loaded.");
    });
  };
  useEffect(() => {
    loadProducts();
  }, [language]);
  useEffect(() => { localStorage.setItem("24street_language", JSON.stringify(language)); }, [language]);
  useEffect(() => { localStorage.setItem("24street_bag", JSON.stringify(bagItems)); setBag(bagItems.reduce((total, item) => total + item.quantity, 0)); }, [bagItems]);
  useEffect(() => { const query = new URLSearchParams(window.location.search); if (query.get("checkout") === "success") { setBagItems([]); setBag(0); window.history.replaceState({}, "", window.location.pathname + window.location.hash); } }, []);
  useEffect(() => { if (user?.role === "admin") setAccountOpen(true); }, [user]);
  const filters = ["all", "t-shirts", "baggy-pants", "hoodies", "sweatshirts", "shorts", "bags", "headwear", "underwear", "accessories"];
  const shown = products.filter(product => matchesCategory(product, filter));
  const addToBag = (product, variant, quantity) => {
    if (!variant?.sku || Number(variant.stock) < quantity) return "This variant is not available in the requested quantity.";
    const current = bagItems.find(item => item.id === product.id && item.sku === variant.sku)?.quantity || 0;
    if (current + quantity > Math.min(20, Number(variant.stock))) return "There is not enough remaining stock for that quantity.";
    const next = { id: product.id, sku: variant.sku, name: product.name, price: product.price, size: variant.size, color: variant.color, image: product.images?.[0] || "", quantity, stock: Number(variant.stock), available: true };
    setBagItems(items => {
      const found = items.find(item => item.id === next.id && item.sku === next.sku);
      return found ? items.map(item => item.id === next.id && item.sku === next.sku ? { ...item, quantity: item.quantity + quantity, stock: next.stock, available: true } : item) : [...items, next];
    });
    setSelected(null);
    setBagOpen(true);
    return "";
  };
  const signedIn = account => { localStorage.setItem("24street_user", JSON.stringify(account)); setUser(account); setAccountOpen(false); if (checkoutAfterLogin) { setCheckoutAfterLogin(false); setCheckoutOpen(true); } };
  const signedOut = () => { localStorage.removeItem("24street_user"); localStorage.removeItem("24street_token"); setUser(null); setAccountOpen(false); };
  const beginCheckout = () => { setBagOpen(false); if (user) setCheckoutOpen(true); else { setCheckoutAfterLogin(true); setAccountOpen(true); } };
  if (checkoutOpen) return <CheckoutPanel items={bagItems} user={user} language={language} onClose={() => setCheckoutOpen(false)} onOrderCreated={() => { setBagItems([]); setBag(0); }} />;
  if (accountOpen) return <AccountPanel user={user} language={language} onClose={() => { setAccountOpen(false); loadProducts(); }} onSignedIn={signedIn} onLogout={signedOut} />;
  if (bagOpen) return <BagDrawer items={bagItems} language={language} onChange={items => { setBagItems(items); setBag(items.reduce((total, item) => total + item.quantity, 0)); }} onClose={() => setBagOpen(false)} onCheckout={beginCheckout} />;
  if (menuOpen) return <CategoryMenu products={products} active={filter} language={language} onClose={() => setMenuOpen(false)} onChoose={category => { setFilter(category); setMenuOpen(false); requestAnimationFrame(() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })); }} />;
  return <><header className="sticky top-0 z-40 flex h-[78px] items-center justify-between border-b-2 border-ink bg-paper px-5 md:px-[6vw]"><a href="#top" className="font-display text-3xl leading-[.7] tracking-tight">24<br/>STREET<sup className="ml-1 font-mono text-[9px]">™</sup></a><nav className="flex items-center gap-3 text-xs md:gap-8"><a href="#shop">{t(language, "shop").toUpperCase()}</a><a href="#story">{t(language, "story").toUpperCase()}</a><button aria-label="Change language" onClick={() => setLanguage(value => value === "th" ? "en" : "th")} className="border border-ink px-2 py-2">{language === "th" ? "TH / EN" : "EN / TH"}</button><button onClick={() => setAccountOpen(true)} className="max-w-20 truncate underline md:max-w-none">{user ? user.name.toUpperCase() : t(language, "account").toUpperCase()}</button><button onClick={() => setBagOpen(true)} className="bg-ink px-4 py-3 text-paper">{t(language, "bag").toUpperCase()} {bag}</button></nav></header>
  <main id="top"><section className="relative overflow-hidden border-b border-ink/15 bg-[#e7dfd3] px-5 py-12 md:px-[7vw] md:py-16"><div className="mx-auto grid max-w-screen-2xl items-center gap-10 md:grid-cols-[1fr_0.82fr] md:gap-16"><div className="order-2 py-2 md:order-1 md:py-12"><p className="text-[10px] font-medium tracking-[.24em] text-ink/65">&#10022; THE EVERYDAY UNIFORM &#10022;</p><h1 className="my-7 font-display text-[clamp(4rem,8vw,8.5rem)] leading-[.83] tracking-[-.055em]">OLD SOUL.<br/><span className="font-serif font-normal italic">NEW</span> STREETS.</h1><p className="mb-8 max-w-md text-xs leading-6 text-ink/65 md:text-sm">Considered essentials. Made for everyday rotation.</p><a href="#shop" className="group inline-flex items-center gap-8 rounded-sm bg-ink px-6 py-4 text-[10px] font-medium tracking-[.16em] text-paper transition-colors duration-300 hover:bg-rust">SHOP THE DROP <span aria-hidden="true" className="text-base transition-transform duration-300 group-hover:translate-x-1.5">&#8594;</span></a></div><div className="order-1 md:order-2"><div className="group relative mx-auto aspect-[3/4] w-full max-w-lg overflow-hidden rounded-2xl bg-[#c8b7a5] shadow-2xl"><ResilientImage src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" alt="Streetwear look from the 24 Street collection" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" fallback={<div aria-hidden="true" className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_65%_30%,#b9d2c1_0%,#79876c_30%,#394450_70%)]"><span className="font-display text-[clamp(120px,30vw,300px)] leading-none text-paper/60">24</span></div>} /><div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"/><span className="absolute bottom-5 left-5 rounded-full border border-paper/80 px-4 py-2 text-[9px] tracking-[.18em] text-paper">BANGKOK / EVERYWHERE</span></div></div></div><div className="pointer-events-none absolute left-5 top-5 hidden -rotate-12 font-display text-xs tracking-[.12em] text-ink/50 md:block md:left-[3vw]">EST. 2024</div></section>
  <div className="ticker border-b border-ink/15 bg-rust py-4 text-ink" aria-label="24 Street quality goods, daily rotation"><div className="ticker-track" aria-hidden="true"><div className="ticker-group"><span>24 STREET <b>&#10036;</b> QUALITY GOODS <b>&#10036;</b> DAILY ROTATION <b>&#10036;</b></span></div><div className="ticker-group"><span>24 STREET <b>&#10036;</b> QUALITY GOODS <b>&#10036;</b> DAILY ROTATION <b>&#10036;</b></span></div></div></div>
  <section id="shop" className="px-5 py-16 md:px-[7vw] md:py-24"><div className="mx-auto max-w-screen-2xl"><div className="flex flex-col justify-between gap-7 border-b border-ink/15 pb-7 md:flex-row md:items-end md:pb-9"><div><p className="text-[10px] tracking-[.2em] text-ink/55">01 / LATEST GOODS</p><h2 className="mt-4 font-display text-[clamp(4rem,8vw,7.5rem)] leading-[.78] tracking-[-.055em]">THE <span className="font-serif font-normal italic">DROP</span></h2></div><div className="flex flex-wrap gap-2" role="group" aria-label="Filter products">{filters.map(x => <button key={x} type="button" aria-pressed={filter === x} onClick={() => setFilter(x)} className={`rounded-full border px-4 py-2.5 text-[9px] tracking-[.16em] transition-colors duration-200 ${filter === x ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/65 hover:border-ink hover:text-ink"}`}>{(categoryNames(language)[x] || x).toUpperCase()}</button>)}</div></div>{catalogStatus === "loading" ? <p className="py-16 text-center text-sm" role="status">{t(language, "loading")}</p> : catalogStatus === "error" ? <div className="py-16 text-center"><p role="alert" className="text-sm text-red-700">{catalogError}</p><button onClick={loadProducts} className="mt-4 border border-ink px-5 py-3 text-xs">{t(language, "retry").toUpperCase()}</button></div> : shown.length ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">{shown.map(product => <article key={product.id} className="group relative cursor-pointer" onClick={() => setSelected(product)}><div className="relative h-56 overflow-hidden bg-[#ece6dd] sm:h-72 md:h-80"><Garment product={product} /><span className="absolute left-3 top-3 bg-paper px-2.5 py-1.5 text-[8px] tracking-[.14em]">{product.label || "24 STREET"}</span><span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-paper text-lg opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">&#8599;</span></div><div className="flex items-start justify-between gap-3 pt-4"><div><p className="text-[9px] uppercase tracking-[.16em] text-ink/55">{categoryNames(language)[product.category] || product.category}</p><h3 className="mt-1.5 font-display text-lg tracking-wide md:text-xl">{product.name}</h3></div><p className="pt-4 text-xs">&#3647;{product.price.toLocaleString("th-TH")}</p></div></article>)}</div> : <p className="py-16 text-center text-sm">{t(language, "emptyCategory")}</p>}</div></section>
  <button onClick={() => setMenuOpen(true)} className="fixed bottom-5 left-5 z-30 border border-ink bg-paper px-4 py-3 text-[10px] tracking-[.16em] shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">{t(language, "categories").toUpperCase()} +</button>
  <DepthHero onShop={() => document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" })} onMenu={() => setMenuOpen(true)} />
  <section id="story" className="relative border-y-2 border-ink bg-sage px-8 py-24 md:px-[18vw]"><div className="absolute left-[7vw] top-6 -rotate-3 bg-sun px-2 py-2 text-[10px]">NO FAST FASHION</div><p className="font-serif text-[clamp(42px,5vw,72px)] leading-none">Clothes with a little more <em>character,</em> made for the long way around.</p></section></main>
  <footer className="flex justify-between gap-3 px-5 py-5 text-[9px] md:px-[5vw]"><span>© 2024 24 STREET</span><span>BANGKOK / EVERYWHERE</span><span>IG · LINE · EMAIL</span></footer>{selected && <ProductDialog key={selected.id} language={language} product={selected} bagItems={bagItems} onClose={() => setSelected(null)} onAdd={addToBag} />}{accountOpen && <UserDialog onClose={() => setAccountOpen(false)} onSignedIn={signedIn} />}</>;
}
