export type TDate = {
    day: number
    month: number
    year: number
}

export const genCalendar = ({ month, year }: Omit<TDate, 'day'>) => {
    let calendar: TDate[][] = []
    const jsMonth = month - 1
    const lastDate = new Date(year, jsMonth, 0)
    const lldate = lastDate.getDate()
    const startLocalDayOfWk = lastDate.getDay()
    const prevMonth = jsMonth === 0 ? 11 : jsMonth - 1
    const prevYear = jsMonth === 0 ? year - 1 : year
    const prevMoArr = genPrevMo({ day: lldate, month: prevMonth, year: prevYear }, startLocalDayOfWk, [])
    const nextMonth = jsMonth === 11 ? 0 : jsMonth + 1
    const nextYear = jsMonth === 11 ? year + 1 : year
    const firstDate = new Date(nextYear, nextMonth, 0)
    const endLocalDayOfWk = firstDate.getDay()
    const nextMoArr = genNextMo({ day: 1, month: nextMonth, year: nextYear }, endLocalDayOfWk + 1, [])
    const maxDay = firstDate.getDate()
    const totalWeek = (prevMoArr.length + maxDay + nextMoArr.length) / 7
    let week = []
    let p = 0
    let dayOfCurrentMo = 1
    let n = 0
    for (let w = 0; w < totalWeek; w++) {
        while (p < prevMoArr.length && w === 0 && week.length !== 7) {
            week.push(prevMoArr[p])
            p++
        }
        while (dayOfCurrentMo <= maxDay && week.length !== 7) {
            week.push({ day: dayOfCurrentMo, month, year })
            dayOfCurrentMo++
        }
        while (n < nextMoArr.length && w === totalWeek - 1 && week.length !== 7) {
            week.push(nextMoArr[n])
            n++
        }
        calendar.push(week)
        week = []
    }
    console.table(calendar)
    return calendar
}

const genPrevMo = (ldom: TDate, dow: number, result: TDate[]) => {
    if (dow > 6 || dow < 0) return result
    const { day, month, year } = ldom
    const prev = { year, month, day: day - 1 }
    return genPrevMo(prev, dow - 1, [{ year, month: month + 1, day }, ...result])
}

const genNextMo = (fdom: TDate, dow: number, result: TDate[]) => {
    if (dow > 6 || dow < 0) return result
    const { day, month, year } = fdom
    const next = { year, month, day: day + 1 }
    return genNextMo(next, dow + 1, [...result, { year, month: month + 1, day }])
}

const convertDateToStruct = (jsDate: Date) => ({
    day: jsDate.getDate(),
    month: jsDate.getMonth() + 1,
    year: jsDate.getFullYear()
})

export const getWeekRange = ({ year, month, day }: TDate) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const mondayDate = new Date(date);
    mondayDate.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sundayDate = new Date(date);
    sundayDate.setDate(date.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek));

    return {
        start: convertDateToStruct(mondayDate),
        end: convertDateToStruct(sundayDate)
    }
}

export const convertToIso = ({ year, month, day }: TDate) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`