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

type Attribution = {
  referrer?: string | null;
  landingPath?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

function cleanStr(v: unknown, max = 300) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

async function addToKit(params: {
  email: string;
  tags: string[];
  consentedAtISO: string;
  attribution?: Attribution;
}) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new Error("KIT_API_KEY is not set");

  // Build Kit fields (custom fields). Keep them short + simple.
  const fields: Record<string, string> = {
    consented_at: params.consentedAtISO,
    source: params.tags?.[1] ?? "unknown",
  };

  const a = params.attribution ?? {};
  if (a.referrer) fields.referrer = a.referrer;
  if (a.landingPath) fields.landing_path = a.landingPath;

  if (a.utmSource) fields.utm_source = a.utmSource;
  if (a.utmMedium) fields.utm_medium = a.utmMedium;
  if (a.utmCampaign) fields.utm_campaign = a.utmCampaign;
  if (a.utmTerm) fields.utm_term = a.utmTerm;
  if (a.utmContent) fields.utm_content = a.utmContent;

  // Create/confirm subscriber
  const res = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: params.email,
      state: "active",
      fields,
    }),
  });

  if (res.ok) return { ok: true };

  const text = await res.text().catch(() => "");
  if (res.status === 409) return { ok: true, note: "Kit subscriber already exists" };

  throw new Error(`Kit API error ${res.status}: ${text}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const emailRaw = typeof body?.email === "string" ? body.email : "";
    const email = emailRaw.trim().toLowerCase();

    const consent = body?.consent === true;
    const source = cleanStr(body?.source, 80);

    // Attribution coming from client (preferred)
    const utmSource = cleanStr(body?.utmSource, 120);
    const utmMedium = cleanStr(body?.utmMedium, 120);
    const utmCampaign = cleanStr(body?.utmCampaign, 120);
    const utmTerm = cleanStr(body?.utmTerm, 120);
    const utmContent = cleanStr(body?.utmContent, 120);
    const landingPath = cleanStr(body?.landingPath, 200);

    // Referrer can be provided by client OR inferred from request headers
    const referrerFromBody = cleanStr(body?.referrer, 300);
    const referrerFromHeader = cleanStr(req.headers.get("referer"), 300);
    const referrer = referrerFromBody ?? referrerFromHeader ?? null;

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

    // 1) Save to DB (source of truth)
    await prisma.emailSubscriber.upsert({
      where: { email },
      create: {
        email,
        consent: true,
        consentedAt,
        source: source ?? "unknown",

        referrer,
        landingPath,

        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      },
      update: {
        consent: true,
        consentedAt,
        source: source ?? undefined,

        // Only update fields if provided (avoid overwriting with null)
        referrer: referrer ?? undefined,
        landingPath: landingPath ?? undefined,

        utmSource: utmSource ?? undefined,
        utmMedium: utmMedium ?? undefined,
        utmCampaign: utmCampaign ?? undefined,
        utmTerm: utmTerm ?? undefined,
        utmContent: utmContent ?? undefined,
      },
    });

    // 2) Best-effort send to Kit
    const tags = ["quit_smoking_tracker", sourceToTag(source)];
    try {
      await addToKit({
        email,
        tags,
        consentedAtISO: consentedAt.toISOString(),
        attribution: {
          referrer,
          landingPath,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
        },
      });
    } catch (kitErr) {
      console.error("Kit subscribe failed (DB saved):", kitErr);
    }

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
