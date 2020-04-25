<template>
    <div class="ui-block-radio">
        <label> {{label}}</label>
        <div class="ui-check-element ui-block-radio__element " v-for="(value, index) of PossibleValues">

            <input
                    :id="'radio'+id+value.id"
                    class="ui-check-element__input"
                    type="radio"
                    :name="id"
                    :value="value"
                    v-model="_value">
            <label
                    class="ui-check-element__label"
                    :for="'radio'+id+value.id">
                {{value.caption}}
            </label>

        </div>
    </div>

</template>

<script lang="ts">
    import {Component, PropSync, Prop, Vue} from "vue-property-decorator";
    import IItem from "../BaseComponents/IItem";

    @Component({})
    export default class RadioButtonsField extends Vue {
        @PropSync('value', {
            type: Object,
        }) protected _value!: IItem | null;

        @Prop({
            type: Array,
            required: true,
        }) PossibleValues!: IItem[];

        @Prop({
            type: String,
            required: true
        }) protected label!: string;

                @Prop({
            type: String,
            required: true
        }) protected id!: string;

    }

</script>