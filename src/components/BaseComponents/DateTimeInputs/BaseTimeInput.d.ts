import AbstractTimeInput from "./AbstractTimeInput";
export default class BaseTimeInput extends AbstractTimeInput {
    readonly format: string;
    userDateFormat: string;
    readonly invalid_message: string;
}
