import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: normalized });

  if (error) {
    // Unique constraint = already signed up
    if (error.code === "23505") {
      return NextResponse.json({ error: "You're already on the list." }, { status: 409 });
    }
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
