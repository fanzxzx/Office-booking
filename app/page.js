"use client";
import React, { useState, useEffect, useCallback } from "react";

const ROOMS = [
  { id: "room-a", name: "Onema Room", index: "01" },
  { id: "room-b", name: "Sterra Space", index: "02" },
];
const OFFICE_START = 8;
const OFFICE_END = 19;

/* ---------- design tokens ---------- */
const C = {
  ink: "#23262B",
  inkSoft: "#5B5E63",
  inkFaint: "#8B8A82",
  paper: "#EDEAE2",
  card: "#F7F5EF",
  line: "#D9D4C6",
  lineStrong: "#C3BCA8",
  amber: "#C2703D",
  amberTint: "#F1E0D2",
  amberDark: "#7A4220",
  teal: "#2F6F62",
  tealTint: "#DEEAE6",
  brick: "#A6453B",
};
const serif = "'Fraunces', Georgia, serif";

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
};
const minsFromHHMM = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/* ---------- shared bits ---------- */
function Eyebrow({ children }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFaint, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, letterSpacing: "0.03em", color: C.inkSoft, marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 14,
  background: "#fff",
  color: C.ink,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: C.ink, color: "#F7F5EF", border: "none", borderRadius: 8,
        padding: "10px 16px", fontSize: 14, fontWeight: 500, cursor: props.disabled ? "default" : "pointer",
        opacity: props.disabled ? 0.4 : 1, width: "100%", fontFamily: "inherit",
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, tone, ...props }) {
  const color = tone === "danger" ? C.brick : C.ink;
  return (
    <button
      {...props}
      style={{
        background: "transparent", color, border: `1px solid ${tone === "danger" ? "#D8BDB9" : C.lineStrong}`,
        borderRadius: 7, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        ...(props.style || {}),
      }}
    >
      {children}
    </button>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(35,38,43,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 18, width: "100%", maxWidth: 430, padding: "1.5rem 1.6rem", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            {subtitle && <Eyebrow>{subtitle}</Eyebrow>}
            <h3 style={{ margin: "2px 0 0", fontSize: 21, fontFamily: serif, fontWeight: 600, color: C.ink }}>{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", fontSize: 22, color: C.inkFaint, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- calendar ---------- */
function MonthCalendar({ date, setDate, monthCounts }) {
  const selected = new Date(date + "T00:00:00");
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isoFor(d) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  }
  function changeMonth(delta) {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "1.1rem 1.3rem", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => changeMonth(-1)} aria-label="Previous month" style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: C.inkSoft, padding: "0 6px" }}>‹</button>
        <strong style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink }}>{monthLabel}</strong>
        <button onClick={() => changeMonth(1)} aria-label="Next month" style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer", color: C.inkSoft, padding: "0 6px" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 10.5, letterSpacing: "0.06em", color: C.inkFaint, marginBottom: 6 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = isoFor(d);
          const isSelected = iso === date;
          const isToday = iso === todayISO();
          const count = monthCounts[iso] || 0;
          return (
            <button
              key={i}
              onClick={() => setDate(iso)}
              style={{
                aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderRadius: 9, fontSize: 13.5, padding: 0, fontFamily: serif, cursor: "pointer",
                background: isSelected ? C.ink : isToday ? C.amberTint : "transparent",
                color: isSelected ? "#F7F5EF" : C.ink,
                border: isToday && !isSelected ? `1px solid ${C.amber}` : "1px solid transparent",
              }}
            >
              {d}
              <span style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 2, background: count > 0 ? (isSelected ? "#F7F5EF" : C.amber) : "transparent" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- rooms tab ---------- */
function RoomsTab() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState([]);
  const [monthCounts, setMonthCounts] = useState({});
  const [modalRoom, setModalRoom] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", purpose: "", start: "09:00", end: "09:30" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/bookings?date=${date}`);
    setBookings(await res.json());
  }, [date]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/bookings`);
      const all = await res.json();
      const counts = {};
      all.forEach((b) => { counts[b.date] = (counts[b.date] || 0) + 1; });
      setMonthCounts(counts);
    })();
  }, [bookings]);

  const dayBookings = (roomId) => bookings.filter((b) => b.room_id === roomId).sort((a, b) => a.start_min - b.start_min);

  async function submit(e) {
    e.preventDefault();
    const start = minsFromHHMM(form.start);
    const end = minsFromHHMM(form.end);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: modalRoom, date, start, end, ...form }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setModalRoom(null);
    setError("");
    load();
  }

  async function cancelBooking(id) {
    await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <MonthCalendar date={date} setDate={setDate} monthCounts={monthCounts} />
      <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 16px" }}>
        Showing <strong style={{ color: C.ink }}>{new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</strong>
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {ROOMS.map((room) => {
          const dayB = dayBookings(room.id);
          return (
            <div key={room.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "1.2rem 1.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ fontFamily: serif, fontSize: 13, color: C.amber, fontWeight: 600 }}>{room.index}</span>
                  <h3 style={{ margin: 0, fontFamily: serif, fontSize: 20, fontWeight: 600, color: C.ink }}>{room.name}</h3>
                </div>
                <GhostButton onClick={() => { setForm({ name: "", email: "", purpose: "", start: "09:00", end: "09:30" }); setError(""); setModalRoom(room.id); }}>
                  Book this room
                </GhostButton>
              </div>

              {dayB.length === 0 ? (
                <p style={{ fontSize: 13, color: C.inkFaint, margin: 0 }}>No bookings yet for this day.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                  {dayB.map((b) => (
                    <li key={b.id} style={{ fontSize: 13.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
                      <span>
                        <span style={{ background: C.tealTint, color: C.teal, borderRadius: 5, padding: "2px 7px", fontSize: 12, fontWeight: 500, marginRight: 8 }}>
                          {fmtTime(b.start_min)}–{fmtTime(b.end_min)}
                        </span>
                        {b.name} — {b.purpose}
                      </span>
                      <button onClick={() => cancelBooking(b.id)} style={{ fontSize: 12, color: C.brick, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {modalRoom && (
        <Modal
          subtitle={new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          title={`Book ${ROOMS.find((r) => r.id === modalRoom).name}`}
          onClose={() => setModalRoom(null)}
        >
          <form onSubmit={submit}>
            <Field label="Your name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
            <Field label="Meeting purpose / title"><input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={inputStyle} /></Field>
            <Field label="Email address"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></Field>
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Start"><input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} style={inputStyle} /></Field>
              <Field label="End"><input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} style={inputStyle} /></Field>
            </div>
            {error && <p style={{ color: C.brick, fontSize: 13 }}>{error}</p>}
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit">Confirm booking</PrimaryButton></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- equipment tab ---------- */
function EquipmentTab() {
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", purpose: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [i, b] = await Promise.all([
      fetch("/api/equipment").then((r) => r.json()),
      fetch(`/api/equipment-bookings?date=${date}`).then((r) => r.json()),
    ]);
    setItems(i);
    setBookings(b);
  }, [date]);
  useEffect(() => { load(); }, [load]);

  const bookingsFor = (id) => bookings.filter((b) => b.item_id === id);

  async function submitBooking(e) {
    e.preventDefault();
    const res = await fetch("/api/equipment-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: modalItem, date, ...form }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setModalItem(null);
    setError("");
    load();
  }

  async function cancelBooking(id) {
    await fetch(`/api/equipment-bookings?id=${id}`, { method: "DELETE" });
    load();
  }

  async function addItem(e) {
    e.preventDefault();
    await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, qty: newQty }),
    });
    setNewName(""); setNewQty(1); setAdding(false);
    load();
  }

  async function removeItem(id) {
    await fetch(`/api/equipment?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></Field>
        <GhostButton onClick={() => setAdding(true)}>+ Add item</GhostButton>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
        {items.map((item) => {
          const bks = bookingsFor(item.id);
          const avail = item.qty - bks.length;
          return (
            <div key={item.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "1.1rem 1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontWeight: 600, margin: 0, fontFamily: serif, fontSize: 16.5, color: C.ink }}>{item.name}</p>
                <button onClick={() => removeItem(item.id)} style={{ fontSize: 11.5, color: C.brick, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
              <p style={{ fontSize: 12.5, color: C.inkSoft, margin: "4px 0 12px" }}>
                <span style={{ color: avail > 0 ? C.teal : C.brick, fontWeight: 500 }}>{avail}</span> of {item.qty} available
              </p>
              <PrimaryButton disabled={avail <= 0} onClick={() => { setForm({ name: "", email: "", purpose: "" }); setError(""); setModalItem(item.id); }}>
                {avail <= 0 ? "Fully booked" : "Book"}
              </PrimaryButton>
              {bks.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, marginTop: 10, display: "grid", gap: 6 }}>
                  {bks.map((b) => (
                    <li key={b.id} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
                      <span>{b.name} — {b.purpose}</span>
                      <button onClick={() => cancelBooking(b.id)} style={{ fontSize: 11, color: C.brick, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {items.length === 0 && <p style={{ color: C.inkFaint }}>No inventory yet. Add a clicker, mic or speaker to get started.</p>}

      {adding && (
        <Modal title="Add inventory item" onClose={() => setAdding(false)}>
          <form onSubmit={addItem}>
            <Field label="Item name"><input value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} /></Field>
            <Field label="Quantity"><input type="number" min={1} value={newQty} onChange={(e) => setNewQty(e.target.value)} style={{ ...inputStyle, width: 100 }} /></Field>
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit">Add item</PrimaryButton></div>
          </form>
        </Modal>
      )}

      {modalItem && (
        <Modal title={`Book ${items.find((i) => i.id === modalItem)?.name}`} onClose={() => setModalItem(null)}>
          <form onSubmit={submitBooking}>
            <Field label="Your name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
            <Field label="Purpose"><input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={inputStyle} /></Field>
            <Field label="Email address"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></Field>
            {error && <p style={{ color: C.brick, fontSize: 13 }}>{error}</p>}
            <div style={{ marginTop: 6 }}><PrimaryButton type="submit">Confirm booking</PrimaryButton></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- root page ---------- */
export default function Page() {
  const [tab, setTab] = useState("rooms");
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.25rem 4rem" }}>
      <Eyebrow>HSO Block 10</Eyebrow>
      <h1 style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, margin: "4px 0 6px", color: C.ink, lineHeight: 1.15 }}>
        Office Meeting Room and Inventory Booking
      </h1>
      <p style={{ color: C.inkSoft, margin: "0 0 22px", fontSize: 14 }}>
        Office hours {fmtTime(OFFICE_START * 60)}–{fmtTime(OFFICE_END * 60)}. No double-bookings, ever.
      </p>

      <div style={{ display: "inline-flex", gap: 4, marginBottom: 22, background: "#E2DECF", borderRadius: 11, padding: 4 }}>
        {[["rooms", "Meeting rooms"], ["equipment", "Equipment"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
              background: tab === key ? C.ink : "transparent",
              color: tab === key ? "#F7F5EF" : C.inkSoft,
              fontWeight: tab === key ? 500 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "rooms" ? <RoomsTab /> : <EquipmentTab />}
    </div>
  );
}
