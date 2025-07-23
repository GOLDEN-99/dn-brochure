import { TOIStepItem } from "../../../../types"

type TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null) => (accAmount: number, accInc: number, current: number) => number

export const calFlat: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null) => (accAmount: number, accIncome: number, current: number) => {
    if (capAmount !== null && accIncome >= capAmount) return 0
    const calIncome = current * steps[0].rate / 100
    if (capAmount === null) {
        return calIncome
    }
    if (accIncome + calIncome >= capAmount) {
        return capAmount - accIncome;
    }
    return calIncome
}

export const calStep: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null) => (accAmount: number, accIncome: number, current: number) => {
    if (capAmount !== null && accIncome >= capAmount) return 0
    const cal = steps.reduce(
        ([target, acc, result], { min, max, rate }) => {
            if (acc === target) return [target, acc, result]
            if (max === null) {
                const cur = (target - acc) * rate
                return [target, target, result + cur]
            }
            if (target >= max) {
                const range = max - min
                const cur = range * rate
                return [target, acc + range, result + cur]
            }
            const diff = target - min
            const cur = diff * rate
            return [target, target, result + cur]
        }, [current + accAmount, 0, 0]
    )
    const calIncome = cal[2] / 100
    if (capAmount === null) {
        return calIncome - accIncome
    }
    if (accIncome + calIncome >= capAmount) {
        return capAmount - accIncome;
    }
    return calIncome - accIncome
}

export const calSemi: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null) => (accIncome: number, accAmount: number, current: number) => {
    if (capAmount !== null && accIncome >= capAmount) return 0
    const cal = steps.reduce(
        (acc, { min, max, rate }) => {
            const [target, remain, result] = acc
            if (target === remain) return acc
            if (max === null) {
                const cur = target * rate
                return [target, target, cur]
            }
            if (target >= max) {
                return [target, remain + max - min, result]
            }
            const cur = target * rate
            return [target, target, cur]
        }, [current + accAmount, 0, 0]
    )
    const calIncome = cal[2] / 100
    if (capAmount === null) {
        return calIncome - accIncome
    }
    if (accIncome + calIncome >= capAmount) {
        return capAmount - accIncome;
    }
    return calIncome - accIncome
}