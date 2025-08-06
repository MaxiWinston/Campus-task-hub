// src/dto/base.dto.ts
import { z } from 'zod';

export const BaseSchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export type BaseDto = z.infer<typeof BaseSchema>;