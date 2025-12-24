import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
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

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      // If user exists but has no password yet, allow setting it
      if (!existing.passwordHash) {
        const newHash = await hashPassword(password);

        await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: newHash,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Password set. You can now log in.",
        });
      }

      // If user exists and has a password, block duplicate signups
      const passwordMatches = await verifyPassword(
        password,
        existing.passwordHash
      );

      if (passwordMatches) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists. Try logging in instead.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const sessionToken = crypto.randomUUID();
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 30);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
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
      message: "Account created and logged in.",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
