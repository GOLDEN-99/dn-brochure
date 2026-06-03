import { z } from 'zod'

export const customeBooleanSchema = z.enum(['0', '1', '']).transform(v => v === '1')

export type TCustomeBoolean = z.infer<typeof customeBooleanSchema>