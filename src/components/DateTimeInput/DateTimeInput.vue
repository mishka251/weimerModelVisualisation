<template>

    <div class="DateTimeInput form-group">

        <div class="form-group">
            <div class="datetime-group">
                <label class="datetime-group__label">{{label}}</label>
                <div class="datetime-group__control-wrapper">

                    <DateWidgetInput
                            :value.sync="_value"
                            :id="id+'_date'"
                            label="Date"
                    ></DateWidgetInput>

                    <div class="datetime-group__divider"></div>
                    <TimeInput
                            :value.sync="_value"
                            :id="id+'_time'"
                            label="Time"
                    ></TimeInput>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">

    import {Component, Prop, PropSync} from 'vue-property-decorator';

    import AbstractTimeInput from "../BaseComponents/DateTimeInputs/AbstractTimeInput";
    import DateWidgetInput from "../DateWidgetInput/DateWidgetInput.vue";
    import TimeInput from "../TimeInput/TimeInput.vue";

    @Component({
        components: {DateWidgetInput, TimeInput}
    })
    export default class DateTimeInput extends AbstractTimeInput {
        mounted() {
        }

        @Prop({
            type: String,
            required: true
        }) protected label!: string;


        @PropSync('value', {
            type: Date,
        }) protected _value!: Date;

        @Prop({
            type: String,
            default: () => '',
        })


        @Prop({
            type: String,
            required: true
        }) protected id!: string;
    }
</script>

<style scoped>

</style>