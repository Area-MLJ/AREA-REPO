// route.ts
import { NextResponse } from "next/server";
import { emailRiskTrigger } from "@/area/actions/emailRisk.trigger"; // renvoie le détail du risque
import { sendSecurityEmail } from "@/services/resend.service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const riskResult = await emailRiskTrigger(email);

    const content = `
      Rapport de sécurité pour ${email} :

      Niveau de risque: ${riskResult.triggered ? "⚠️ Élevé" : "✅ Faible"}
      Score de risque: ${riskResult.riskScore}

      Détails: ${JSON.stringify(riskResult.details, null, 2)}
    `;

    await sendSecurityEmail(content);

    return NextResponse.json({ success: true, riskResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}


// IDEE DE TEMPLATE HTML POUR EMAIL PLUS COMPLEXE

// import { NextResponse } from "next/server";
// import { Resend } from "resend";
// import { EmailRiskService } from "@/services/emailRisk.service";

// const resend = new Resend(process.env.RESEND_API_KEY!);

// const htmlContent = (email: string, riskResult: any) => `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
//     <h2 style="text-align: center; color: #333;">Rapport de sécurité pour <strong>${email}</strong></h2>
    
//     <h3 style="color: #555;">Résumé du risque</h3>
//     <p>
//       Niveau de risque : <strong style="color: ${riskResult.email_risk.address_risk_status === 'low' ? 'green' : riskResult.email_risk.address_risk_status === 'medium' ? 'orange' : 'red'};">
//       ${riskResult.email_risk.address_risk_status.toUpperCase()}</strong><br>
//       Score de risque : <strong>${riskResult.email_quality.score ?? 'N/A'}</strong>
//     </p>

//     <h3 style="color: #555;">Détails de l’email</h3>
//     <ul>
//       <li><strong>Adresse :</strong> ${riskResult.email_address}</li>
//       <li><strong>Fournisseur :</strong> ${riskResult.email_sender.email_provider_name} (${riskResult.email_sender.organization_name})</li>
//       <li><strong>Domain :</strong> ${riskResult.email_domain.domain} (Enregistré le ${riskResult.email_domain.date_registered})</li>
//       <li><strong>Email livrable :</strong> ${riskResult.email_deliverability.status}</li>
//     </ul>

//     <h3 style="color: #555;">Brevets et incidents de sécurité</h3>
//     <p>Total de violations : <strong>${riskResult.email_breaches.total_breaches}</strong></p>
//     ${riskResult.email_breaches.total_breaches > 0 
//       ? `<ul>${riskResult.email_breaches.breached_domains.map((d: string) => `<li>${d}</li>`).join('')}</ul>` 
//       : '<p>Aucune fuite détectée.</p>'}

//     <h3 style="color: #555;">Autres informations</h3>
//     <ul>
//       <li>Adresse email gratuite : ${riskResult.email_quality.is_free_email ? 'Oui' : 'Non'}</li>
//       <li>Username suspect : ${riskResult.email_quality.is_username_suspicious ? 'Oui' : 'Non'}</li>
//       <li>DMARC appliqué : ${riskResult.email_quality.is_dmarc_enforced ? 'Oui' : 'Non'}</li>
//     </ul>

//     <p style="text-align: center; color: #888; font-size: 12px;">Ce rapport est généré automatiquement. ⚠️ Ne répondez pas à ce mail.</p>
//   </div>
// `;

// async function getEmailRisk(email: string) {
//   try {
//     const data = await EmailRiskService.checkEmail(email);
//     return data;
//   } catch (err) {
//     console.error("Erreur EmailRiskService:", err);
//     throw new Error("Impossible de récupérer le risque pour cet email");
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json({ success: false, error: "Email manquant" }, { status: 400 });
//     }

//     const riskResult = await getEmailRisk(email);

//     await resend.emails.send({
//       from: process.env.EMAIL_FROM!,
//       to: email,
//       subject: `Rapport Email Risk pour ${email}`,
//       html: htmlContent(email, riskResult),
//     });

//     return NextResponse.json({ success: true, riskResult });
//   } catch (error) {
//     console.error("Erreur route /email-breach:", error);
//     return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
//   }
// }
