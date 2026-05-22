import { PathKind, SchemaPath, SchemaPathRules, validate } from "@angular/forms/signals";

export function validateAmountField(
    field: SchemaPath<string, SchemaPathRules.Supported, PathKind>,
    maximumField: SchemaPath<number, SchemaPathRules.Supported, PathKind>,
    exceedsMaxMessage: string
) {
    validate(field, ({ value }) => {
        const parsed = Number.parseFloat(value())
        if (Number.isNaN(parsed)) return { kind: 'invalid-numeric', message: 'กรุณากรอกตัวเลข' }
        if (parsed <= 0) return { kind: 'invalid-amount', message: 'กรุณากรอกตัวเลขมากกว่า 0' }
        return null
    })
    validate(field, ({ value, valueOf }) => {
        const parsed = Number.parseFloat(value())
        if (Number.isNaN(parsed)) return null
        return parsed > valueOf(maximumField) ? { kind: 'max', message: exceedsMaxMessage } : null
    })
}
