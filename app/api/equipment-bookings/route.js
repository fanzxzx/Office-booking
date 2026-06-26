import { supabaseServer } from "../../../lib/supabaseClient";

export async function GET(req) {
  const sb = supabaseServer();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let query = sb.from("equipment_bookings").select("*");
  if (date) query = query.eq("date", date);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const sb = supabaseServer();
  const { itemId, date, name, email, purpose } = await req.json();
  if (!name?.trim() || !email?.trim() || !purpose?.trim()) {
    return Response.json({ error: "Name, purpose and email are required." }, { status: 400 });
  }

  const { data: item, error: itemErr } = await sb.from("equipment_items").select("qty").eq("id", itemId).single();
  if (itemErr) return Response.json({ error: itemErr.message }, { status: 500 });

  const { count, error: countErr } = await sb
    .from("equipment_bookings")
    .select("id", { count: "exact", head: true })
    .eq("item_id", itemId)
    .eq("date", date);
  if (countErr) return Response.json({ error: countErr.message }, { status: 500 });

  if ((count || 0) >= item.qty) {
    return Response.json({ error: "None left to book for this day." }, { status: 409 });
  }

  const { data, error } = await sb
    .from("equipment_bookings")
    .insert({ item_id: itemId, date, name, email, purpose })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req) {
  const sb = supabaseServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { error } = await sb.from("equipment_bookings").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
