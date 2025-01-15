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

    return NextResponse.json({
      message: "User subscription updated successfully 🥳",
      updatedUser,
    });
  } catch (error) {
    console.log("Error updating Subscription  😛", error);

    return NextResponse.json("Error updating Subscription  🤨", {
      status: 400,
    });
  }
}

export async function GET() {
  // 1) Check if the user is login
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json("Unauthorized user 😿", { status: 401 });
  }

  // 2) Get the user from the database

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSubscribed: true, subscriptionEndsAt: true },
    });

    if (!user) {
      return NextResponse.json("User not found 😿", { status: 404 });
    }

    const now = new Date();

    // 3) Check if the user subscription has ended
    if (user?.subscriptionEndsAt && user.subscriptionEndsAt < now) {
      await prisma.user.update({
        where: { id: userId },
        data: { isSubscribed: false },
      });
      return NextResponse.json({
        message: "User subscription has ended 😿",
        isSubscribed: false,
        subscriptionEndsAt: null,
      });
    }

    return NextResponse.json({
      message: "User subscription status fetched successfully 🥳",
      user,
    });
  } catch (error) {
    console.log("Error fetching Subscription status 😛", error);

    return NextResponse.json("Error fetching Subscription status 🤨", {
      status: 400,
    });
  }
}
