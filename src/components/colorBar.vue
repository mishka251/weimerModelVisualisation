<template>
    <div class="colorBar">
        <div class="d-flex flex-row justify-content-between" style="width: 100%" v-for="colorInfo of colorItems">
            <div class="colorBar-color" :style="{'background-color': colorInfo.color}"></div>
            <div class="colorBar-item"> {{colorInfo.caption}}</div>
        </div>
        <!--        <div class="colorBar-color" :style="{'background-color': colors[0]}"></div>-->
        <!--        <div v-for="(_break, index) of breaks">-->
        <!--            <div class="colorBar-item"> {{_break}}</div>-->
        <!--            <div class="colorBar-color" :style="{'background-color': colors[index+1]}"></div>-->
        <!--        </div>-->

    </div>
</template>

<script lang="ts">
    import {Prop, Component, Vue} from "vue-property-decorator";
    import Color from "esri/Color";

    interface ColorInfo {
        color: Color,
        caption: string;
    }

    @Component
    export default class ColorBar extends Vue {
        @Prop({type: Array, required: true}) colors: Color[];
        @Prop({type: Array, required: true}) breaks: number[];

        get colorItems(): ColorInfo[] {
            const array: ColorInfo[] = [{color: this.colors[0], caption: `>${this.breaks[0]}`}];
            const last: number = this.colors.length - 1;
            for (let i = 1; i < last; i++) {
                array.push({color: this.colors[i], caption: `${this.breaks[i]} — ${this.breaks[i - 1]}`})
            }

            array.push({color: this.colors[last], caption: `< ${this.breaks[last - 1]}`});
            return array;
        }

        toARGB(color: Color): string {
            return `${color.r}${color.g}${color.b}`;
        }

    }
</script>

<style scoped>
    .colorBar {
        display: flex;
        flex-direction: column;
        width: 140px
    }

    .colorBar-color {
        height: 23px;
        width: 23px;
    }

    .colorBar-item {

    }
</style>