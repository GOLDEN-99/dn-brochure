export type TPraser<T> = (value: any) => T
export type TPraserOption<T, K> = {
    praser: TPraser<T>
    fallback: K
}