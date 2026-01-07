import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: true, subscribed: false, signedIn: false });
  }

  const email = session.user.email.toLowerCase().trim();

  const row = await prisma.emailSubscriber.findUnique({
    where: { email },
    select: { consent: true },
  });

  return NextResponse.json({
    success: true,
    signedIn: true,
    subscribed: Boolean(row?.consent),
    email,
  });
}
