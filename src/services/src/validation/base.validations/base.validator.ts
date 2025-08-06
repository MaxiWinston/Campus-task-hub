// src/validations/base.validator.ts
import { z } from 'zod';

export abstract class BaseValidator<T> {
  protected abstract schema: z.ZodSchema<T>;

  validate(data: unknown): T {
    return this.schema.parse(data);
  }

  safeParse(data: unknown) {
    return this.schema.safeParse(data);
  }
}