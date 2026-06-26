import { supabaseServer } from "../../../lib/supabaseClient";

export async function GET(req) {
  // Only Vercel Cron (or someone with the secret) can trigger this
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseServer();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const { data: bookings, error } = await sb
    .from("room_bookings")
    .select("*, rooms(name)")
    .eq("date", today)
    .eq("reminded", false);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const due = (bookings || []).filter((b) => {
    const diff = b.start_min - nowMins;
    return diff <= 15 && diff > 0;
  });

  for (const b of due) {
    await sendEmail(b);
    await sb.from("room_bookings").update({ reminded: true }).eq("id", b.id);
  }

  return Response.json({ sent: due.length });
}

async function sendEmail(booking) {
  const roomName = booking.rooms?.name || "your room";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.REMINDER_FROM_EMAIL,
      to: booking.email,
      subject: `Reminder: ${roomName} in 15 minutes`,
      text: `Hi ${booking.name}, this is a reminder that your booking "${booking.purpose}" in ${roomName} starts in 15 minutes.`,
    }),
  });
}
