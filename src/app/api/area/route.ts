import { NextResponse } from "next/server";
import { catImageTrigger } from "@/area/trigger.cat";
import { sendMailAction } from "@/area/action.mail";

export async function POST() {
  try {
    // Trigger
    const triggerResult = await catImageTrigger();

    // Action
    await sendMailAction({
      imageUrl: triggerResult.imageUrl,
    });

    return NextResponse.json({
      success: true,
      imageUrl: triggerResult.imageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "AREA execution failed" },
      { status: 500 }
    );
  }
}
