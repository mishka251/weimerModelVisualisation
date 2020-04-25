import DayData from "./DayData";
import BaseDateInput from "../BaseComponents/DateTimeInputs/BaseDateInput";
export default class DateWidgetInput extends BaseDateInput {
    readonly format: string;
    isVisible: boolean;
    week_days: string[];
    protected label: string;
    protected _value: Date;
    changeVisible(): void;
    nextMonth(): void;
    prevMonth(): void;
    widget_visible(): boolean;
    getTable(): DayData[][];
    onClick(day: number): void;
    nowMonth(): string;
    isActive(day: DayData): boolean;
    get str_value(): string;
    set str_value(value: string);
    setToday(e: Event): void;
    setTomorrow(e: Event): void;
    setYesterday(e: Event): void;
    protected id: string;
}
