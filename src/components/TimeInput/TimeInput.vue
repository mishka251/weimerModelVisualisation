<template>

    <div :class="{'ui-timepicker':true, 'ui-simple-input_has-text':_value!=null}">
        <div class="ui-simple-input__control-wrapper">

            <input type="time"
                   class="ui-simple-input__control"
                   :name="id"
                   v-model="string_data"
                   placeholder="00:00"
                   pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                   :id="id"
            >
            <label class="ui-simple-input__label" :for="id">{{label}}</label>
            <span class="ui-simple-input__btn">
                    <i class="ui-timepicker__icon far fa-clock"></i>
                </span>

        </div>
    </div>

</template>

<script lang="ts">
    import {Component, Prop, PropSync, Vue} from 'vue-property-decorator'
    import parse from "date-fns/parse";
    import format from 'date-fns/format';


    @Component
    export default class TimeInput extends Vue {
        readonly format: string = "HH:mm";
        @Prop({
            type: String,
            required: true
        }) protected label!: string;

        @PropSync('value', {
            type: Date,
        }) protected _value!: Date;

        get string_data(): string {
            return format(this._value, this.format);
        }

        set string_data(value: string) {
            this._value = parse(value, this.format, this._value);
        }

        @Prop({
            type: String,
            required: true
        }) protected id!: string;
    }
</script>

<style scoped>

</style>