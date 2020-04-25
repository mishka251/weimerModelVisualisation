import { Vue } from 'vue-property-decorator';
export default class TimeInput extends Vue {
    readonly format: string;
    protected label: string;
    protected _value: Date;
    get string_data(): string;
    set string_data(value: string);
    protected id: string;
}
