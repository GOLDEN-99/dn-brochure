import { computed, Signal, WritableSignal } from "@angular/core";

export const generateSelector = <T extends Record<string, unknown>>(sig: Signal<T>) =>
    <K extends keyof T>(key: K): Signal<T[K]> => computed(() => sig()[key])

export const generateUpdateState = <T extends Record<string, unknown>>(sig: WritableSignal<T>) =>
    <K extends keyof T>(key: K) => (value: T[K]) => sig.update(prev => ({ ...prev, [key]: value }))

export const mapState = <T extends Record<string, unknown>>(sig: WritableSignal<T>) =>
    <K extends keyof T>(key: K): [Signal<T[K]>, (value: T[K]) => void] =>
        [computed(() => sig()[key]), (value: T[K]) => sig.update(prev => ({ ...prev, [key]: value }))]

type TPredicateFn<T> = (value: T, id?: number) => boolean
type MapperFn<T> = (value: T, id?: number) => T