import { Vue } from 'vue-property-decorator';
export default class BaseInput<ValueType> extends Vue {
    protected _value: ValueType | null;
    protected label: string;
}
