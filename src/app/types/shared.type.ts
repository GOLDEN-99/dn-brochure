export type TObj = Record<string, unknown>

export type TMaybe<T> = T | null

export type TColor = 'green' | 'purple'

export type TSupplier = 'gen' | 'dent' | 'phar'

export type TDropdownProps<T = string> = { value: T, label: string }