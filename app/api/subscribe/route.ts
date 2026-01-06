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

/**
 * Kit helpers (v4)
 * - Auth header: X-Kit-Api-Key
 * - Create subscriber: POST /v4/subscribers
 * - Create tag: POST /v4/tags
 * - Add subscriber to tag: POST /v4/tags/:tagId/subscribers
 */

async function ensureKitTagId(tagName: string, apiKey: string): Promise<number> {
  const res = await fetch("https://api.kit.com/v4/tags", {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: tagName }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Kit tag create error ${res.status}: ${text}`);
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore; we'll error below if missing
  }

  const tagId = data?.tag?.id;
  if (typeof tagId !== "number") {
    throw new Error(`Kit tag create: missing tag.id in response: ${text}`);
  }

  return tagId;
}

async function addEmailToKitTag(tagId: number, email: string, apiKey: string) {
  const res = await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Kit tag attach error ${res.status}: ${text}`);
  }
}

async function upsertKitSubscriber(params: {
  email: string;
  consentedAtISO: string;
  source: string;
  apiKey: string;
}) {
  const res = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": params.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: params.email,
      state: "active",
      fields: {
        consented_at: params.consentedAtISO,
        source: params.source,
      },
    }),
  });

  // Treat "already exists" as success
  if (res.ok || res.status === 409) return;

  const text = await res.text().catch(() => "");
  throw new Error(`Kit subscriber error ${res.status}: ${text}`);
}

async function addToKit(params: { email: string; tags: string[]; consentedAtISO: string; source: string }) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new Error("KIT_API_KEY is not set");

  // 1) Create/Upsert subscriber (best effort, 409 treated as OK)
  await upsertKitSubscriber({
    email: params.email,
    consentedAtISO: params.consentedAtISO,
    source: params.source,
    apiKey,
  });

  // 2) Ensure tags exist + attach subscriber to each tag (best effort per tag)
  for (const tagName of params.tags) {
    try {
      const tagId = await ensureKitTagId(tagName, apiKey);
      await addEmailToKitTag(tagId, params.email, apiKey);
    } catch (e) {
      console.error("Kit tagging failed:", { tagName, error: e });
      // keep going; don't fail the overall subscribe
    }
  }
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

    const consentedAt = new Date();
    const sourceValue = source ?? "unknown";

    // 1) Always save to your DB (source of truth)
    await prisma.emailSubscriber.upsert({
      where: { email },
      create: {
        email,
        consent: true,
        consentedAt,
        source: sourceValue,
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
        source: sourceValue,
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
