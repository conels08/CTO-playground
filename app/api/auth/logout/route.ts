import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (sessionToken) {
      await prisma.user.updateMany({
        where: { sessionToken },
        data: {
          sessionToken: null,
          sessionExpiresAt: null,
        },
      });

      cookieStore.set("sessionToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      });
    }

    return NextResponse.json({ success: true, message: "Logged out." });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
