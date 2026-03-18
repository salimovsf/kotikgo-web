import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/chats/:id/messages — save a message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { role, content } = await req.json();

  const message = await prisma.message.create({
    data: { chatId: id, role, content },
  });

  // Update chat title from first user message if no title
  if (role === "user") {
    const chat = await prisma.chat.findUnique({
      where: { id },
      select: { title: true },
    });
    if (!chat?.title) {
      await prisma.chat.update({
        where: { id },
        data: { title: content.slice(0, 80) },
      });
    }
  }

  return Response.json({ message });
}
