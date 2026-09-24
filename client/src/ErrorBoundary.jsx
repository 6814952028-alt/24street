import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-paper p-6 text-ink"><section className="max-w-lg border-2 border-ink bg-paper p-8"><p className="text-[10px] tracking-[.2em]">24 STREET</p><h1 className="mt-3 font-display text-5xl">ADMIN PAGE ERROR</h1><p className="mt-5 text-sm leading-6">The page could not render. The error detail below helps identify the exact issue.</p><pre className="mt-4 overflow-auto border border-ink bg-white p-3 text-xs whitespace-pre-wrap">{this.state.error?.message || "Unknown render error"}</pre><button className="mt-6 bg-ink px-5 py-3 text-xs text-paper" onClick={() => { localStorage.removeItem("24street_user"); localStorage.removeItem("24street_token"); localStorage.removeItem("24street_bag"); window.location.reload(); }}>RESET & RELOAD</button></section></main>;
  }
}
