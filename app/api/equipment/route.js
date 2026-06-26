import { supabaseServer } from "../../../lib/supabaseClient";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb.from("equipment_items").select("*").order("name");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const sb = supabaseServer();
  const { name, qty } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Item name is required." }, { status: 400 });
  const { data, error } = await sb
    .from("equipment_items")
    .insert({ name: name.trim(), qty: Math.max(1, Number(qty) || 1) })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req) {
  const sb = supabaseServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await sb.from("equipment_bookings").delete().eq("item_id", id);
  const { error } = await sb.from("equipment_items").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
