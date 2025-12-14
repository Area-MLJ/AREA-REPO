import { NextResponse } from "next/server";
import { newsTrigger } from "@/area/trigger.news";
import { sendMailAction } from "@/area/action.mail";

export async function POST() {
  try {
    console.log("Début AREA POST");

    await newsTrigger();
    console.log("newsTrigger OK");

    await sendMailAction();
    console.log("sendMailAction OK");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur AREA:", err);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
