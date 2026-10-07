import { errorResponse, readReadingItem } from "@/lib/reading-item";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  if (!(await getSessionUser())) return unauthorizedResponse();

  try {
    const { id } = await params;
    const data = await readReadingItem(request);
    const book = await prisma.book.update({ where: { id }, data });

    return Response.json({
      book: {
        id: book.id,
        name: book.name,
        description: book.description,
        url: book.url,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  if (!(await getSessionUser())) return unauthorizedResponse();

  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
