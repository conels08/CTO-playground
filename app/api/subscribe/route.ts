import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const emailRaw = body?.email;
    const consent = body?.consent;

    if (typeof emailRaw !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json(
        { success: false, message: "Please check the consent box to subscribe." },
        { status: 400 }
      );
    }

    const email = normalizeEmail(emailRaw);

    // basic validation (good enough for now)
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Upsert-ish behavior: if already exists, mark consent true
    await prisma.emailSubscriber.upsert({
      where: { email },
      update: {
        consent: true,
        consentedAt: new Date(),
      },
      create: {
        email,
        consent: true,
        consentedAt: new Date(),
        source: body?.source && typeof body.source === "string" ? body.source : "home",
      },
    });

    return NextResponse.json({
      success: true,
      message: "You’re in! We’ll send occasional updates (no spam).",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
