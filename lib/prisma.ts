import { PrismaClient } from "@prisma/client";

// This is a global variable that will be used to store the PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | undefined;
};

// If the global variable already has a PrismaClient instance, use that one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
