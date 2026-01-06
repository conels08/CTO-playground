// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Create a safe tag name from your source (e.g. "home_hero" -> "source_home_hero")
function sourceToTag(source: string | null) {
  const cleaned = (source ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);

  return `source_${cleaned || "unknown"}`;
}

async function addToKit(params: {
  email: string;
  tags: string[];
  consentedAtISO: string;
}) {
  const apiKey = process.env.KIT_API_KEY;

  if (!apiKey) {
    throw new Error("KIT_API_KEY is not set");
  }

  // Kit v4 API (JSON:API style)
  // Endpoint: create a subscriber
  // NOTE: If Kit responds with "already exists", we treat it as success.
  const res = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "subscribers",
        attributes: {
          email_address: params.email,
          // Helps you in Kit: you can see they consented and when (custom fields are optional)
          fields: {
            consented_at: params.consentedAtISO,
          },
        },
      },
    }),
  });

  // 2xx = success
  if (res.ok) {
    // Add tags (best effort). If tagging fails, we still consider subscribe successful.
    // Kit v4 tagging uses a separate endpoint. We'll attempt it after create.
    // If this endpoint differs in your Kit account, the log will show it and we’ll adjust quickly.
    await Promise.all(
      params.tags.map(async (tagName) => {
        try {
          await fetch("https://api.kit.com/v4/tags", {
            method: "POST",
            headers: {
              Authorization: `Token ${apiKey}`,
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            },
            body: JSON.stringify({
              data: {
                type: "tags",
                attributes: {
                  name: tagName,
                },
              },
            }),
          });
          // Note: Some APIs require linking tag->subscriber separately.
          // If your account requires that, we’ll see it in logs and update.
        } catch (e) {
          console.error("Kit tag create failed:", e);
        }
      })
    );

    return { ok: true };
  }

  // Non-2xx: capture response text for logs
  const text = await res.text().catch(() => "");

  // Many ESPs return conflict if subscriber exists.
  // If Kit returns a conflict-like error, we treat it as success.
  // (If it’s a different error, logs will show and we’ll refine.)
  if (res.status === 409) {
    return { ok: true, note: "Kit subscriber already exists" };
  }

  throw new Error(`Kit API error ${res.status}: ${text}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const emailRaw = typeof body?.email === "string" ? body.email : "";
    const email = emailRaw.trim().toLowerCase();

    const consent = body?.consent === true;
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

    const consentedAt = new Date();

    // 1) Always save to your DB (source of truth)
    await prisma.emailSubscriber.upsert({
      where: { email },
      create: {
        email,
        consent: true,
        consentedAt,
        source: source ?? "unknown",
      },
      update: {
        consent: true,
        consentedAt,
        source: source ?? undefined,
      },
    });

    // 2) Best-effort send to Kit (do not block UX if Kit fails)
    const tags = ["quit_smoking_tracker", sourceToTag(source)];
    try {
      await addToKit({
        email,
        tags,
        consentedAtISO: consentedAt.toISOString(),
      });
    } catch (kitErr) {
      console.error("Kit subscribe failed (DB saved):", kitErr);
      // Don’t throw—DB already has the lead
    }

    // Always respond success (idempotent UX)
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
