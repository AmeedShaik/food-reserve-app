/*
FoodReserveApp.jsx
A single-file React component (default export) for a home-food reservation app prototype.
*/
import React, { useEffect, useState } from "react";
import { ShoppingCart, Calendar, Clock, XCircle, CheckCircle } from "lucide-react";
import { format, addDays } from "date-fns";

const SAMPLE_MENU = [
  { id: "m1", name: "Hyderabadi Biryani (Chicken)", price: 220, desc: "Fragrant basmati, spices, tender chicken" },
  { id: "m2", name: "Paneer Butter Masala", price: 160, desc: "Creamy tomato curry with paneer cubes" },
  { id: "m3", name: "Street-style Dosa", price: 90, desc: "Crispy dosa with coconut chutney" },
  { id: "m4", name: "Gulab Jamun (2pc)", price: 60, desc: "Warm syrupy dessert" },
];

const STORAGE_KEY = "food_reservations_v1";

export default function FoodReserveApp() {
  const [menu] = useState(SAMPLE_MENU);
  const [cart, setCart] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState("pickup"); // pickup or delivery
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState("12:30");
  const [notes, setNotes] = useState("");
  const [reservations, setReservations] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setReservations(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  function addToCart(item) {
    setCart(prev => {
      const qty = (prev[item.id]?.qty || 0) + 1;
      return { ...prev, [item.id]: { ...item, qty } };
    });
  }

  function updateQty(id, qty) {
    setCart(prev => {
      if (qty <= 0) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: { ...prev[id], qty } };
    });
  }

  function cartTotal() {
    return Object.values(cart).reduce((s, it) => s + it.qty * it.price, 0);
  }

  function validateReservation() {
    setError("");
    if (!name.trim()) return "Please enter your name.";
    if (!/^\d{10}$/.test(phone)) return "Please enter a valid 10-digit phone number.";
    if (Object.keys(cart).length === 0) return "Cart is empty. Add items to reserve.";
    const selected = new Date(date + "T" + time);
    if (isNaN(selected.getTime())) return "Please pick a valid date and time.";
    if (selected.getTime() < Date.now() - 1000 * 60) return "Please pick a future time.";
    return null;
  }

  function handleReserve() {
    const v = validateReservation();
    if (v) return setError(v);
    setShowConfirm(true);
  }

  function confirmReserve() {
    const id = "res_" + Date.now();
    const items = Object.values(cart).map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price }));
    const payload = {
      id,
      name,
      phone,
      mode,
      date,
      time,
      notes,
      items,
      total: cartTotal(),
      createdAt: new Date().toISOString(),
      status: "reserved",
    };
    setReservations(prev => [payload, ...prev]);
    setCart({});
    setName("");
    setPhone("");
    setNotes("");
    setShowConfirm(false);
    setError("");
    alert("Reservation saved! Check 'My Reservations' below.");
  }

  function cancelReservation(id) {
    if (!confirm("Cancel this reservation?")) return;
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
  }

  const soonDates = [0,1,2,3,4].map(d => format(addDays(new Date(), d), 'yyyy-MM-dd'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white p-6 text-slate-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Left: Menu */}
        <div className="md:col-span-2">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold flex items-center gap-3">HomeFood Reserve <ShoppingCart size={22} /></h1>
            <div className="bg-white p-2 rounded-lg shadow">
              <div className="text-xs text-slate-500">Cart</div>
              <div className="font-semibold">{Object.values(cart).reduce((s, it) => s+it.qty, 0)} items</div>
              <div className="text-sm">₹{cartTotal()}</div>
            </div>
          </header>

          <section className="grid sm:grid-cols-2 gap-4">
            {menu.map(item => (
              <article key={item.id} className="bg-white p-4 rounded-2xl shadow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">₹{item.price}</div>
                    <div className="text-xs text-slate-400">Ready in 20-45 mins</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="px-3 py-1 bg-slate-100 rounded-md" onClick={() => updateQty(item.id, Math.max(0, (cart[item.id]?.qty||0)-1))}>-</button>
                    <div className="w-10 text-center">{cart[item.id]?.qty || 0}</div>
                    <button className="px-3 py-1 bg-emerald-500 text-white rounded-md" onClick={() => addToCart(item)}>Add</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Cart editor */}
          <div className="mt-6 bg-white p-4 rounded-2xl shadow">
            <h2 className="font-bold">Cart</h2>
            {Object.values(cart).length === 0 ? <div className="text-sm text-slate-500 py-4">Your cart is empty — add items from the menu.</div> : (
              <div className="space-y-3">
                {Object.values(cart).map(it => (
                  <div key={it.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-xs text-slate-400">₹{it.price} x {it.qty} = ₹{it.price*it.qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} value={it.qty} onChange={e => updateQty(it.id, Number(e.target.value))} className="w-20 p-1 border rounded" />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="font-bold">₹{cartTotal()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Reservation form */}
          <div className="mt-6 bg-white p-4 rounded-2xl shadow">
            <h2 className="font-bold">Reservation</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} className="p-2 border rounded" />
              <input placeholder="Phone (10 digits)" value={phone} onChange={e=>setPhone(e.target.value)} className="p-2 border rounded" />
              <select value={mode} onChange={e=>setMode(e.target.value)} className="p-2 border rounded">
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 flex items-center gap-2"><Calendar size={16}/> Date</label>
                  <select value={date} onChange={e=>setDate(e.target.value)} className="p-2 border rounded w-full">
                    {soonDates.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 flex items-center gap-2"><Clock size={16}/> Time</label>
                  <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="p-2 border rounded w-full" />
                </div>
              </div>

              <textarea placeholder="Notes (e.g. no onion)" value={notes} onChange={e=>setNotes(e.target.value)} className="p-2 border rounded sm:col-span-2" />
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <div className="mt-4 flex gap-3">
              <button onClick={handleReserve} className="px-4 py-2 bg-amber-500 text-white rounded">Reserve Now</button>
              <button onClick={()=>{setCart({}); setError("")}} className="px-4 py-2 bg-slate-100 rounded">Clear Cart</button>
            </div>

          </div>

        </div>

        {/* Right: Reservations list */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h3 className="font-bold">My Reservations</h3>
            <div className="mt-3 space-y-2">
              {reservations.length === 0 ? <div className="text-sm text-slate-500">No reservations yet.</div> : reservations.map(r => (
                <div key={r.id} className={`p-3 rounded-lg border ${r.status==='cancelled' ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{r.name} • {r.mode}</div>
                      <div className="text-xs text-slate-500">{r.date} @ {r.time} • ₹{r.total}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${r.status==='cancelled' ? 'text-red-500' : 'text-emerald-600'}`}>{r.status}</div>
                      <div className="mt-2 flex gap-2">
                        {r.status !== 'cancelled' && <button onClick={()=>cancelReservation(r.id)} className="px-2 py-1 bg-red-100 text-red-600 rounded">Cancel</button>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {r.items.map(it => <div key={it.id}>{it.qty} x {it.name}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow">
            <h4 className="font-semibold">Quick Tips</h4>
            <ul className="mt-2 text-sm text-slate-600 list-inside list-disc">
              <li>Set pickup time 30 mins after ordering for freshness.</li>
              <li>Update phone number for SMS confirmations (backend required).</li>
              <li>Add online payment to collect partial prepayment.</li>
            </ul>
          </div>

        </aside>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">Confirm Reservation</h3>
              <button onClick={()=>setShowConfirm(false)} className="text-slate-400"><XCircle /></button>
            </div>
            <div className="mt-3">
              <div><strong>Name:</strong> {name}</div>
              <div><strong>Phone:</strong> {phone}</div>
              <div><strong>Mode:</strong> {mode}</div>
              <div><strong>When:</strong> {date} @ {time}</div>
              <div className="mt-2"><strong>Items:</strong></div>
              <div className="mt-1 space-y-1 text-sm text-slate-600">{Object.values(cart).map(it => <div key={it.id}>{it.qty} x {it.name} — ₹{it.qty*it.price}</div>)}</div>
              <div className="mt-3 font-bold">Total: ₹{cartTotal()}</div>
              <div className="mt-4 flex gap-3">
                <button onClick={confirmReserve} className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2"><CheckCircle /> Confirm</button>
                <button onClick={()=>setShowConfirm(false)} className="px-4 py-2 bg-slate-100 rounded">Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
