import { useEffect, useMemo, useRef, useState } from "react";

import API_URL from "./api";
import { t } from "./i18n";
import { motion } from "framer-motion";
const money = value => String.fromCharCode(3647) + Number(value || 0).toLocaleString("th-TH");
const blankAddress = user => ({ recipient: user?.name || "", phone: user?.phone || "", email: user?.email || "", line1: "", subdistrict: "", district: "", province: "", postalCode: "" });
const readError = async response => { try { return (await response.json()).message || "Request failed (HTTP " + response.status + ")"; } catch { return "Invalid checkout response (HTTP " + response.status + ")"; } };
function PaymentDestination({ info = {}, language }) {
  const configured = info.bankName || info.accountNumber || info.accountName || info.promptpayNumber || info.promptpayQrUrl;
  return <div className="mt-3 space-y-2 text-xs">
    <p><strong>{t(language, "bankName")}:</strong> {info.bankName || t(language, "notConfigured")}</p>
    <p><strong>{t(language, "accountNumber")}:</strong> {info.accountNumber || t(language, "notConfigured")}</p>
    <p><strong>{t(language, "accountName")}:</strong> {info.accountName || t(language, "notConfigured")}</p>
    <p><strong>{t(language, "promptpayNumber")}:</strong> {info.promptpayNumber || t(language, "notConfigured")}</p>
    {info.promptpayQrUrl ? <img src={info.promptpayQrUrl} alt={t(language, "promptpayQr")} className="mt-3 h-36 w-36 border border-ink/20 bg-white object-contain p-2" /> : <div className="mt-3 flex h-36 w-36 items-center justify-center border border-dashed border-ink/30 bg-white/50 p-3 text-center text-[10px]">{t(language, "promptpayQr")}</div>}
    {!configured && <p role="status" className="text-red-800">{t(language, "paymentInfoMissing")}</p>}
  </div>;
}

