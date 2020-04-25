/// <reference types="arcgis-js-api" />
/// <reference types="lodash" />
import { Vue } from "vue-property-decorator";
import IItem from "./BaseComponents/IItem";
import { Polygon } from "@turf/turf";
import { FeatureCollection } from '@turf/helpers';
import Color = require("esri/Color");
export interface AuroraPoint {
    latitude: number;
    longitude: number;
    value: number;
}
export default class Root extends Vue {
    possibleTypes: IItem[];
    type: IItem;
    dateTime: Date;
    beforeMount(): void;
    isPreloaderVisible: boolean;
    get breaks(): number[];
    url: string;
    readonly colors: Color[];
    readonly epotBreaks: number[];
    readonly mpfacBreaks: number[];
    points: FeatureCollection<Polygon>;
    debouncedLoadPoints: (() => Promise<void>) & import("lodash").Cancelable;
    loadPoints(): Promise<void>;
}
