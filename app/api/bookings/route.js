import { supabaseServer } from "../../../lib/supabaseClient";

export async function GET(req) {
  const sb = supabaseServer();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let query = sb.from("room_bookings").select("*").order("start_min");
  if (date) query = query.eq("date", date);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const sb = supabaseServer();
  const body = await req.json();
  const { roomId, date, start, end, name, email, purpose } = body;

  if (!name?.trim() || !email?.trim() || !purpose?.trim()) {
    return Response.json({ error: "Name, purpose and email are required." }, { status: 400 });
  }
  if (end <= start) {
    return Response.json({ error: "End time must be after start time." }, { status: 400 });
  }

  // server-side conflict check
  const { data: existing, error: fetchErr } = await sb
    .from("room_bookings")
    .select("start_min, end_min")
    .eq("room_id", roomId)
    .eq("date", date);
  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });

  const conflict = (existing || []).some((b) => start < b.end_min && b.start_min < end);
  if (conflict) {
    return Response.json({ error: "That slot overlaps an existing booking." }, { status: 409 });
  }

  const { data, error } = await sb
    .from("room_bookings")
    .insert({ room_id: roomId, date, start_min: start, end_min: end, name, email, purpose })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req) {
  const sb = supabaseServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { error } = await sb.from("room_bookings").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
