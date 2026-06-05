import { z } from 'zod'

export const wholeItemResponseSchema = z.object({
    code: z.string(),
    name: z.string(),
    wholeDate: z.string(), // iso string
    wholeCode: z.string(),
    wholeNumb: z.string(),
    wholeName: z.string(),
    bankNumb: z.string(),
    bankCode: z.string(),
    bankAcName: z.string(),
})

