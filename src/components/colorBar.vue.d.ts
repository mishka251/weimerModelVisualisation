/// <reference types="arcgis-js-api" />
import { Vue } from "vue-property-decorator";
import Color from "esri/Color";
export default class ColorBar extends Vue {
    colors: Color[];
    breaks: number[];
    toARGB(color: Color): string;
}
