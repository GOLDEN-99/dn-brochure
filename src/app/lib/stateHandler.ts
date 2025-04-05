import { computed, Signal, WritableSignal } from "@angular/core";

export const generateSelector = <T extends Record<string, unknown>>(sig: Signal<T>) =>
    (key: string) => computed(() => sig()[key])
export const generateUpdateState = <T extends Record<string, unknown>>(sig: WritableSignal<T>) =>
    <K extends keyof T>(key: K) => (value: T[K]) => sig.update(prev => ({ ...prev, [key]: value }))