//require("bootstrap");
//require("switch");

import Map from "esri/Map";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import SceneView from "esri/views/SceneView";
import MapView from "esri/views/MapView";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";
import MapViewConstraints = __esri.MapViewConstraints;


import $ from "jquery";

$(document).ready(() => {
    console.log("working");


    const map = new Map(
        {
            basemap: "gray"
        }
    );


    const markerLayer = new GraphicsLayer();

    map.add(markerLayer);

    let view: SceneView | MapView = new SceneView({
        //view = new MapView({
        container: "map",
        map: map,
        zoom: 5,
        center: [54.7249, 55.9425]
    });

    let constraints: MapViewConstraints = {
        minZoom: 3
    };

    view.constraints = constraints;
    view.when(loadPoints);


    function getColor(val: number, min: number, max: number) {
        let rate = (val - min) / (max - min);
        if (rate < 0.2)
            return 'blue';
        if (rate < 0.4)
            return 'green';
        if (rate < 0.6)
            return 'yellow';
        if (rate < 0.8)
            return 'orange';
        return 'red';
    }


    function loadPoints(): void {
        let url = "points";
        let type = $('input[name = type]:checked').val();
        console.log(type);

        $.ajax({
            url: url,
            data: {
                type: type,
            },
            success(result) {
                markerLayer.removeAll();
                console.log(result);

                const min = result.min;
                const max = result.max;

                for (const point of result.points) {
                    let val: number = point.val;


                    let color = getColor(val, min, max);
                    const symbol = {
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        style: "circle",
                        color: color,
                        size: "18px",  // pixels
                    };

                    const popupTemplate = {
                        title: type + " point",
                        content: [{
                            // Pass in the fields to display
                            type: "fields",
                            fieldInfos: [{
                                fieldName: "lat",
                                label: "latitude"
                            }, {
                                fieldName: "lng",
                                label: "longitude"
                            }, {
                                fieldName: "value",
                                label: "value"
                            }]
                        }]
                    };

                    let _point = new Point(
                        {
                            latitude: point.lat,
                            longitude: point.lng
                        });
                    let graphics = new Graphic({
                        geometry: _point,
                        symbol: symbol,
                        popupTemplate: popupTemplate,
                        attributes: {
                            lat: point.lat,
                            lng: point.lng,
                            value: point.val
                        }

                    });

                    markerLayer.add(graphics);
                }
            }
        })
    }


    function check_switch_2d3d() {
        const zoom: number = view.zoom;
        const center: Point = view.center;
//@ts-ignore
        if ((document.getElementById("switch_2d3d")).checked) {

            view = new __esri.MapView({
                container: "map",
                map: map,
                zoom: zoom,
                center: center,
            });
            view.constraints = constraints;

        } else {
            view = new SceneView({
                container: "map",
                map: map,
                zoom: zoom,
                center: center,
            });
        }
    }


    function check_switch_iso() {
        console.log('iso changed');
        loadPoints();
    }

    $('#switch_2d3d').change(check_switch_2d3d);

    $('input[type=radio][name = type]').change(check_switch_iso);

});