import { z } from 'zod';

export const connectServiceSchema = z.object({
  serviceId: z.string().uuid('ID de service invalide'),
  oauthCode: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export type ConnectServiceInput = z.infer<typeof connectServiceSchema>;

