<template>
    <td :class="{
     'date-picker__day':true,
     'date-picker__day_disable':!inCurrentMonth,
     'date-picker__day_active':isActive,
     'date-picker__day_off':isOff
      }"
        @click="onClick"
    >
        {{day}}
    </td>
</template>

<script lang="ts">
    import {Vue, Component, Prop} from "vue-property-decorator";

    @Component({})
    export default class DateWidgetDay extends Vue {

        @Prop() isActive!: boolean;
        @Prop() inCurrentMonth!: boolean;
        @Prop() isOff!: boolean;
        @Prop() day!: number;

        onClick(event: Event) {
            event.preventDefault();
            if (!this.inCurrentMonth) {
                return;
            }
            this.$emit('click', this.day);
        }
    }
</script>

<style scoped>

</style>