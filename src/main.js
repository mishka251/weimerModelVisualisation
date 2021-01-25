"use strict";
// //
// // const GraphicsLayer = require("esri/layers/GraphicsLayer");
// // const SceneView = require("esri/views/SceneView");
// // const MapView = require("esri/views/MapView");
// // const ErsiMap = require("esri/Map");
// // const Point = require("esri/geometry/Point");
// // const Graphic = require("esri/Graphic");
//
// import GraphicsLayer from "arcgis-js-api/layers/GraphicsLayer";
// import Map from "arcgis-js-api/Map";
// import MapView from "arcgis-js-api/views/MapView";
// import SceneView from "arcgis-js-api/views/SceneView";
// import Point from "arcgis-js-api/geometry/Point";
// import Graphic from "arcgis-js-api/Graphic";
//
//
// const map = new Map(
//     {
//         //@ts-ignore
//         basemap: "gray"
//     }
// );
//
//
// const markerLayer = new GraphicsLayer();
//
// map.add(markerLayer);
//
// let view = new SceneView({
//     //view = new MapView({
//     container: "map",
//     map: map,
//     zoom: 5,
//     center: [54.7249, 55.9425]
// });
//
// view.constraints = {minZoom: 3};
// view.when(loadPoints);
//
//
// function getColor(val: number, min: number, max: number) {
//     let rate = (val - min) / (max - min);
//     if (rate < 0.2)
//         return 'blue';
//     if (rate < 0.4)
//         return 'green';
//     if (rate < 0.6)
//         return 'yellow';
//     if (rate < 0.8)
//         return 'orange';
//     return 'red';
// }
//
//
// function loadPoints(): void {
//     let url = "points";
//     let type = $('input[name = type]:checked').val();
//     console.log(type);
//
//     $.ajax({
//         url: url,
//         data: {
//             type: type,
//         },
//         success(result) {
//             markerLayer.removeAll();
//             console.log(result);
//
//             const min = result.min;
//             const max = result.max;
//
//             for (const point of result.points) {
//                 let coord_x: number = point.lat;//долгота?
//                 let coord_y: number = point.lng;//широта?
//                 let val: number = point.val;
//
//
//                 let color = getColor(val, min, max);
//                 const symbol = {
//                     type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
//                     style: "circle",
//                     color: color,
//                     size: "18px",  // pixels
//                 };
//
//                 const popupTemplate = {
//                     title: type + " point",
//                     content: [{
//                         // Pass in the fields to display
//                         type: "fields",
//                         fieldInfos: [{
//                             fieldName: "lat",
//                             label: "latitude"
//                         }, {
//                             fieldName: "lng",
//                             label: "longitude"
//                         }, {
//                             fieldName: "value",
//                             label: "value"
//                         }]
//                     }]
//                 };
//
//                 let _point = new Point(coord_x, coord_y);
//                 let graphics = new Graphic({
//                     geometry: _point,
//                     symbol: symbol,
//                     popupTemplate: popupTemplate,
//                     attributes: {
//                         lat: point.lat,
//                         lng: point.lng,
//                         value: point.val
//                     }
//
//                 });
//
//                 markerLayer.add(graphics);
//             }
//         }
//     })
// }
//
//
// function check_switch_2d3d() {
//     const zoom: number = view.zoom;
//     const center: number = view.center;
// //@ts-ignore
//     if ((document.getElementById("switch_2d3d")).checked) {
//
//         view = new MapView({
//             container: "map",
//             map: map,
//             zoom: zoom,
//             minZoom: 5,
//             center: center,
//         });
//         view.constraints = {minZoom: 3};
//
//     } else {
//         view = new SceneView({
//             container: "map",
//             map: map,
//             zoom: zoom,
//             minZoom: 5,
//             center: center,
//         });
//     }
// }
//
//
// function check_switch_iso() {
//     console.log('iso changed');
//     loadPoints();
// }
//
// $('#switch_2d3d').change(check_switch_2d3d);
//
// $('input[type=radio][name = type]').change(check_switch_iso);
//
exports.__esModule = true;
var Map_1 = require("esri/Map");
var MapView_1 = require("esri/views/MapView");
var map = new Map_1["default"]({
    basemap: "streets"
});
var view = new MapView_1["default"]({
    map: map,
    container: "viewDiv",
    center: [-118.244, 34.052],
    zoom: 12
});
