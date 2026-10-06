import { useState } from "react";
import API_URL from "./api";
import { t } from "./i18n";
import { motion } from "framer-motion";



export default function UserDialog({ onClose, onSignedIn, language = "th" }) {
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
      const responseText = await response.text();
      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Account service returned an invalid response (HTTP ${response.status})`);
        }
      }
      if (!response.ok) throw new Error(data.message || `Unable to continue (HTTP ${response.status})`);
      if (!data.token || !data.user) throw new Error(`Account service returned an incomplete response (HTTP ${response.status})`);
      localStorage.setItem("24street_token", data.token);
      onSignedIn(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onMouseDown={onClose}>
    <motion.form initial={{ y: 14, scale: 0.99 }} animate={{ y: 0, scale: 1 }} exit={{ y: 8, scale: 0.99 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} onSubmit={submit} onMouseDown={e => e.stopPropagation()} className="relative w-full max-w-md border-2 border-ink bg-paper p-8 md:p-10">
      <button type="button" onClick={onClose} className="absolute right-3 top-1 text-4xl" aria-label="ปิด">×</button>
      <p className="text-[10px] tracking-[.2em]">24 STREET ACCOUNT</p><h2 className="mt-3 font-display text-5xl leading-none">{mode === "login" ? t(language, "welcomeBack").toUpperCase() : t(language, "joinClub").toUpperCase()}</h2>
      {mode === "register" && <label className="mt-7 block text-xs">{t(language, "name").toUpperCase()}<input required minLength="2" name="name" value={form.name} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>}
      <label className="mt-5 block text-xs">{t(language, "email").toUpperCase()}<input required type="email" name="email" value={form.email} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>
      {mode === "register" && <label className="mt-5 block text-xs">{t(language, "phone").toUpperCase()} <span className="text-ink/50">(OPTIONAL)</span><input name="phone" value={form.phone} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>}
      <label className="mt-5 block text-xs">{t(language, "password").toUpperCase()}<input required minLength="8" type="password" name="password" value={form.password} onChange={update} className="mt-2 w-full border border-ink bg-paper p-3" /></label>
      {error && <p className="mt-4 text-xs text-red-700">{error}</p>}
      <button disabled={loading} className="mt-7 w-full bg-ink py-4 text-xs text-paper disabled:opacity-60">{loading ? "PLEASE WAIT..." : mode === "login" ? t(language, "signIn").toUpperCase() : t(language, "createAccount").toUpperCase()}</button>
      <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="mt-5 w-full text-xs underline">{mode === "login" ? t(language, "createAccount") : t(language, "signIn")}</button>
    </motion.form>
  </motion.div>;
}
