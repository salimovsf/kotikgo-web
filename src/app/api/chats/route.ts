import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/chats — list all chats
export async function GET() {
  const chats = await prisma.chat.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      locale: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, role: true },
      },
    },
  });

  return Response.json({ chats });
}

// POST /api/chats — create new chat
export async function POST(req: Request) {
  const body = await req.json();
  const chat = await prisma.chat.create({
    data: {
      title: body.title || null,
      locale: body.locale || "ru",
    },
  });

  return Response.json({ chat });
}
