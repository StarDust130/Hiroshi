import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
  // 1) Check if the user is login
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized user 😿", { status: 401 });
  }

  // 2) Get the user from the database

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json("User not found 😿", { status: 404 });
    }

    // 3) Update the user subscription status and subscription end date

    const subscriptionEnds = new Date();

    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: true,
        subscriptionEndsAt: subscriptionEnds,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("Error 😛", error);

    return NextResponse.json("Error  🤨", { status: 400 });
  }
}

export async function GET() {

}
