import { Vue } from "vue-property-decorator";
export default class DateWidgetDay extends Vue {
    isActive: boolean;
    inCurrentMonth: boolean;
    isOff: boolean;
    day: number;
    onClick(event: Event): void;
}
