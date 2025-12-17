import { EmailRiskService } from "@/services/emailRisk.service";

export async function emailRiskTrigger(email: string) {
  const data = await EmailRiskService.checkEmail(email);

  const riskScore = Number(data.quality_score);

  return {
    triggered: riskScore >= 0.7,
    riskScore,
    details: data,
  };
}