export default function CheckoutPanel({ items, user, onClose, onOrderCreated, language = "th" }) {
  const [address, setAddress] = useState(() => blankAddress(user));
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [busy, setBusy] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [error, setError] = useState(""); const [created, setCreated] = useState(null);
  const key = useRef(globalThis.crypto?.randomUUID?.() || (Date.now() + "-" + Math.random()));
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
  const delivery = shippingMethod === "express" ? 120 : shippingMethod === "cod" ? 80 : subtotal >= 1500 ? 0 : 50;
  const update = event => setAddress(old => ({ ...old, [event.target.name]: event.target.value }));

  useEffect(() => {
    fetch(API_URL + "/api/orders/payment-info", { headers: { Authorization: "Bearer " + localStorage.getItem("24street_token") } })
      .then(response => response.ok ? response.json() : {})
      .then(setPaymentInfo)
      .catch(() => {});
  }, []);

  const submit = async event => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!items.length) throw new Error("Your bag is empty");
      if (items.some(item => !item.sku || !/^[a-f0-9]{24}$/i.test(String(item.id)))) throw new Error("Some items are unavailable for online checkout. Refresh the catalog and add them again.");
      if (paymentMethod === "bank_transfer" && !slipFile) throw new Error(t(language, "paymentSlipRequired"));
      if (slipFile && (!slipFile.type.startsWith("image/") || slipFile.size > 5 * 1024 * 1024)) throw new Error(t(language, "invalidSlip"));
      const headers = { Authorization: "Bearer " + localStorage.getItem("24street_token") };
      let body;
      if (paymentMethod === "bank_transfer") {
        body = new FormData();
        body.append("items", JSON.stringify(items.map(item => ({ productId: item.id, sku: item.sku, quantity: item.quantity }))));
        body.append("shippingAddress", JSON.stringify(address));
        body.append("shippingMethod", shippingMethod);
        body.append("paymentMethod", paymentMethod);
        body.append("idempotencyKey", key.current);
        body.append("slip", slipFile);
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ items: items.map(item => ({ productId: item.id, sku: item.sku, quantity: item.quantity })), shippingAddress: address, shippingMethod, paymentMethod, idempotencyKey: key.current });
      }
      const response = await fetch(API_URL + "/api/orders", { method: "POST", headers, body });
      if (!response.ok) { const message = await readError(response); if (response.status === 409) key.current = globalThis.crypto?.randomUUID?.() || (Date.now() + "-" + Math.random()); throw new Error(message); }
      const data = await response.json();
      if (data.checkoutUrl) { window.location.assign(data.checkoutUrl); return; }
      onOrderCreated(data.order); setCreated(data);
    } catch (caught) { setError(caught.message || "Could not place your order"); }
    finally { setBusy(false); }
  };

  if (created) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] overflow-y-auto bg-ink/60 p-4"><section className="mx-auto my-6 w-full max-w-2xl bg-paper p-6 md:p-10"><div className="flex justify-between"><div><p className="text-[10px] tracking-[.2em]">{t(language, "orderSuccessful").toUpperCase()}</p><h1 className="mt-2 font-display text-5xl">{t(language, "thankYou").toUpperCase()}</h1><p className="mt-3 text-sm">{t(language, "orderId")}: {created.order.orderNumber} / {created.order.paymentStatus.replaceAll("_", " ")}</p></div><button onClick={onClose} className="text-3xl" aria-label={t(language, "close")}>&#215;</button></div><div className="mt-7 space-y-2 border-y border-ink/20 py-5 text-sm">{created.order.items.map((item, index) => <p key={item.sku + index} className="flex justify-between gap-3"><span>{item.name} / {item.size} × {item.quantity}</span><span>{money(item.unitPrice * item.quantity)}</span></p>)}<p className="flex justify-between border-t border-ink/10 pt-3"><span>{t(language, "subtotal")}</span><span>{money(created.order.subtotal)}</span></p><p className="flex justify-between"><span>{t(language, "delivery")}</span><span>{money(created.order.shippingFee)}</span></p><p className="flex justify-between font-display text-2xl"><span>{t(language, "total").toUpperCase()}</span><span>{money(created.order.total)}</span></p></div>{created.order.paymentDetails.method === "bank_transfer" && <div className="mt-6 bg-[#eee7dc] p-4"><h2 className="font-display text-2xl">{t(language, "bankTransfer").toUpperCase()}</h2><PaymentDestination info={created.paymentInfo || paymentInfo} language={language} /><p className="mt-3 text-sm">{created.bankTransferInstructions || t(language, "slipReceived")}</p></div>}{created.order.paymentDetails.method === "cod" && <p className="mt-5 text-sm">Pay the courier when your order arrives.</p>}{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<button onClick={onClose} className="mt-7 w-full border border-ink py-3 text-xs">{t(language, "continueShopping").toUpperCase()}</button></section></motion.div>;

  const fields = [["recipient", "fullName", "text"], ["phone", "phone", "tel"], ["email", "email", "email"], ["line1", "streetAddress", "text"], ["subdistrict", "subdistrict", "text"], ["district", "district", "text"], ["province", "province", "text"], ["postalCode", "postalCode", "text"]];
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] overflow-y-auto bg-ink/60 p-4"><section className="mx-auto my-6 w-full max-w-5xl bg-paper p-6 md:p-10"><div className="flex justify-between border-b border-ink/20 pb-5"><div><p className="text-[10px] tracking-[.2em]">24 STREET / {t(language, "checkout").toUpperCase()}</p><h1 className="mt-2 font-display text-5xl">{t(language, "deliveryDetails").toUpperCase()}</h1></div><button onClick={onClose} className="text-3xl" aria-label={t(language, "close")}>&#215;</button></div><form onSubmit={submit} className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px]"><div><div className="grid gap-4 sm:grid-cols-2">{fields.map(([name, label, type]) => <label key={name} className={name === "line1" ? "text-[10px] tracking-wider sm:col-span-2" : "text-[10px] tracking-wider"}>{t(language, label).toUpperCase()}<input required name={name} type={type} value={address[name]} onChange={update} pattern={name === "phone" ? "[+0-9 ()-]{8,24}" : name === "postalCode" ? "[0-9]{5}" : undefined} maxLength={name === "postalCode" ? 5 : undefined} autoComplete={({ recipient: "name", phone: "tel", email: "email", line1: "street-address", subdistrict: "address-level3", district: "address-level2", province: "address-level1", postalCode: "postal-code" })[name]} className="mt-2 w-full border border-ink/25 bg-white/50 p-3 text-sm outline-none focus:border-ink" /></label>)}</div><fieldset className="mt-8"><legend className="text-[10px] tracking-[.2em]">{t(language, "shipping").toUpperCase()}</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{[["standard", "STANDARD", "Free over 1,500"], ["express", "EXPRESS", money(120)], ["cod", "CASH ON DELIVERY", money(80)]].map(([value, label, detail]) => <label key={value} className={`cursor-pointer border p-3 text-xs ${shippingMethod === value ? "border-ink bg-[#ece6dd]" : "border-ink/20"}`}><input type="radio" name="shippingMethod" checked={shippingMethod === value} onChange={() => { setShippingMethod(value); if (value === "cod") setPaymentMethod("cod"); else if (paymentMethod === "cod") setPaymentMethod("promptpay"); }} className="mr-2 accent-[#151515]" />{t(language, value).toUpperCase()}<span className="mt-1 block text-[10px] text-ink/60">{value === "standard" ? t(language, "freeShipping") : detail}</span></label>)}</div></fieldset><fieldset className="mt-7"><legend className="text-[10px] tracking-[.2em]">{t(language, "payment").toUpperCase()}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{(shippingMethod === "cod" ? [["cod", "CASH ON DELIVERY", "Pay the courier on delivery"]] : [["promptpay", "PROMPTPAY", "Secure QR checkout"], ["card", "CREDIT / DEBIT CARD", "Secure card checkout"], ["bank_transfer", "BANK TRANSFER", "Upload a transfer slip"]]).map(([value, label, detail]) => <label key={value} className={`cursor-pointer border p-3 text-xs ${paymentMethod === value ? "border-ink bg-[#ece6dd]" : "border-ink/20"}`}><input type="radio" name="paymentMethod" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mr-2 accent-[#151515]" />{t(language, value === "bank_transfer" ? "bank_transfer" : value).toUpperCase()}<span className="mt-1 block pl-5 text-[10px] text-ink/60">{t(language, value === "promptpay" ? "promptpayDetail" : value === "card" ? "cardDetail" : value === "bank_transfer" ? "bankDetail" : "cod")}</span></label>)}</div></fieldset>{paymentMethod === "promptpay" && <section className="mt-4 border border-ink/15 bg-[#eee7dc] p-4" aria-live="polite"><h2 className="font-display text-xl">{t(language, "promptpay").toUpperCase()} QR PAYMENT</h2><p className="mt-2 text-xs leading-5">{t(language, "promptpayHint")}</p><p className="mt-2 text-[10px] text-ink/60">{t(language, "total")}: {money(subtotal + delivery)}</p></section>}{paymentMethod === "bank_transfer" && <section className="mt-4 border border-ink/15 bg-[#eee7dc] p-4"><h2 className="font-display text-xl">{t(language, "bankTransfer").toUpperCase()}</h2><PaymentDestination info={paymentInfo} language={language} /><p className="mt-3 text-xs leading-5">{t(language, "paymentSlipPrompt")}</p><label className="mt-3 block text-[10px]">{t(language, "chooseFile").toUpperCase()}<input name="checkoutSlip" type="file" accept="image/*" onChange={event => setSlipFile(event.target.files?.[0] || null)} className="mt-2 block w-full text-xs" /></label>{slipFile && <p className="mt-2 text-xs">{t(language, "selected")}: {slipFile.name}</p>}</section>}</div><aside className="h-fit border border-ink/15 bg-white/40 p-5"><h2 className="font-display text-3xl">{t(language, "checkout").toUpperCase()}</h2><div className="mt-4 max-h-56 space-y-3 overflow-y-auto border-y border-ink/15 py-4">{items.map((item, i) => <p key={item.sku + i} className="flex justify-between gap-3 text-xs"><span>{item.name} / {item.size} x {item.quantity}</span><span>{money(item.price * item.quantity)}</span></p>)}</div><div className="mt-4 space-y-2 text-xs"><p className="flex justify-between"><span>{t(language, "subtotal")}</span><span>{money(subtotal)}</span></p><p className="flex justify-between"><span>{t(language, "delivery")}</span><span>{delivery ? money(delivery) : t(language, "free").toUpperCase()}</span></p><p className="flex justify-between border-t border-ink/20 pt-3 font-display text-2xl"><span>{t(language, "total").toUpperCase()}</span><span>{money(subtotal + delivery)}</span></p></div>{error && <p role="alert" className="mt-4 text-xs text-red-700">{error}</p>}<motion.button disabled={busy || !items.length} whileTap={busy || !items.length ? undefined : { scale: 0.97 }} className="mt-5 w-full bg-ink py-4 text-[10px] tracking-wider text-paper transition hover:bg-rust disabled:cursor-wait disabled:opacity-50">{busy ? t(language, "placingOrder").toUpperCase() : t(language, "placeOrder").toUpperCase()}</motion.button><p className="mt-3 text-[9px] leading-5 text-ink/55">{t(language, "stockConfirmed")}</p></aside></form></section></motion.div>;
}
