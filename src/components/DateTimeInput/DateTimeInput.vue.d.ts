import AbstractTimeInput from "../BaseComponents/DateTimeInputs/AbstractTimeInput";
export default class DateTimeInput extends AbstractTimeInput {
    mounted(): void;
    protected label: string;
    protected _value: Date;
    protected id: string;
}
