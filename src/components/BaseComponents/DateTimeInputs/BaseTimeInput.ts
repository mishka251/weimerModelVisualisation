import {Component, Prop} from 'vue-property-decorator';

import AbstractTimeInput from "./AbstractTimeInput";

@Component({})
export default class BaseTimeInput extends AbstractTimeInput {
    readonly format: string = "HH:mm";
        @Prop({
        type:String,
        default:()=>''
    })
    userDateFormat!:string;
    readonly invalid_message: string = "Время должно быть правильным и в формате часы:минуты";
}