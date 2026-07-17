import { Injectable } from "@angular/core";
import { NgbTimeAdapter, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";


const twoDigitString = (time: number) => time >= 10 ? String(time) : String(time).padStart(2, '0')

@Injectable()
export class NgbTimeStringAdaptor extends NgbTimeAdapter<string> {
    override fromModel(value: string | null): NgbTimeStruct | null {
        if (!value) return null
        const [hh, mm, ss] = value.split(':').map((time) => Number.parseInt(time))
        return {
            hour: hh,
            minute: mm,
            second: ss
        }
    }
    override toModel(time: NgbTimeStruct | null): string | null {
        if (!time) return null
        const { hour, minute, second } = time
        return `${twoDigitString(hour)}:${twoDigitString(minute)}:${twoDigitString(second)}`
    }
}

@Injectable()
export class NgbTimeSecondAdaport extends NgbTimeAdapter<number> {
    override fromModel(value: number | null): NgbTimeStruct | null {
        if (value === null) return null
        if (value < 0) return null
        if (value > 60 * 60 * 24) return null
        const raw = value / 3600
        return {
            hour: Math.floor(raw),
            minute: Math.floor(raw * 60),
            second: value % 60
        }
    }
    override toModel(time: NgbTimeStruct | null): number | null {
        if (time === null) return null
        const { hour, minute, second } = time
        return hour * 3600 + minute * 60 + second
    }
}