import {Map, Marker, Layer, LatLng, LayerGroup, Polyline, TileLayer} from "leaflet";
import {AuroraPoint} from "./Model";
import {FeatureCollection, MultiLineString} from "@turf/helpers";


export default class LeafletView {
    map: Map;
    pointsMarkers: Marker[];
    container: string;
    markerLayer: LayerGroup;
    isolinesLayer: LayerGroup;

    constructor(container: string, onLoad: () => void) {
        this.container = container;
        const layer = new TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
        this.map = new Map(container, {
            zoom: 10,
            center: [55, 55],
            layers: [layer]
        });

        // console.log("constructor");
        this.map.whenReady(() => {
            setTimeout(() => {
                onLoad();
            }, 100);
            //onLoad();
        });
    }


    clearMap() {
        if (this.markerLayer) {
            this.map.removeLayer(this.markerLayer);
        }
        if (this.isolinesLayer) {
            this.map.removeLayer(this.isolinesLayer);
        }
    }

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string, isolines: FeatureCollection<MultiLineString>) {
        this.clearMap();

        this.markerLayer = new LayerGroup();
        points.forEach((point: AuroraPoint) => {
            const coords = new LatLng(point.latitude, point.longitude);
            const markerpoint = new Marker(coords);
            markerpoint.addTo(this.markerLayer);
        });
        this.markerLayer.addTo(this.map);

        // console.log("render isolines");
        this.isolinesLayer = new LayerGroup();
        isolines.features.forEach((feature) => {
            //console.log(feature.geometry.coordinates);
            const paths = feature.geometry.coordinates;

            const leafletPaths: LatLng[][] = paths.map((points) => {
                return points.map((point) => {
                    return new LatLng(point[1], point[0]);
                });
            });
            const poliline: Polyline = new Polyline(leafletPaths);
            // console.log(poliline);
            this.isolinesLayer.addLayer(poliline);
        });
        // for(const isoline in isolines){
        //
        // }
        this.isolinesLayer.addTo(this.map);

    }

}