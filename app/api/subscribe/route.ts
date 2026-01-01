import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const consent = body?.consent === true;
    const source =
      typeof body?.source === "string" ? body.source : "home_hero";

    const email = normalizeEmail(rawEmail);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          message: "Please agree to receive email updates.",
        },
        { status: 400 }
      );
    }

    await prisma.emailSubscriber.upsert({
      where: { email },
      create: {
        email,
        consent: true,
        consentedAt: new Date(),
        source,
      },
      update: {
        consent: true,
        consentedAt: new Date(),
        source,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "You're on the list! We'll keep you posted.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
