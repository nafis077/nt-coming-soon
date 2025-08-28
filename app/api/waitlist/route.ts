import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const isEmail = (v: string) => typeof v === "string" && v.includes("@") && v.includes(".");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    if (!isEmail(normalized)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }
    await prisma.waitlist.create({ data: { email: normalized } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ message: "Already on the list" }, { status: 409 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
