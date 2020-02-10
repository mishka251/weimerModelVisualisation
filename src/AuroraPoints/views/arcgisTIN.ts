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
            basemap: "gray"
        });
        this.markerLayer = new GraphicsLayer();
        this.isolines = new GraphicsLayer();
        this.map.add(this.markerLayer);
        this.map.add(this.isolines);

        this.view = new SceneView({
            //view = new MapView({
            alphaCompositingEnabled: true,
            environment: {
                background: {
                    type: "color",
                    color: [0, 0, 0, 0]
                },
                starsEnabled: false,
                atmosphereEnabled: false,
            },
            highlightOptions: {
                color: [255, 255, 0, 1],
                haloColor: new Color("white"),
                haloOpacity: 0.,
                fillOpacity: 0.
            },
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


    getColor(val: number, min: number, max: number): Color {
        let rate = (val - min) / (max - min);
        if (rate < 0.2) {
            return new Color("blue");
        }
        if (rate < 0.4) {
            return new Color("green");
        }
        if (rate < 0.6) {
            return new Color("yellow");
        }
        if (rate < 0.8) {
            return new Color("orange");
        }
        return new Color("red");
    }

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string,
                 isolines: FeatureCollection<MultiLineString>,
                 tins: FeatureCollection<turfPolygon>
    ) {
        this.markerLayer.removeAll();
        this.isolines.removeAll();
        for (const point of points) {
            let val: number = point.value;


            let color: Color = this.getColor(val, min, max);
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

            this.markerLayer.add(graphics);
        }

        const polygons = tins.features.map<Graphic>((feature) => {
            console.log(feature.geometry.coordinates[0]);

            const polygon = new Polygon({
                rings: feature.geometry.coordinates
            });


            const param = (feature.properties.a + feature.properties.b + feature.properties.c) / 3;

            const fillSymbol = {
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: this.getColor(param, min, max),
                outline: {
                    // autocasts as new SimpleLineSymbol()
                    color: this.getColor(param, min, max),
                    width: 1
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
        })
    }


    switch_2d3d(use2d: boolean) {
        const zoom: number = this.view.zoom;
        const center: Point = this.view.center;

        if (use2d) {
            this.view = new MapView({
                container: this.container,
                map: this.map,
                zoom: zoom,
                center: center
            });
        } else {
            this.view = new SceneView({
                container: this.container,
                map: this.map,
                zoom: zoom,
                center: center
            });
        }
        this.view.constraints = this.constraints;
    }
}