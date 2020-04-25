import { Vue } from "vue-property-decorator";
import IItem from "../BaseComponents/IItem";
export default class RadioButtonsField extends Vue {
    protected _value: IItem | null;
    PossibleValues: IItem[];
    protected label: string;
    protected id: string;
}
