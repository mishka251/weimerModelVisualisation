<template>
    <div class="DateWidget">
        <div :class="{'ui-datepicker':true,  'ui-simple-input_has-text':_value!=null}">
            <div class="ui-simple-input__control-wrapper">
                <input
                        type="text"
                        class="ui-simple-input__control"
                        v-model="str_value"
                        :name="id"
                        :id="id"
                        pattern="([0-2][1-9]|3[0-1])/0[0-9]|1[1-2]/\d{4}"
                        @click="changeVisible"
                >

                <label class="ui-simple-input__label" :for="id">{{label}}</label>
                <a href="#" class="ui-simple-input__btn" @click="changeVisible">
                    <span class="ui-datepicker__icon" title="Date"></span>
                </a>

                <div class="date-picker" v-show="widget_visible()">

                    <div class="date-picker__month-selection">
                        <a @click="prevMonth" href="#" class="date-picker__change-month">
                            <img src="/static/img/icon-previous.svg" alt="">
                        </a>
                        {{nowMonth()}}
                        <a @click="nextMonth" href="#" class="date-picker__change-month">
                            <img src="/static/img/icon-next.svg" alt="">
                        </a>
                    </div>

                    <table class="date-picker__day-selection">
                        <thead>
                        <tr class="date-picker__weekday-names">
                            <td v-for="week_day in week_days" class="date-picker__day">
                                {{week_day}}
                            </td>
                        </tr>

                        </thead>
                        <tbody>
                        <tr v-for="week in getTable()" class="date-picker__weekdays">
                            <DateWidgetDay v-for="day in week"
                                           :is-active="isActive(day)"
                                           :day="day.day"
                                           :is-off="day.isOff"
                                           :in-current-month="day.inCurrentMonth"
                                           @click="onClick"
                                           :key="day.day"
                            >
                                {{day.day}}

                            </DateWidgetDay>
                        </tr>
                        </tbody>
                    </table>
                    <div class="date-picker__shortcuts">
                        <a @click="setYesterday" class="shortcuts__link" href="#">Вчера</a>
                        |
                        <a @click="setToday" class="shortcuts__link" href="#">Сегодня</a>
                        |
                        <a @click="setTomorrow" class="shortcuts__link" href="#">Завтра</a>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
    import {Component, Prop, PropSync} from 'vue-property-decorator'

    import parse from "date-fns/parse";
    import DayData from "./DayData";
    import BaseDateInput from "../BaseComponents/DateTimeInputs/BaseDateInput";
    import {
        setDate,
        getDate,
        startOfWeek,
        endOfWeek,
        addDays,
        format,
        isValid,
        getYear,
        getMonth,
        setYear,
        setMonth
    } from "date-fns";
    import subMonths from 'date-fns/subMonths';
    import addMonths from 'date-fns/addMonths';
    import startOfMonth from 'date-fns/startOfMonth';
    import endOfMonth from 'date-fns/endOfMonth';
    import differenceInWeeks from 'date-fns/differenceInWeeks'
    import ru from "date-fns/locale/ru";

    enum WeekDays {Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday}

    import DateWidgetDay from "./DateWidgetDay/DateWidgetDay.vue";

    @Component({
        components: {
            DateWidgetDay
        }
    })
    export default class DateWidgetInput extends BaseDateInput {
        readonly format: string = "dd/MM/yyyy";
        isVisible = false;

        week_days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
        @Prop({
            type: String,
            required: true
        }) protected label!: string;

        @PropSync('value', {
            type: Date,
        }) protected _value!: Date;

        changeVisible() {
            this.isVisible = !this.isVisible;
        }

        nextMonth() {
            this._value = addMonths(this._value, 1);
        }

        prevMonth() {
            this._value = subMonths(this._value, 1);
        }

        widget_visible(): boolean {
            return this.isVisible;
        }


        getTable(): DayData[][] {
            let firstDayMonth: Date = startOfMonth(this._value);
            let lastDayMonth: Date = endOfMonth(this._value);
            let firstDayTable: Date = startOfWeek(firstDayMonth, {weekStartsOn: WeekDays.Monday});
            let lastDayTable: Date = endOfWeek(lastDayMonth, {weekStartsOn: WeekDays.Monday});

            let weeksCnt: number = Math.abs(differenceInWeeks(firstDayTable, lastDayTable)) + 1;

            let arr: DayData[][] = new Array(weeksCnt);
            let day = firstDayTable;
            for (let weekNum = 0; weekNum < weeksCnt; weekNum++) {
                arr[weekNum] = new Array(7);
                for (let weekDay = 0; weekDay < 7; weekDay++) {
                    const inMonth: boolean = firstDayMonth <= day && day <= lastDayMonth;
                    const isOff: boolean = weekDay >= 5;
                    arr[weekNum][weekDay] = new DayData(getDate(day), inMonth, isOff);
                    day = addDays(day, 1);
                }
            }

            return arr;
        }

        onClick(day: number) {
            console.log('on click');
            console.log(day);
            this._value = setDate(this._value, day);

        }

        nowMonth() {
            return format(this._value, "MMMM yyyy", {locale: ru});
        }

        isActive(day: DayData): boolean {
            return day.inCurrentMonth && day.day == getDate(this._value);
        }

        get str_value() {
            return format(this._value, this.format);
        }

        set str_value(value: string) {
            try {
                console.log(value);
                if (value.length != this.format.length) {
                    return;
                }
                const new_value = parse(value, this.format, this._value);
                console.log(new_value);
                if (isValid(new_value)) {
                    this._value = setDate(this._value, getDate(new_value));
                    this._value = setMonth(this._value, getMonth(new_value));
                    this._value = setYear(this._value, getYear(new_value));
                }
            } catch (e) {
                console.error(e);
            }
        }

        setToday(e: Event) {
            this._value = new Date();
        }

        setTomorrow(e: Event) {
            console.log('set tomorrow');
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this._value = tomorrow;
        }

        setYesterday(e: Event) {
            console.log('set yesterday');
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this._value = yesterday;
        }

        @Prop({
            type: String,
            required: true
        }) protected id!: string;
    }


</script>

<style scoped>

</style>