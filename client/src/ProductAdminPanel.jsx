import { useEffect, useState } from "react";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const auth = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("24street_token")}` });
const blank = { name: "", slug: "", category: "t-shirts", price: "", compareAtPrice: "", description: "", materials: "", care: "", images: "", variants: "", featured: false, status: "active" };
const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const toForm = product => ({ ...product, materials: (product.materials || []).join(", "), care: (product.care || []).join(", "), images: (product.images || []).join(", "), variants: JSON.stringify(product.variants || [], null, 2) });
const payloadFor = form => ({ ...form, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, materials: form.materials.split(",").map(x => x.trim()).filter(Boolean), care: form.care.split(",").map(x => x.trim()).filter(Boolean), images: form.images.split(",").map(x => x.trim()).filter(Boolean), variants: form.variants.trim() ? JSON.parse(form.variants) : [] });

export default function ProductAdminPanel() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = () => fetch(`${api}/api/products/admin/all`, { headers: auth() }).then(r => r.json()).then(data => setProducts(Array.isArray(data) ? data : []));
  useEffect(() => { load(); }, []);
  const update = event => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value, ...(name === "name" && !editing ? { slug: slugify(value) } : {}) });
  };
  const uploadImage = async event => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`${api}/api/uploads`, { method: "POST", headers: { Authorization: auth().Authorization }, body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to upload image");
      setForm(current => ({ ...current, images: [current.images, data.url].filter(Boolean).join(", ") }));
      setMessage("Image uploaded");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const submit = async event => {
    event.preventDefault();
    try {
      const response = await fetch(`${api}/api/products${editing ? `/${editing}` : ""}`, { method: editing ? "PATCH" : "POST", headers: auth(), body: JSON.stringify(payloadFor(form)) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save product");
      setMessage(editing ? "Product updated" : "Product added");
      setForm(blank);
      setEditing(null);
      load();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  const edit = product => { setEditing(product._id); setForm(toForm(product)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const archive = async id => {
    if (!window.confirm("Archive this product? It will disappear from the storefront.")) return;
    const response = await fetch(`${api}/api/products/${id}`, { method: "DELETE", headers: auth() });
    if (response.ok) { setMessage("Product archived"); load(); }
  };

  return <section className="mt-10 border-t-2 border-ink pt-8">
    <p className="text-[10px] tracking-[.2em]">ADMIN - CATALOG MANAGEMENT</p>
    <h3 className="mt-2 font-display text-4xl">PRODUCTS</h3>
    <form className="mt-5 grid gap-3 border-2 border-ink p-4 md:grid-cols-2" onSubmit={submit}>
      <p className="font-display text-2xl md:col-span-2">{editing ? "EDIT PRODUCT" : "ADD PRODUCT"}</p>
      <label className="text-[10px]">NAME<input required name="name" value={form.name} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <label className="text-[10px]">SLUG<input required name="slug" value={form.slug} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <label className="text-[10px]">CATEGORY<select name="category" value={form.category} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm">{["t-shirts", "baggy-pants", "hoodies", "jackets", "accessories"].map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="text-[10px]">PRICE (THB)<input required min="0" type="number" name="price" value={form.price} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <label className="text-[10px]">SALE PRICE<input min="0" type="number" name="compareAtPrice" value={form.compareAtPrice || ""} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <label className="flex items-end gap-2 pb-2 text-xs"><input type="checkbox" name="featured" checked={form.featured} onChange={update} /> FEATURED</label>
      <label className="text-[10px] md:col-span-2">DESCRIPTION<textarea required name="description" value={form.description} onChange={update} className="mt-1 min-h-20 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <label className="text-[10px] md:col-span-2">MATERIALS (comma separated)<input name="materials" value={form.materials} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
      <div className="md:col-span-2">
        <label className="text-[10px]">IMAGE URLS (comma separated)<input name="images" value={form.images} onChange={update} className="mt-1 w-full border border-ink bg-paper p-2 text-sm" /></label>
        <label className="mt-2 block text-[10px]">UPLOAD IMAGE<input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} className="mt-1 block w-full text-sm" /></label>
      </div>
      <label className="text-[10px] md:col-span-2">VARIANTS JSON <span className="normal-case">[{`{"size":"M","color":"Black","sku":"TEE-BLK-M","stock":10}`} ]</span><textarea name="variants" value={form.variants} onChange={update} className="mt-1 min-h-28 w-full border border-ink bg-paper p-2 font-mono text-xs" /></label>
      <div className="flex gap-3 md:col-span-2"><button className="bg-ink px-5 py-3 text-xs text-paper">{editing ? "SAVE CHANGES" : "ADD PRODUCT"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="border border-ink px-5 py-3 text-xs">CANCEL</button>}{message && <p className="self-center text-xs">{message}</p>}</div>
    </form>
    <div className="mt-5 overflow-x-auto border border-ink"><table className="w-full text-left text-xs"><thead className="border-b border-ink"><tr><th className="p-3">PRODUCT</th><th className="p-3">PRICE</th><th className="p-3">STATUS</th><th className="p-3">ACTION</th></tr></thead><tbody>{products.map(product => <tr key={product._id} className="border-b border-ink last:border-0"><td className="p-3"><b>{product.name}</b><br /><span className="text-[10px]">{product.category}</span></td><td className="p-3">THB {Number(product.price).toLocaleString()}</td><td className="p-3">{product.status}</td><td className="flex gap-2 p-3"><button className="underline" onClick={() => edit(product)}>EDIT</button>{product.status !== "archived" && <button className="text-red-700 underline" onClick={() => archive(product._id)}>ARCHIVE</button>}</td></tr>)}</tbody></table></div>
  </section>;
}
