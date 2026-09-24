import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UserDialog({ onClose, onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const path = mode === "login" ? "/api/users/login" : "/api/users/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const response = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue");
      localStorage.setItem("24street_token", data.token);
      onSignedIn(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onMouseDown={onClose}>
    <form onSubmit={submit} onMouseDown={e => e.stopPropagation()} className="relative w-full max-w-md border-2 border-ink bg-paper p-8 md:p-10">
      <button type="button" onClick={onClose} className="absolute right-3 top-1 text-4xl" aria-label="ปิด">×</button>
      <p className="text-[10px] tracking-[.2em]">24 STREET ACCOUNT</p><h2 className="mt-3 font-display text-5xl leading-none">{mode === "login" ? "WELCOME BACK" : "JOIN THE CLUB"}</h2>
      {mode === "register" && <label className="mt-7 block text-xs">NAME<input required minLength="2" name="name" value={form.name} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>}
      <label className="mt-5 block text-xs">EMAIL<input required type="email" name="email" value={form.email} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>
      {mode === "register" && <label className="mt-5 block text-xs">PHONE <span className="text-ink/50">(OPTIONAL)</span><input name="phone" value={form.phone} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>}
      <label className="mt-5 block text-xs">PASSWORD<input required minLength="8" type="password" name="password" value={form.password} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>
      {error && <p className="mt-4 text-xs text-red-700">{error}</p>}
      <button disabled={loading} className="mt-7 w-full bg-ink py-4 text-xs text-paper disabled:opacity-60">{loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}</button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 w-full text-xs underline">{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
    </form>
  </div>;
}
