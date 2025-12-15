import { notifyExtremePairs } from "@/area/actions/notifyExtremePairs.action";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to } = body;

    await notifyExtremePairs(to);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur extreme pairs:", error);
    return Response.json({ success: false, error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
