import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("No webhook secret found", { status: 500 });
  }

  const headerPayload = headers();
  const asix_id = (await headerPayload).get("svix-id");
  const asix_timestamp = (await headerPayload).get("svix-timestamp");
  const asix_signature = (await headerPayload).get("svix-signature");

  if (!asix_id || !asix_timestamp || !asix_signature) {
    return new Response("Missing headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": asix_id,
      "svix-timestamp": asix_timestamp,
      "svix-signature": asix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.log("Error verifying webhook 😛", error);
    return new Response("Error ocuured in Webhook 🤨", { status: 400 });
  }

  const { id } = event.data;
  const eventType = event.type;

  if (eventType === "user.created") {
    try {
      const { email_addresses, primary_email_address_id } = event.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      console.log("Primary email:", primaryEmail);
      console.log("Email addresses:", primaryEmail?.email_address);

      if (!primaryEmail) {
        console.error("No primary email found");
        return new Response("No primary email found", { status: 400 });
      }

      // Create the user in the database
      const newUser = await prisma.user.create({
        data: {
          id: event.data.id!,
          email: primaryEmail.email_address,
          isSubscribed: false, // Default setting
        },
      });
      console.log("New user created 🥰:", newUser);
    } catch (error) {
      console.error("Error in user.created event", error);
      return new Response("Error to created user 👎", { status: 400 });
    }
  }

  return new Response("Webhook received 😄", { status: 200 });
}
