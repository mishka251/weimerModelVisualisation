/// <reference types="arcgis-js-api" />
import { Vue } from "vue-property-decorator";
import Color from "esri/Color";
interface ColorInfo {
    color: Color;
    caption: string;
}
export default class ColorBar extends Vue {
    colors: Color[];
    breaks: number[];
    get colorItems(): ColorInfo[];
}
export {};
