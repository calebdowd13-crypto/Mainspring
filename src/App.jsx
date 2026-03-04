import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const sourceStyles = {
  reddit: { bg: "#C0392B", label: "r/WatchExchange" },
  chrono24: { bg: "#1A5276", label: "Chrono24" },
};

function SourceBadge({ source }) {
  const s = sourceStyles[source] || sourceStyles.reddit;
  return (
    <span style={{ background: s.bg, color: "#FAF7F2", fontSize: "9px", fontWeight: 700, padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Georgia', serif" }}>{s.label}</span>
  );
}

function formatCurrency(n) {
  return "$" + Number(n).toLocaleString();
}

function PnL({ purchase, current }) {
  const diff = current - purchase;
  const pct = ((diff / purchase) * 100).toFixed(1);
  const positive = diff >= 0;
  return (
    <span style={{ color: positive ? "#1E6B3C" : "#922B21", fontWeight: 600, fontSize: "13px", fontFamily: "'Georgia', serif" }}>
      {positive ? "+" : ""}{formatCurrency(diff)} ({positive ? "+" : ""}{pct}%)
    </span>
  );
}

const inputStyle = { background: "#FAF7F2", border: "1px solid #C8B89A", color: "#2C1810", padding: "8px 12px", borderRadius: "2px", fontSize: "13px", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" };
const btnPrimary = { background: "#2C1810", border: "none", color: "#FAF7F2", padding: "9px 22px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Georgia', serif", borderRadius: "2px", fontWeight: 700 };
const btnSecondary = { background: "none", border: "1px solid #C8B89A", color: "#7A6652", padding: "9px 22px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Georgia', serif", borderRadius: "2px" };
const btnOutlineGold = { background: "none", border: "1px solid #8B6914", color: "#8B6914", padding: "9px 22px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Georgia', serif", borderRadius: "2px" };

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setMessage("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account, then log in.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: "#2C1810" }} />
      <div style={{ height: 1, background: "#8B6914" }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ margin: 0, fontSize: "36px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2C1810", fontStyle: "italic" }}>Mainspring</h1>
            <div style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 8 }}>Watch Portfolio & Market Intelligence</div>
          </div>
          <div style={{ background: "#FAF7F2", border: "1px solid #D4C4A8", borderRadius: 2, padding: 32 }}>
            <div style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24, fontStyle: "italic" }}>
              {mode === "login" ? "Sign in to your account" : "Create an account"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} type="email" />
              <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} type="password" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
            {error && <div style={{ color: "#922B21", fontSize: "12px", marginBottom: 12, fontStyle: "italic" }}>{error}</div>}
            {message && <div style={{ color: "#1E6B3C", fontSize: "12px", marginBottom: 12, fontStyle: "italic" }}>{message}</div>}
            <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width: "100%", marginBottom: 12, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
            <div style={{ textAlign: "center", fontSize: "11px", color: "#A8906A", fontStyle: "italic" }}>
              {mode === "login" ? "No account? " : "Already have one? "}
              <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }} style={{ color: "#8B6914", cursor: "pointer", textDecoration: "underline" }}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "#8B6914" }} />
      <div style={{ height: 4, background: "#2C1810" }} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("portfolio");
  const [portfolio, setPortfolio] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [realListings, setRealListings] = useState([]);
  const [showAddWatch, setShowAddWatch] = useState(false);
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [newWatch, setNewWatch] = useState({ brand: "", model: "", ref: "", year: "", purchase_price: "", current_price: "", condition: "Excellent", papers: false });
  const [newWish, setNewWish] = useState({ brand: "", model: "", ref: "", max_price: "", alerts: true });
  const [listingFilter, setListingFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPortfolio();
      fetchWishlist();
      fetchRealListings();
    }
  }, [session]);

  async function fetchPortfolio() {
    const { data } = await supabase.from("portfolio").select("*").order("created_at", { ascending: true });
    if (data) setPortfolio(data);
  }

  async function fetchWishlist() {
    const { data } = await supabase.from("wishlist").select("*").order("created_at", { ascending: true });
    if (data) setWishlist(data);
  }

  async function fetchRealListings() {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(50);
    if (data) setRealListings(data);
  }

  async function addWatch() {
    if (!newWatch.brand || !newWatch.model) return;
    const { error } = await supabase.from("portfolio").insert([{ ...newWatch, user_id: session.user.id, purchase_price: Number(newWatch.purchase_price), current_price: Number(newWatch.current_price), year: Number(newWatch.year) }]);
    if (!error) { fetchPortfolio(); setNewWatch({ brand: "", model: "", ref: "", year: "", purchase_price: "", current_price: "", condition: "Excellent", papers: false }); setShowAddWatch(false); }
  }

  async function addWishlist() {
    if (!newWish.brand || !newWish.model) return;
    const { error } = await supabase.from("wishlist").insert([{ ...newWish, user_id: session.user.id, max_price: Number(newWish.max_price) }]);
    if (!error) { fetchWishlist(); setNewWish({ brand: "", model: "", ref: "", max_price: "", alerts: true }); setShowAddWishlist(false); }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const totalPurchase = portfolio.reduce((s, w) => s + Number(w.purchase_price), 0);
  const totalCurrent = portfolio.reduce((s, w) => s + Number(w.current_price), 0);
  const totalGain = totalCurrent - totalPurchase;
  const totalGainPct = totalPurchase > 0 ? ((totalGain / totalPurchase) * 100).toFixed(1) : "0.0";
  const allListings = realListings.length > 0 ? realListings : [];
  const filteredListings = listingFilter === "all" ? allListings : allListings.filter(l => l.source === listingFilter);
  const matchedListings = allListings.filter(l => wishlist.some(w => l.title.toLowerCase().includes(w.model.toLowerCase())));

  const tabs = [
    { id: "portfolio", label: "Portfolio" },
    { id: "wishlist", label: "Wishlist" },
    { id: "listings", label: "Live Listings" },
    { id: "alerts", label: `Alerts${matchedListings.length > 0 ? ` (${matchedListings.length})` : ""}` },
  ];

  if (loading) return <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", color: "#A8906A", fontStyle: "italic" }}>Loading…</div>;
  if (!session) return <AuthScreen />;

  return (<div style={{ minHeight: "100vh", width: "100vw", background: "#F5F0E8", color: "#2C1810", fontFamily: "'Georgia', 'Times New Roman', serif", overflowX: "hidden" }}>
      <div style={{ height: 4, background: "#2C1810" }} />
      <div style={{ height: 1, background: "#8B6914" }} />

\<div style={{ background: "#FAF7F2", borderBottom: "1px solid #D4C4A8" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", width: "100%", boxSizing: "border-box", padding: "28px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2C1810", fontStyle: "italic" }}>Mainspring</h1>
              <span style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.25em", textTransform: "uppercase", borderLeft: "1px solid #C8B89A", paddingLeft: 14 }}>Watch Portfolio & Market Intelligence</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: "11px", color: "#A8906A", fontStyle: "italic" }}>{session.user.email}</span>
              <button onClick={signOut} style={{ ...btnSecondary, padding: "5px 14px", fontSize: "9px" }}>Sign Out</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "#F5F0E8" : "none", border: "1px solid " + (tab === t.id ? "#D4C4A8" : "transparent"), borderBottom: tab === t.id ? "1px solid #F5F0E8" : "1px solid transparent", color: tab === t.id ? "#2C1810" : "#A8906A", padding: "10px 22px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Georgia', serif", marginBottom: "-1px", position: "relative" }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px", width: "100%", boxSizing: "border-box" }}>

        {tab === "portfolio" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginBottom: 32, border: "1px solid #D4C4A8", borderRadius: 2, overflow: "hidden" }}>
              {[
                { label: "Portfolio Value", value: formatCurrency(totalCurrent) },
                { label: "Total Cost Basis", value: formatCurrency(totalPurchase) },
                { label: "Total Return", value: `${totalGain >= 0 ? "+" : ""}${formatCurrency(totalGain)} (${totalGain >= 0 ? "+" : ""}${totalGainPct}%)`, color: totalGain >= 0 ? "#1E6B3C" : "#922B21" },
              ].map((card, i) => (
                <div key={card.label} style={{ background: "#FAF7F2", padding: "20px 24px", borderRight: i < 2 ? "1px solid #D4C4A8" : "none" }}>
                  <div style={{ fontSize: "9px", color: "#A8906A", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontStyle: "italic" }}>{card.label}</div>
                  <div style={{ fontSize: "24px", color: card.color || "#2C1810", fontWeight: 400, fontStyle: "italic" }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 160px", gap: 16, padding: "8px 20px", borderBottom: "1px solid #2C1810", marginBottom: 2 }}>
              {["Reference", "Paid", "Market Value", "Return"].map(h => (
                <div key={h} style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.2em", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>

            {portfolio.length === 0 && <div style={{ color: "#A8906A", fontStyle: "italic", fontSize: "14px", padding: "40px 20px" }}>No watches yet. Add your first piece below.</div>}

            {portfolio.map((watch, i) => (
              <div key={watch.id} style={{ background: i % 2 === 0 ? "#FAF7F2" : "#F5F0E8", borderBottom: "1px solid #E8DFD0", padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 120px 120px 160px", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#2C1810", marginBottom: 3 }}>{watch.brand} {watch.model}</div>
                  <div style={{ fontSize: "10px", color: "#A8906A", letterSpacing: "0.06em", fontStyle: "italic" }}>Ref. {watch.ref} · {watch.year} · {watch.condition}{watch.papers ? " · Full Set" : ""}</div>
                </div>
                <div style={{ fontSize: "14px", color: "#5A4A3A" }}>{formatCurrency(watch.purchase_price)}</div>
                <div style={{ fontSize: "14px", color: "#2C1810" }}>{formatCurrency(watch.current_price)}</div>
                <PnL purchase={Number(watch.purchase_price)} current={Number(watch.current_price)} />
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <button onClick={() => setShowAddWatch(!showAddWatch)} style={btnOutlineGold}>+ Add Watch</button>
            </div>

            {showAddWatch && (
              <div style={{ marginTop: 20, background: "#FAF7F2", border: "1px solid #D4C4A8", borderRadius: 2, padding: 24 }}>
                <div style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic" }}>Add Watch to Portfolio</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[["brand", "Brand"], ["model", "Model"], ["ref", "Reference No."], ["year", "Year"], ["purchase_price", "Purchase Price"], ["current_price", "Current Value"]].map(([field, label]) => (
                    <input key={field} placeholder={label} value={newWatch[field]} onChange={e => setNewWatch({ ...newWatch, [field]: e.target.value })} style={inputStyle} />
                  ))}
                </div>
                <label style={{ fontSize: "12px", color: "#7A6652", display: "flex", gap: 8, alignItems: "center", cursor: "pointer", marginBottom: 16, fontStyle: "italic" }}>
                  <input type="checkbox" checked={newWatch.papers} onChange={e => setNewWatch({ ...newWatch, papers: e.target.checked })} />
                  Includes original box & papers
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addWatch} style={btnPrimary}>Add to Portfolio</button>
                  <button onClick={() => setShowAddWatch(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "wishlist" && (
          <div>
            <p style={{ color: "#7A6652", fontSize: "13px", marginTop: 0, marginBottom: 24, fontStyle: "italic", borderBottom: "1px solid #D4C4A8", paddingBottom: 16 }}>
              Add the references you're hunting. Mainspring monitors Reddit WatchExchange continuously and alerts you the moment a match appears.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 16, padding: "8px 20px", borderTop: "1px solid #2C1810", borderBottom: "1px solid #D4C4A8", marginBottom: 2 }}>
              {["Reference", "Max Budget", "Live Matches"].map(h => (
                <div key={h} style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.2em", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>

            {wishlist.length === 0 && <div style={{ color: "#A8906A", fontStyle: "italic", fontSize: "14px", padding: "40px 20px" }}>No watches on your wishlist yet.</div>}

            {wishlist.map((item, i) => {
              const matches = allListings.filter(l => l.title.toLowerCase().includes(item.model.toLowerCase()));
              return (
                <div key={item.id} style={{ background: i % 2 === 0 ? "#FAF7F2" : "#F5F0E8", borderBottom: "1px solid #E8DFD0", padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 16, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "#2C1810", marginBottom: 3 }}>{item.brand} {item.model}</div>
                    <div style={{ fontSize: "10px", color: "#A8906A", fontStyle: "italic" }}>Ref. {item.ref}</div>
                  </div>
                  <div style={{ fontSize: "14px", color: "#5A4A3A" }}>{formatCurrency(item.max_price)}</div>
                  <div style={{ fontSize: "14px", color: matches.length > 0 ? "#1E6B3C" : "#A8906A", fontStyle: matches.length > 0 ? "normal" : "italic" }}>
                    {matches.length > 0 ? `${matches.length} listing${matches.length !== 1 ? "s" : ""} found` : "Monitoring…"}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 20 }}>
              <button onClick={() => setShowAddWishlist(!showAddWishlist)} style={btnOutlineGold}>+ Add to Wishlist</button>
            </div>

            {showAddWishlist && (
              <div style={{ marginTop: 20, background: "#FAF7F2", border: "1px solid #D4C4A8", borderRadius: 2, padding: 24 }}>
                <div style={{ fontSize: "9px", color: "#8B6914", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic" }}>Add Watch to Wishlist</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["brand", "Brand"], ["model", "Model"], ["ref", "Reference No."], ["max_price", "Max Budget"]].map(([field, label]) => (
                    <input key={field} placeholder={label} value={newWish[field]} onChange={e => setNewWish({ ...newWish, [field]: e.target.value })} style={inputStyle} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addWishlist} style={btnPrimary}>Add to Wishlist</button>
                  <button onClick={() => setShowAddWishlist(false)} style={btnSecondary}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "listings" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[["all", "All Sources"], ["reddit", "r/WatchExchange"]].map(([val, label]) => (
                <button key={val} onClick={() => setListingFilter(val)} style={{ background: listingFilter === val ? "#2C1810" : "none", border: "1px solid " + (listingFilter === val ? "#2C1810" : "#C8B89A"), color: listingFilter === val ? "#FAF7F2" : "#7A6652", padding: "7px 18px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Georgia', serif", borderRadius: "2px" }}>{label}</button>
              ))}
            </div>
            {filteredListings.length === 0 && (
              <div style={{ color: "#A8906A", fontStyle: "italic", fontSize: "14px", padding: "40px 20px" }}>No listings yet.</div>
            )}
            <div style={{ borderTop: filteredListings.length > 0 ? "1px solid #2C1810" : "none" }}>
              {filteredListings.map((listing, i) => (
                <div key={listing.id} style={{ background: i % 2 === 0 ? "#FAF7F2" : "#F5F0E8", borderBottom: "1px solid #E8DFD0", padding: "14px 20px", display: "grid", gridTemplateColumns: "auto 1fr 120px 80px", gap: 16, alignItems: "center" }}>
                  <SourceBadge source={listing.source} />
                  <div>
                    <div style={{ fontSize: "14px", color: "#2C1810", marginBottom: 3 }}>{listing.title}</div>
                    <div style={{ fontSize: "10px", color: "#A8906A", fontStyle: "italic" }}>u/{listing.seller} · {new Date(listing.posted_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: "15px", color: "#2C1810", fontStyle: "italic" }}>
                    {listing.price ? formatCurrency(listing.price) : "See listing"}
                  </div>
                  <a href={listing.url} target="_blank" rel="noopener noreferrer" style={{ background: "none", border: "1px solid #C8B89A", color: "#7A6652", padding: "5px 12px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px", fontFamily: "'Georgia', serif", textAlign: "center" }}>View →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div>
            <p style={{ color: "#7A6652", fontSize: "13px", marginTop: 0, marginBottom: 24, fontStyle: "italic", borderBottom: "1px solid #D4C4A8", paddingBottom: 16 }}>
              Live listings matching your wishlist. Pieces highlighted in green are within your stated budget.
            </p>
            {matchedListings.length === 0 ? (
              <div style={{ color: "#A8906A", fontSize: "14px", padding: "60px 0", textAlign: "center", fontStyle: "italic" }}>No matches yet. Add watches to your wishlist to begin monitoring.</div>
            ) : (
              <div style={{ borderTop: "1px solid #2C1810" }}>
                {matchedListings.map((listing, i) => {
                  const wishItem = wishlist.find(w => listing.title.toLowerCase().includes(w.model.toLowerCase()));
                  const underBudget = wishItem && listing.price && listing.price <= wishItem.max_price;
                  return (
                    <div key={listing.id} style={{ background: underBudget ? "#EEF7F0" : (i % 2 === 0 ? "#FAF7F2" : "#F5F0E8"), borderBottom: "1px solid #E8DFD0", borderLeft: underBudget ? "3px solid #1E6B3C" : "3px solid transparent", padding: "14px 20px", display: "grid", gridTemplateColumns: "auto 1fr 140px 100px", gap: 16, alignItems: "center" }}>
                      <SourceBadge source={listing.source} />
                      <div>
                        <div style={{ fontSize: "14px", color: "#2C1810", marginBottom: 3 }}>{listing.title}</div>
                        <div style={{ fontSize: "10px", color: "#A8906A", fontStyle: "italic" }}>
                          u/{listing.seller} · {new Date(listing.posted_at).toLocaleDateString()}
                          {wishItem && listing.price && (
                            <span style={{ color: underBudget ? "#1E6B3C" : "#922B21", marginLeft: 10 }}>
                              {underBudget ? `✓ Within budget (max ${formatCurrency(wishItem.max_price)})` : `✗ Over budget (max ${formatCurrency(wishItem.max_price)})`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: "15px", color: underBudget ? "#1E6B3C" : "#2C1810", fontStyle: "italic", fontWeight: underBudget ? 600 : 400 }}>
                        {listing.price ? formatCurrency(listing.price) : "See listing"}
                      </div>
                      <a href={listing.url} target="_blank" rel="noopener noreferrer" style={{ background: underBudget ? "#1E6B3C" : "none", border: "1px solid " + (underBudget ? "#1E6B3C" : "#C8B89A"), color: underBudget ? "#FAF7F2" : "#7A6652", padding: "6px 14px", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", borderRadius: "2px", fontFamily: "'Georgia', serif", textAlign: "center", fontWeight: underBudget ? 700 : 400 }}>View →</a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #D4C4A8", marginTop: 40, padding: "20px 5%", background: "#FAF7F2" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", width: "100%", boxSizing: "border-box", textAlign: "center" }}>
          <div style={{ height: 1, background: "#8B6914", marginBottom: 16 }} />
          <div style={{ fontSize: "9px", color: "#A8906A", letterSpacing: "0.2em", textTransform: "uppercase", fontStyle: "italic" }}>Mainspring · Live data from r/WatchExchange · Prices indicative only</div>
        </div>
      </div>
      <div style={{ height: 1, background: "#8B6914" }} />
      <div style={{ height: 4, background: "#2C1810" }} />
    </div>
  );
}