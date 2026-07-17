import { z } from 'zod'

export const wholeItemResponseSchema = z.object({
    wholeDate: z.string(), // iso string
    wholeCode: z.string(),
    wholeNumb: z.string(),
    wholeName: z.string(),
    name: z.string().nullable().transform(val => val ?? '').default(''),
    code: z.string().nullable().transform(val => val ?? '').default(''),
    bankNumb: z.string().nullable().transform(val => val ?? '').default(''),
    bankCode: z.string().nullable().transform(val => val ?? '').default(''),
    bankAcName: z.string().nullable().transform(val => val ?? '').default(''),
})

