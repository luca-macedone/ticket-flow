import { z } from "zod";

export const idSchema = z.string().regex(/^\d+$/);
export const isoDate = z.string().datetime();
