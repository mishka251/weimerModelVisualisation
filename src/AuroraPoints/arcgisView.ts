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
import FieldInfoFormat from "esri/popup/support/FieldInfoFormat";
import PopupContent from "esri/popup/content/Content";
import FieldsContent from "esri/popup/content/FieldsContent";

//import dojo from "dojo";

import {AuroraPoint} from "./Model"

export default class ArcgisView {
    map: Map;
    markerLayer: GraphicsLayer;
    view: SceneView | MapView;
    constraints: MapViewConstraints;
    container: string;

    constructor(container: string, onLoad: () => void) {
        this.container = container;
        this.map = new Map({
            basemap: "gray"
        });
        this.markerLayer = new GraphicsLayer();
        this.map.add(this.markerLayer);

        this.view = new SceneView({
            //view = new MapView({
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
        if (rate < 0.2)
            return new Color('blue');
        if (rate < 0.4)
            return new Color('green');
        if (rate < 0.6)
            return new Color('yellow');
        if (rate < 0.8)
            return new Color('orange');
        return new Color('red');
    }

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string) {
        this.markerLayer.removeAll();

        for (const point of points) {
            let val: number = point.value;


            let color: Color = this.getColor(val, min, max);
            const symbol: SimpleMarkerSymbol = new SimpleMarkerSymbol({
                style: "circle",
                color: color,
                size: 18,  // pixels
            });


            const latitudeFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "lat",
                label: "latitude"
            });

            const longitudeFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "lng",
                label: "longitude",
            });

            const valueFieldInfo: FieldInfo = new FieldInfo({
                fieldName: "value",
                label: "value"
            });

            const fieldInfos: FieldInfo[] = [latitudeFieldInfo, longitudeFieldInfo, valueFieldInfo];

            const content: FieldsContent = new FieldsContent({
                fieldInfos: fieldInfos,
            });

            const contents: PopupContent[] = [content];

            const popupTemplate: PopupTemplate = new PopupTemplate({
                title: type + " point",
                content: contents,
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
    }


    switch_2d3d(use2d: boolean) {
        const zoom: number = this.view.zoom;
        const center: Point = this.view.center;

        if (use2d) {
            this.view = new MapView({
                container: this.container,
                map: this.map,
                zoom: zoom,
                center: center,
            });
        } else {
            this.view = new SceneView({
                container: this.container,
                map: this.map,
                zoom: zoom,
                center: center,
            });
        }
        this.view.constraints = this.constraints;
    }
}