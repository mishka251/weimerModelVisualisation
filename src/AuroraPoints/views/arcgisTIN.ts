import Map from "esri/Map";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneView from "esri/views/SceneView";
import Graphic from "esri/Graphic";
import Color from "esri/Color";


import Camera from "esri/Camera";
import Polygon from "esri/geometry/Polygon";
import DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D";
import {
    FeatureCollection,
    Polygon as turfPolygon,
    Feature
} from "@turf/helpers";
import AbstractView from "./abstractView";

import AuroraPointsModel from "../Model";

type Type = 'epot' | 'mpfac';

import ColorBar from "../../components/colorBar.vue";

export default class ArcgisView extends AbstractView {
    map: Map;
    view: SceneView;
    container: string;
    camera: Camera;

    isolines: GraphicsLayer;
    colorBar: ColorBar;

    readonly colors: Color[] = [
        new Color([225, 0, 225, 0.9]),
        new Color([0, 0, 255, 0.8]),
        new Color([0, 255, 255, 0.6]),
        new Color([0, 255, 0, 0.4]),
        new Color([0, 255, 0, 0.2]),
        new Color([0, 255, 0, 0.0]),
        new Color([0, 255, 0, 0.2]),
        new Color([0, 255, 0, 0.4]),
        new Color([255, 255, 0, 0.6]),
        new Color([255, 165, 0, 0.8]),
        new Color([255, 36, 0, 0.9])
    ];
    readonly epotBreaks = [
        -30,
        -20,
        -10,
        -7,
        -3,
        3,
        7,
        10,
        20,
        30
    ];

    readonly mpfacBreaks = [
        -1,
        -0.5,
        -0.3,
        -0.2,
        -0.1,
        0.1,
        0.2,
        0.3,
        0.5,
        1
    ];

    constructor(container: string, onLoad: () => void) {
        super(container, onLoad);
        this.container = container;

        this.colorBar = new ColorBar({
            el: "#sliderDiv",
            propsData: {
                colors: [],
                breaks: []
            }
        });

        this.map = new Map({
            basemap: "hybrid",
            ground: "world-elevation",
        });
        this.isolines = new GraphicsLayer();
        this.map.add(this.isolines);

        this.camera = new Camera({
            position: {
                latitude: 89,
                longitude: 0,
                z: 20_000_000,
                hasZ: true,
            },

        });

        this.view = new SceneView({
            container: this.container,
            map: this.map,
            zoom: 5,
            camera: this.camera,
            qualityProfile: "high",
            alphaCompositingEnabled: true,
            highlightOptions: {
                fillOpacity: 0,
                color: "#ffffff"
            },
        });

        this.view.ui.empty('top-left');

        const measure3d = new DirectLineMeasurement3D({
            view:this.view
        });
        this.view.ui.add(measure3d, 'top-right');

        this.view.when()
            .then(onLoad);
    }


    getColor2(value: number, type: Type | string): Color {

        const breaks = type === "epot" ? this.epotBreaks : this.mpfacBreaks;
        console.assert(this.colors.length == breaks.length + 1);
        if (value < breaks[0]) {
            return this.colors[0];
        }
        for (let i = 1; i < breaks.length; i++) {
            if (breaks[i - 1] <= value && value <= breaks[i]) {
                return this.colors[i];
            }
        }

        return this.colors[this.colors.length - 1];

    }


    renderPoints(model: AuroraPointsModel) {
        const type: string = model.type;
        const tins: FeatureCollection<turfPolygon> = model.tins;
        const time: Date = model.time;

        const hours: number = time.getHours();
        console.log(hours);
        const deltaLongitude: number = (hours - 12) * 15;
        const cameraLatitude: number = deltaLongitude >= 0 ? deltaLongitude : 360 + deltaLongitude;
        this.camera.position.longitude = cameraLatitude;
        this.view.goTo(this.camera);


        let polygons = tins.features.map<Graphic>((feature:Feature<turfPolygon>) => {

            const polygon = new Polygon({
                rings: feature.geometry.coordinates
            });


            const param = (feature.properties.a + feature.properties.b + feature.properties.c) / 3;

            const fillSymbol = {
                type: "simple-fill",
                color: this.getColor2(param, type),
                outline: {
                    width: 0
                }
            };
            return new Graphic({
                geometry: polygon,
                symbol: fillSymbol
            });
        });

        const breaks = type === "epot" ? this.epotBreaks : this.mpfacBreaks;


        const visibleBreaks: number[] = [];
        const visibleColor: Color[] = [this.colors[0]];
        for (let i = 1; i < this.colors.length; i++) {
            if (this.colors[i].a > 0.3) {
                visibleBreaks.push(breaks[i - 1]);
                visibleColor.push(this.colors[i]);
            }
        }
        this.colorBar.$set(this.colorBar, 'breaks', visibleBreaks);
        this.colorBar.$set(this.colorBar, 'colors', visibleColor);

       polygons = polygons.filter((polygon) => {
            return polygon != null;
        });

        polygons.forEach((polygon) => {
            this.isolines.add(polygon);
        });
    }
}
