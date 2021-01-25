/// <reference types="arcgis-js-api" />
import Map from "esri/Map";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneView from "esri/views/SceneView";
import Color from "esri/Color";
import Camera from "esri/Camera";
import AbstractView from "./abstractView";
import AuroraPointsModel from "../Model";
declare type Type = 'epot' | 'mpfac';
import ColorBar from "../../components/colorBar.vue";
export default class ArcgisView extends AbstractView {
    map: Map;
    view: SceneView;
    container: string;
    camera: Camera;
    isolines: GraphicsLayer;
    colorBar: ColorBar;
    readonly colors: Color[];
    readonly epotBreaks: number[];
    readonly mpfacBreaks: number[];
    constructor(container: string, onLoad: () => void);
    getColor2(value: number, type: Type | string): Color;
    renderPoints(model: AuroraPointsModel): void;
}
export {};
