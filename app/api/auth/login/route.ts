import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomUUID();
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 30); // 30 days

    await prisma.user.update({
      where: { id: user.id },
      data: {
        sessionToken,
        sessionExpiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: sessionExpiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully.",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
