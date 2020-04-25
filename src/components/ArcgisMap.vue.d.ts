/// <reference types="arcgis-js-api" />
import SceneView from 'esri/views/SceneView';
import { Vue } from "vue-property-decorator";
import Camera from 'esri/Camera';
import { FeatureCollection, Polygon as turfPolygon } from '@turf/turf';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Color from 'esri/Color';
export default class ArcgisMap extends Vue {
    view: SceneView | null;
    camera: Camera;
    polygons: FeatureCollection<turfPolygon>;
    time: Date;
    colors: Color[];
    breaks: number[];
    getColor2(value: number): Color;
    setLayer(): void;
    get polygonsLayer(): GraphicsLayer;
    layer: GraphicsLayer;
    mounted(): void;
    beforeDestroy(): void;
}
