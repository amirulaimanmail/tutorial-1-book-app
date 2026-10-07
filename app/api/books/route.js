import { errorResponse, readReadingItem } from "@/lib/reading-item";
import { getSessionUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getSessionUser())) return unauthorizedResponse();

  try {
    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      books: books.map((book) => ({
        ...book,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  if (!(await getSessionUser())) return unauthorizedResponse();

  try {
    const data = await readReadingItem(request);
    const book = await prisma.book.create({ data });

    return Response.json(
      {
        book: {
          id: book.id,
          name: book.name,
          description: book.description,
          url: book.url,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
