import {Vue} from 'vue-property-decorator';

import {Component, Prop, PropSync} from 'vue-property-decorator';


@Component({
})
export default class BaseInput<ValueType> extends Vue {
    @PropSync('value', {
    }) protected _value!: ValueType | null;


    @Prop({
        type: String,
        required: true
    }) protected label!: string;
}
