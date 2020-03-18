<template>
    <div class="colorBar">

        <div class="colorBar-color" :style="{'background-color': colors[0]}"></div>
        <div v-for="(_break, index) of breaks">
            <div class="colorBar-item"> {{_break}}</div>
            <div class="colorBar-color" :style="{'background-color': colors[index+1]}"></div>
        </div>

    </div>
</template>

<script lang="ts">
    import {Prop, Component, Vue} from "vue-property-decorator";
    import Color from "esri/Color";

    @Component
    export default class ColorBar extends Vue {
        @Prop({type: Array, required: true}) colors: Color[];
        @Prop({type: Array, required: true}) breaks: number[];

        toARGB(color: Color): string {
            return `${color.r}${color.g}${color.b}`;
        }

    }
</script>

<style scoped>
    .colorBar {
        display: flex;
        flex-direction: column;
        width: 20px
    }

    .colorBar-color {
        height: 35px;
    }

    .colorBar-item {
        position: absolute;
        padding-left: 20px;
    }
</style>