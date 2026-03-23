export const formatLocalNumber = (v: number) => v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})

export const customFormatMonth = (iso: string) => {
    const [yy, mm, _] = iso.split('T')[0].split('-')
    return `${mm}/${yy}`
}

export const customFormatDate = (iso: string) => {
    const [yy, mm, dd] = iso.split('T')[0].split('-').map(Number)
    return `${dd}/${mm}/${yy}`
}