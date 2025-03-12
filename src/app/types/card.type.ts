export type TPriceTier = {
    standard: number
    silver: number
    gold: number
}

export type TCardProps = {
    name: string
    code: string
    image: string
    priceTier: TPriceTier
    displayPrice: number
    isFlag: boolean
}

export type TCardColor = 'green' | 'purple'