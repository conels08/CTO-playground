// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const emailRaw = typeof body?.email === "string" ? body.email : "";
    const email = emailRaw.trim().toLowerCase();

    const consent = body?.consent === true; // must be explicit true
    const source = typeof body?.source === "string" ? body.source.trim() : null;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, message: "Consent is required to subscribe." },
        { status: 400 }
      );
    }

    // Upsert so:
    // - new emails get created
    // - existing emails get updated (no error / no duplicate constraint crash)
    await prisma.emailSubscriber.upsert({
      where: { email },
      create: {
        email,
        consent: true,
        consentedAt: new Date(),
        source: source ?? "unknown",
      },
      update: {
        consent: true,
        consentedAt: new Date(),
        source: source ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "You’re in. Updates coming your way.",
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
