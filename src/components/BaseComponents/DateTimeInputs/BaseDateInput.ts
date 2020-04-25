import {Component} from 'vue-property-decorator';

import AbstractTimeInput from "./AbstractTimeInput";

@Component
export default class BaseDateInput extends AbstractTimeInput {
    readonly format: string = "yyyy-MM-dd";
    readonly invalid_message: string = "Дата должна быть правильной и в формате год-месяц-день";
}