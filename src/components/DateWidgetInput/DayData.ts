 export default class DayData {
        public day: number;
        public inCurrentMonth: boolean;
        public isOff: boolean;

        public constructor(num: number, in_month: boolean, isOff: boolean) {
            this.day = num;
            this.inCurrentMonth = in_month;
            this.isOff = isOff;
        }
    }