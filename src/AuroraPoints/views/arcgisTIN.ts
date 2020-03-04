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


import Polygon from "esri/geometry/Polygon";

import {AuroraPoint} from "../Model";
import {
    FeatureCollection,
    Polygon as turfPolygon,
    MultiLineString
} from "@turf/helpers";
import LineSymbol from "esri/symbols/LineSymbol3D";
import AbstractView from "./abstractView";

type Type = 'epot' | 'mpfac';

export default class ArcgisView extends AbstractView {
    map: Map;
    markerLayer: GraphicsLayer;
    view: SceneView | MapView;
    constraints: MapViewConstraints;
    container: string;

    isolines: GraphicsLayer;

    constructor(container: string, onLoad: () => void) {
        super(container, onLoad);
        this.container = container;
        this.map = new Map({
            basemap: "hybrid"
        });
        this.markerLayer = new GraphicsLayer();
        this.isolines = new GraphicsLayer();
        this.map.add(this.markerLayer);
        this.map.add(this.isolines);

        this.view = new SceneView({
            container: this.container,
            map: this.map,
            zoom: 5,
            center: [54.7249, 55.9425]
        });

        this.constraints = {
            minZoom: 3
        };

        this.view.constraints = this.constraints;

        this.view.when(onLoad);
    }


    getColor2(value: number, type: Type|string): Color {
        const colors: Color[] = [
            new Color([0, 0, 180, 0.9]),
            new Color([0, 0, 255, 0.7]),
            new Color([0, 255, 0, 0.5]),
            new Color([255, 255, 0, 0.3]),
            new Color([255, 200, 0, 0.5]),
            new Color([255, 0, 0, 0.7]),
            new Color([180, 0, 0, 0.9])
        ];
        const epotBreaks = [
            -30,
            -20,
            -10,
            10,
            20,
            30
        ];

        const mpfacBreaks = [
            -1,
            -0.5,
            -0.3,
            0.3,
            0.5,
            1
        ];

        const breaks = type === "epot" ? epotBreaks : mpfacBreaks;

        if (value < breaks[0]) {
            return colors[0];
        }
        for (let i = 1; i < breaks.length; i++) {
            if (breaks[i - 1] <= value && value <= breaks[i]) {
                return colors[i];
            }
        }

        return colors[colors.length - 1];

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

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string,
                 isolines: FeatureCollection<MultiLineString>,
                 tins: FeatureCollection<turfPolygon>
    ) {
        this.markerLayer.removeAll();
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

        polygons.filter((polygon) => {
            return polygon != null;
        });

        polygons.forEach((polygon) => {
            this.isolines.add(polygon);
        });
    }

    //
    // switch_2d3d(use2d: boolean) {
    //     const zoom: number = this.view.zoom;
    //     const center: Point = this.view.center;
    //
    //     if (use2d) {
    //         this.view = new MapView({
    //             container: this.container,
    //             map: this.map,
    //             zoom: zoom,
    //             center: center
    //         });
    //     } else {
    //         this.view = new SceneView({
    //             container: this.container,
    //             map: this.map,
    //             zoom: zoom,
    //             center: center
    //         });
    //     }
    //     this.view.constraints = this.constraints;
    // }
}
