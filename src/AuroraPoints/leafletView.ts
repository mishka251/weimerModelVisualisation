//import {Map, Marker, Layer, LatLng, LayerGroup, Polyline, TileLayer} from "leaflet";
import {AuroraPoint} from "./Model";
import {FeatureCollection, MultiLineString} from "@turf/helpers";


const eegeoKey = "94862e86a09f465f6a34f05d9dda0f48";

declare var L:any;

export default class LeafletView {
    map: any;
    pointsMarkers: any[];
    container: string;
    markerLayer: any;
    isolinesLayer: any;

    constructor(container: string, onLoad: () => void) {
        this.container = container;
        //const layer =  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

        this.map = L.eeGeo.map(container, eegeoKey, {
            zoom: 5,
            center: [55, 55],
           // layers: [layer]
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

        this.markerLayer = L.layerGroup();
        points.forEach((point: AuroraPoint) => {
            const coords =L.latLng(point.latitude, point.longitude);
            const markerpoint =L.marker(coords);
            markerpoint.addTo(this.markerLayer);
        });
        this.markerLayer.addTo(this.map);

        // console.log("render isolines");
        this.isolinesLayer = L.layerGroup();
        isolines.features.forEach((feature) => {
            //console.log(feature.geometry.coordinates);
            const paths = feature.geometry.coordinates;

            const leafletPaths: any[][] = paths.map((points) => {
                return points.map((point) => {
                    return L.latLng(point[1], point[0]);
                });
            });
            const poliline = new L.polyline(leafletPaths);
             console.log(poliline);
            this.isolinesLayer.addLayer(poliline);
        });
    }

}