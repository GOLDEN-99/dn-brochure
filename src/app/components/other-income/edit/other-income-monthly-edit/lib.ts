import { TOIStepItem } from "../../../../types"

type TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accInc: number,) => (current: number) => number

export const calFlat: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    const calIncome = validAmount * steps[0].rate / 100
    return calIncome - accIncome
}

export const calStep: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    if (validAmount === 0) return 0
    let rawIncome = 0
    for (const step of steps) {
        const { min, max, rate } = step
        const thisStep = validAmount - min
        if (thisStep < 0) break
        if (max === null) {
            rawIncome += thisStep * rate
        } else {
            const amount = Math.min(thisStep, max - min)
            rawIncome += amount * rate
        }
    }
    const result = (rawIncome / 100) - accIncome
    return Math.max(result, 0)
}

export const calSemi: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    if (validAmount === 0) return 0
    let rawIncome = 0
    for (const step of steps) {
        const { min, max, rate } = step
        if (validAmount >= min && (max === null || validAmount < max)) {
            rawIncome += validAmount * rate
        }
    }
    const result = (rawIncome / 100) - accIncome
    return Math.max(result, 0)
}

const applyCap = (amount: number, capAmount: number | null): number => {
    if (capAmount === null) return amount;
    return Math.min(amount, capAmount);
};
//simpler version
export const calculateWithFlatRate = (steps: TOIStepItem[]) => (target: number) => {
    return steps[0].rate * target / 100
}

export const calculateWithStepRate = (steps: TOIStepItem[]) => (target: number) => {
    let rawIncome = 0
    for (const step of steps) {
        const { min, max, rate } = step
        const thisStep = target - min
        if (thisStep < 0) break
        if (max === null) {
            rawIncome += thisStep * rate
        } else {
            const amount = Math.min(thisStep, max - min)
            rawIncome += amount * rate
        }
    }
    return rawIncome / 100
}

export const calculateWithSemiStepRate = (steps: TOIStepItem[]) => (target: number) => {
    if (target === 0) return 0
    const step = steps.find(({ min, max }) => target >= min && (max === null || target < max));
    if (step === undefined) return 0
    return target * step.rate / 100
}