import { z } from 'zod'
import { customeBooleanSchema } from '../../shared/utils/custome-schema'

export const brochureZoneSchema = z.string().transform((value, ctx) => {
  const normalized = value.toUpperCase()
  if (normalized === 'UPC' || normalized === 'BKK') return normalized
  ctx.addIssue({ code: 'custom', message: `Invalid brochureType: ${value}` })
  return z.NEVER

})

export type TZone = z.infer<typeof brochureZoneSchema>

export const flashSaleParamsSchema = z.object({
  idPromotion: z.string().min(1).regex(/^\d+$/),
  zone: brochureZoneSchema
})

export type TFlashParams = z.infer<typeof flashSaleParamsSchema>

const promoTypeMap: Record<string, 'Monthly' | 'SP' | 'Hot'> = {
  monthly: 'Monthly', sp: 'SP', hot: 'Hot'
}

export const promotionTypeSchema = z.string()
  .transform((v, ctx) => {
    const mapped = promoTypeMap[v.toLowerCase()]
    if (!mapped) {
      ctx.addIssue({ code: 'custom', message: `Invalid promoType: ${v}` })
      return z.NEVER
    }
    return mapped
  })

export type TPromotionType = z.infer<typeof promotionTypeSchema>

export const wholeTypeSchema = z.string()
  .transform((value, ctx) => {
    const normalized = value.toLowerCase()
    if (normalized === 'normal') return 'Normal'
    if (normalized === 'dental') return 'Dental'
    if (normalized === 'clinic') return 'Clinic'
    ctx.addIssue({ code: 'custom', message: `Invalid wholeType: ${value}` })
    return z.NEVER
  })


export type TWhole = z.infer<typeof wholeTypeSchema>

export const normalParamsSchea = z.object({
  wholeCode: z.string().nonempty(),
  promoType: promotionTypeSchema
})

export type TNormalParams = z.infer<typeof normalParamsSchea>

export const marketingParamsSchema = z.object({
    wholeType: wholeTypeSchema,
    token: z.string(), // an empty string is acceptable
    idPromotion: z.string().min(1).regex(/^\d+$/),
    promoType: promotionTypeSchema,
    isNew: customeBooleanSchema,
    isBkk: customeBooleanSchema
})

export type TMarketingParams = z.infer<typeof marketingParamsSchema>

export const colorSchema = z.enum(['green', 'purple'])

export type TColor = z.infer<typeof colorSchema>

export const brochureSupplierSchema = z.enum(['gen', 'dent', 'phar'])

export type TBrochureSupplier = z.infer<typeof brochureSupplierSchema>
