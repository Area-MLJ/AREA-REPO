import { z } from 'zod';

export const updateUserSchema = z.object({
  displayName: z.string().min(1, 'Le nom d\'affichage est requis').optional(),
  email: z.string().email('Email invalide').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

