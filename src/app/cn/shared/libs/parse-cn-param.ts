import { z } from "zod";

export const CNRouteParamSchema = z.object({
    isWRR: z.string().default('0'),
    saleCode: z.string(),
    wholeCode: z.string(),
    wholeNumb: z.string(),
});

export type TCNRouteParam = z.infer<typeof CNRouteParamSchema>