import {Component, Prop, PropSync} from 'vue-property-decorator';
import BaseInput from '../BaseInput';


@Component({
})
export default class AbstractTimeInput extends BaseInput<Date> {
    @PropSync('value', {
        type: Date,
    }) protected _value!: Date;


}
