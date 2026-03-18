import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/chats/:id — get chat with messages
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  return Response.json({ chat });
}

// DELETE /api/chats/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.chat.delete({ where: { id } });
  return Response.json({ ok: true });
}
