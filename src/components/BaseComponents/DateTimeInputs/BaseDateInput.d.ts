import AbstractTimeInput from "./AbstractTimeInput";
export default class BaseDateInput extends AbstractTimeInput {
    readonly format: string;
    readonly invalid_message: string;
}
