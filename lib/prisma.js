import { PrismaClient } from "@prisma/reading-list-client";

const prismaGlobal = globalThis;

export const prisma = prismaGlobal.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prismaClient = prisma;
}
