/* eslint-disable */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Don't allow deleting seed admin
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.email === process.env.ADMIN_EMAILS?.split(",")[0] || user?.email === "admin@etw.local") {
      return NextResponse.json({ error: "Cannot delete the primary admin account" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

