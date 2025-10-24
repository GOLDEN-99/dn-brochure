import { TOIStepItem } from "../../../../types"

type TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accInc: number,) => (current: number) => number

export const calFlat: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    const calIncome = validAmount * steps[0].rate / 100
    return calIncome
}

export const calStep: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    if (validAmount === 0) return 0
    const cal = steps.reduce(
        ([remain, result], { min, max, rate }) => {
            // end of recursive acc === target
            if (remain === 0) return [0, result]
            if (max === null) {
                // no upper bound => last step
                const cur = remain * rate
                return [0, result + cur]
            }
            const range = max - min
            if (remain <= range) {
                // within bracket => last step
                const cur = remain * rate
                return [0, result + cur]
            }
            //greater than bracket > cal this step and subtract bracket size
            const cur = range * rate
            return [remain - range, result + cur]
        }, [validAmount, 0]
    )
    const calIncome = cal[1] / 100
    return calIncome - accIncome
}

export const calSemi: TCalFn = (steps: TOIStepItem[]) => (capAmount: number | null, accAmount: number, accIncome: number,) => (current: number) => {
    const rawTarget = accAmount + current
    const validAmount = applyCap(rawTarget, capAmount)
    if (validAmount === 0) return 0
    const cal = steps.reduce(
        (acc, { min, max, rate }) => {
            const [start, end, _] = acc
            if (start <= end) {
                // start <= end >> no further calculation
                return acc
            }
            if (max === null) {
                // last step break here
                const cur = start * rate
                return [start, start, cur]
            }
            const range = max - min
            const diff = start - end
            if (diff > range) {
                return [start, end + range, 0]
            }
            const cur = start * rate
            return [start, end, cur]

        }, [validAmount, 0, 0]
    )
    const calIncome = cal[1] / 100
    return calIncome - accIncome
}

const applyCap = (amount: number, capAmount: number | null): number => {
    if (capAmount === null) return amount;
    if (capAmount <= amount) return 0;
    return Math.min(amount, capAmount);
};