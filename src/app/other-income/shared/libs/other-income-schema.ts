import { z } from 'zod'

export const COMP_TYPE: Record<string, 'DN' | 'HU'> = {
    dn: 'DN', hu: 'HU'
} as const

export const compTypeSchema = z.string().transform((v, ctx) => {
    const noramlizedValue = v.toLowerCase();
    const result = COMP_TYPE[noramlizedValue]
    if (typeof result !== 'string') {
        ctx.addIssue({ code: 'custom', message: `Invalid compType: ${v}` })
        return z.NEVER
    }
    return result
})

export type CompType = z.infer<typeof compTypeSchema>