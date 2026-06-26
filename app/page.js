"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

const ROOMS = [
  { id: "room-a", name: "Onema Room" },
  { id: "room-b", name: "Sterra Space" },
];
const OFFICE_START = 8;
const OFFICE_END = 19;

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

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 13, color: "#6b6a64", marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, padding: "1.25rem 1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 19 }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RoomsTab() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState([]);
  const [modalRoom, setModalRoom] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", purpose: "", start: "09:00", end: "09:30" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/bookings?date=${date}`);
    setBookings(await res.json());
  }, [date]);
  useEffect(() => { load(); }, [load]);

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
      <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <div style={{ display: "grid", gap: 16 }}>
        {ROOMS.map((room) => {
          const dayB = dayBookings(room.id);
          return (
            <div key={room.id} style={{ background: "#fff", border: "1px solid #e5e2d9", borderRadius: 12, padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ margin: 0 }}>{room.name}</h3>
                <button onClick={() => { setForm({ name: "", email: "", purpose: "", start: "09:00", end: "09:30" }); setError(""); setModalRoom(room.id); }}>Book this room</button>
              </div>
              {dayB.length === 0 ? (
                <p style={{ fontSize: 13, color: "#999" }}>No bookings yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 6 }}>
                  {dayB.map((b) => (
                    <li key={b.id} style={{ fontSize: 13, display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 6 }}>
                      <span><b>{fmtTime(b.start_min)}–{fmtTime(b.end_min)}</b> · {b.name} — {b.purpose}</span>
                      <button onClick={() => cancelBooking(b.id)} style={{ fontSize: 12 }}>Cancel</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {modalRoom && (
        <Modal title={`Book ${ROOMS.find((r) => r.id === modalRoom).name}`} onClose={() => setModalRoom(null)}>
          <form onSubmit={submit}>
            <Field label="Your name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%" }} /></Field>
            <Field label="Meeting purpose / title"><input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={{ width: "100%" }} /></Field>
            <Field label="Email address"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%" }} /></Field>
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Start"><input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
              <Field label="End"><input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
            </div>
            {error && <p style={{ color: "#b23a34", fontSize: 13 }}>{error}</p>}
            <button type="submit" style={{ width: "100%" }}>Confirm booking</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <button onClick={() => setAdding(true)}>+ Add item</button>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {items.map((item) => {
          const bks = bookingsFor(item.id);
          const avail = item.qty - bks.length;
          return (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #e5e2d9", borderRadius: 12, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontWeight: 500, margin: 0 }}>{item.name}</p>
                <button onClick={() => removeItem(item.id)} style={{ fontSize: 12, color: "#b23a34" }}>Remove</button>
              </div>
              <p style={{ fontSize: 13, color: "#777" }}>{avail} of {item.qty} available</p>
              <button disabled={avail <= 0} onClick={() => { setForm({ name: "", email: "", purpose: "" }); setError(""); setModalItem(item.id); }} style={{ width: "100%" }}>
                {avail <= 0 ? "Fully booked" : "Book"}
              </button>
              {bks.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
                  {bks.map((b) => (
                    <li key={b.id} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 4 }}>
                      <span>{b.name} — {b.purpose}</span>
                      <button onClick={() => cancelBooking(b.id)} style={{ fontSize: 11 }}>Cancel</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {adding && (
        <Modal title="Add inventory item" onClose={() => setAdding(false)}>
          <form onSubmit={addItem}>
            <Field label="Item name"><input value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: "100%" }} /></Field>
            <Field label="Quantity"><input type="number" min={1} value={newQty} onChange={(e) => setNewQty(e.target.value)} style={{ width: 100 }} /></Field>
            <button type="submit" style={{ width: "100%" }}>Add item</button>
          </form>
        </Modal>
      )}

      {modalItem && (
        <Modal title={`Book ${items.find((i) => i.id === modalItem)?.name}`} onClose={() => setModalItem(null)}>
          <form onSubmit={submitBooking}>
            <Field label="Your name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%" }} /></Field>
            <Field label="Purpose"><input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={{ width: "100%" }} /></Field>
            <Field label="Email address"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%" }} /></Field>
            {error && <p style={{ color: "#b23a34", fontSize: 13 }}>{error}</p>}
            <button type="submit" style={{ width: "100%" }}>Confirm booking</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState("rooms");
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Office spaces and gear</h1>
      <p style={{ color: "#6b6a64", margin: "0 0 18px", fontSize: 14 }}>
        Book a meeting room or borrow shared equipment. Office hours: {fmtTime(OFFICE_START * 60)}–{fmtTime(OFFICE_END * 60)}.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button onClick={() => setTab("rooms")} style={{ fontWeight: tab === "rooms" ? 600 : 400 }}>Meeting rooms</button>
        <button onClick={() => setTab("equipment")} style={{ fontWeight: tab === "equipment" ? 600 : 400 }}>Equipment</button>
      </div>
      {tab === "rooms" ? <RoomsTab /> : <EquipmentTab />}
    </div>
  );
}
