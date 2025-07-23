import { TOIStepItem } from "../../../../types";

export const calStep = (isStep: boolean, steps: TOIStepItem[]) => (value: number) => {
    const factor = isStep ? 1 : 0
    const raw = steps.reduce((acc, { min, max, rate }) => {
        if (value < min) return acc
        const base = min * factor
        if (!max) {
            const thisValue = (value - base) * rate
            return acc + thisValue
        }
        if (value >= max) {
            const range = (max - min)
            const thisValue = range * rate * factor
            return acc + thisValue
        }
        const discountValue = value - base
        const thisValue = discountValue * rate
        return acc + thisValue
    }, 0)
    return raw / 100
}