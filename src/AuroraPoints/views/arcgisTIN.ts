import Map from "esri/Map";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneView from "esri/views/SceneView";
import MapView from "esri/views/MapView";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import MapViewConstraints = __esri.MapViewConstraints;

import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import Color from "esri/Color";
import PopupTemplate from "esri/PopupTemplate";

import FieldInfo from "esri/popup/FieldInfo";
import PopupContent from "esri/popup/content/Content";
import FieldsContent from "esri/popup/content/FieldsContent";

import Camera from "esri/Camera";
import Polygon from "esri/geometry/Polygon";
import Legend from "esri/widgets/Legend";
import ColorStop from "esri/renderers/visualVariables/support/ColorStop";

import {AuroraPoint} from "../Model";
import {
    FeatureCollection,
    Polygon as turfPolygon,
    MultiLineString
} from "@turf/helpers";
import LineSymbol from "esri/symbols/LineSymbol3D";
import AbstractView from "./abstractView";
import ColorSlider from "esri/widgets/smartMapping/ColorSlider";

import AuroraPointsModel from "../Model";

type Type = 'epot' | 'mpfac';

export default class ArcgisView extends AbstractView {
    map: Map;
    // markerLayer: GraphicsLayer;
    view: SceneView;
    constraints: MapViewConstraints;
    container: string;
    camera: Camera;

    isolines: GraphicsLayer;

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
        this.map = new Map({
            basemap: "hybrid"
        });
        //  this.markerLayer = new GraphicsLayer();
        this.isolines = new GraphicsLayer();
        // this.map.add(this.markerLayer);
        this.map.add(this.isolines);

        this.camera = new Camera({
            position: {
                latitude: 89,
                longitude: 0,
                z: 20_000_000,
                hasZ: true,
            },
            // tilt:45,
            //heading:90,

        });

        this.view = new SceneView({
            container: this.container,
            map: this.map,
            zoom: 5,
            camera: this.camera,
            //center: [54.7249, 55.9425]
        });

        this.constraints = {
            minZoom: 3
        };

        // const legent = new Legend({
        //     view: this.view,
        //     layerInfos: [{
        //         layer: this.isolines,
        //         title: 'Legend'
        //     }]
        // });

        //this.view.ui.add(legent, 'bottomleft');
        this.view.constraints = this.constraints;

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

    // getColor(val: number, min: number, max: number): Color {
    //     let rate = (val - min) / (max - min);
    //     if (rate < 0.2) {
    //         return new Color("blue");
    //     }
    //     if (rate < 0.4) {
    //         return new Color("green");
    //     }
    //     if (rate < 0.6) {
    //         return new Color("yellow");
    //     }
    //     if (rate < 0.8) {
    //         return new Color("orange");
    //     }
    //     return new Color("red");
    // }

    renderPoints(model: AuroraPointsModel) {
        const points: AuroraPoint[] = model.points;
        const min: number = model.min;
        const max: number = model.max;
        const type: string = model.type;
        const isolines: FeatureCollection<MultiLineString> = model.isolines;
        const tins: FeatureCollection<turfPolygon> = model.tins;
        const time: Date = model.time;

        const hours: number = time.getHours();
        console.log(hours);
        const deltaLongitude: number = (hours - 12) * 15;
        const cameraLatitude: number = deltaLongitude >= 0 ? deltaLongitude : 360 + deltaLongitude;
        this.camera.position.longitude = cameraLatitude;
        this.view.goTo(this.camera);
        console.log(this.view.camera.position);
        // this.markerLayer.removeAll();
        this.isolines.removeAll();
        for (const point of points) {
            let val: number = point.value;


            let color: Color = this.getColor2(val, type);
            const symbol: SimpleMarkerSymbol = new SimpleMarkerSymbol({
                style: "circle",
                color: color,
                size: 6  // pixels
            });


            const latitudeFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "lat",
                label: "latitude"
            });

            const longitudeFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "lng",
                label: "longitude"
            });

            const valueFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "value",
                label: "value"
            });

            const fieldInfos: FieldInfo[] = [latitudeFieldInfo, longitudeFieldInfo, valueFieldInfo];

            const content: FieldsContent = new FieldsContent({
                fieldInfos: fieldInfos
            });

            const contents: PopupContent[] = [content];

            const popupTemplate: PopupTemplate = new PopupTemplate({
                title: type + " point",
                content: contents
            });

            let _point: Point = new Point(
                {
                    latitude: point.latitude,
                    longitude: point.longitude
                });

            let graphics: Graphic = new Graphic({
                geometry: _point,
                symbol: symbol,
                popupTemplate: popupTemplate,
                attributes: {
                    lat: point.latitude,
                    lng: point.longitude,
                    value: point.value
                }

            });

            //this.markerLayer.add(graphics);
        }

        const polygons = tins.features.map<Graphic>((feature) => {
            //console.log(feature.geometry.coordinates[0]);

            const polygon = new Polygon({
                rings: feature.geometry.coordinates
            });


            const param = (feature.properties.a + feature.properties.b + feature.properties.c) / 3;

            const fillSymbol = {
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: this.getColor2(param, type),
                outline: {
                    // autocasts as new SimpleLineSymbol()
                    //color: this.getColor2(param, "epot"),
                    width: 0
                }
            };
            return new Graphic({
                geometry: polygon,
                symbol: fillSymbol
            });
        });

        const breaks = type === "epot" ? this.epotBreaks : this.mpfacBreaks;
        const stops: ColorStop[] = [];
        for (let i = 0; i < breaks.length; i++) {
            stops.push(new ColorStop({
                color: this.colors[i],
                label: 'No label',
                value: breaks[i]
            }));
        }


        const slider = new ColorSlider({
            container: "sliderDiv",
            min: min,
            max: max,
            stops: stops
        });

        console.log(slider);

        this.view.ui.add(slider, 'bottomleft');
        polygons.filter((polygon) => {
            return polygon != null;
        });

        polygons.forEach((polygon) => {
            this.isolines.add(polygon);
        });
    }
}
