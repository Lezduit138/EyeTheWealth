import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const correctionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = correctionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    const { name, email, message } = parsed.data;

    const request = await prisma.correctionRequest.create({
      data: {
        name,
        email,
        message,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, id: request.id }, { status: 201 });
  } catch (error) {
    console.error("Correction request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
