var request = null,
    year = null,
    alt = 0,
    tm = new Date(),
    map,
    kml,
    shir_,
    dolg_,
    alt_,
    switch_N = true,
    switch_E = true,
    switch_km = true,
    type_dd = true,
    data,
    h = tm.getUTCHours();
//
var marker = null, view = null;
// var isolynes = {};
// var isolynesLayers = {};
var markerLayer = null;
//const markerSymbol = {
//    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()

//    size: "31",  // pixels
//    path: "M 256 0C 167.641 0 96 71.625 96 160c 0 24.75 5.625 48.219 15.672 69.125C 112.234 230.313 256 512 256 512l 142.594-279.375C 409.719 210.844 416 186.156 416 160C 416 71.625 344.375 0 256 0zM 256 256c-53.016 0-96-43-96-96s 42.984-96 96-96c 53 0 96 43 96 96S 309 256 256 256z",
//    color: [255, 0, 0, 1]
//};
//
const markerSymbol2D = {
    type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
    url: "/static/images/pic.svg", //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
    //color: [226, 119, 40],
    width: 31,//"64px",
    height: 31// "64px"
};


const markerSymbol3D = {  // symbol type required for rendering point geometries
    type: "point-3d",  // autocasts as new PointSymbol3D()
    symbolLayers: [{  // renders points as volumetric objects
        type: "object",  // autocasts as new ObjectSymbol3DLayer()
        resource: {primitive: "inverted-cone"},  // renders points as cones
        material: {color: "red"},
        width: 50000
    }]
};

var markerSymbol = markerSymbol2D;
//
// // Символ - как будет рисоваться
// var lineSymbol = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [226, 119, 40],
//     width: 1
// };
//
// // Символ - как будет рисоваться
// var lineSymbolMin = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [0, 0, 250],
//     width: 1
// };
//
// // Символ - как будет рисоваться
// var lineSymbolZero = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [0, 250, 0],
//     width: 1
// };
//
// // Символ - как будет рисоваться
// var lineSymbolMax = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [226, 0, 0],
//     width: 1
// };
//
// // Символ - как будет рисоваться
// var lineSymbolMinBold = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [0, 0, 250],
//     width: 3
// };
//
// // Символ - как будет рисоваться
// var lineSymbolMaxBold = {
//     type: "simple-line",  // autocasts as SimpleLineSymbol()
//     color: [226, 0, 0],
//     width: 3
// };
//
// var popupTemplate = {  // autocasts as new PopupTemplate()
//     title: "{Name}",
//     content: [{
//         type: "fields",
//         fieldInfos: [{
//             fieldName: "Name"
//         }, {
//             fieldName: "Value"
//         }]
//     }]
// };
//
// jQuery(function ($) {
//     $("#lat-mask").mask("99°99'99.99''");
// });
// jQuery(function ($) {
//     $("#long-mask").mask("999°99'99.99''");
// });
//
//
function requireHandler(Map,
                        MapView,
                        SceneView,
                        Graphic,
                        LocateButton,
                        Point,
                        webMercatorUtils,
                        SimpleMarkerSymbol,
                        Color,
                        GraphicsLayer,
                        CSVLayer
) {

    map = new Map(
        {
            basemap: "gray"
        }
    );
//     map.addMany([isolynesLayers[500], isolynesLayers[1000], isolynesLayers[2500], isolynesLayers[5000]]);
//
    markerLayer = new GraphicsLayer();

    map.add(markerLayer);
//
//     // map.add(isolynesLayers[2500]);
//     // const view = new SceneView({
    view = new MapView({
        container: "map",
        map: map,
        zoom: 5,
        center: [54.7249, 55.9425]
    });
//
    view.constraints = {minZoom: 3};
//
    var geoLocate = new LocateButton({
        view: view// map: map
    }, "LocateButton");
//
//     // console.log('zoom=' + view.zoom);
    view.ui.add(geoLocate, "top-right");
//
    view.when(initFunc);
    view.on("click", pickPoint);
//
    geoLocate.on("locate", geolocation);

//


//
//     function getStepForZoom(zoom) {
//         if (zoom <= 3)
//             return 5000;
//         if (zoom <= 5)
//             return 2500;
//         if (zoom <= 8)
//             return 1000;
//         return 500;
//     }
//
    function pickPoint(evt) {
        console.log('click');
        // var point = evt.mapPoint;
        // //маркер в выбранную точку
        // createMarker(point);
        // view.goTo(point);
        // //считывание координат
        // var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        // var shir = mp.y.toFixed(4);
        // var dolg = mp.x.toFixed(4);
        // shir_ = shir;
        // dolg_ = dolg;
        // insert_coords(shir_, dolg_, 0);
        console.log('click end');
    }

//
//     //
    function initFunc(view) {
        console.log('init');
        loadPoints();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(zoomToLocation, locationError);
            //watchId = navigator.geolocation.watchPosition(showLocation, locationError);
        } else {
            alert("Browser doesn't support Geolocation");
        }

        //var jsonTestPoints = ' {' +
        //    '"100.0": [[{ "x": 0, "y": 0 }, { "x": 0, "y": 10 }], [{ "x": 15, "y": 5 }, { "x": 10, "y": 0 }]],' +
        //    '"200.0": [[{ "x": 30, "y": 0 }, { "x": 60, "y": 10 }, { "x": 55, "y": 5 }]],' +
        //    '"300.0":[[{"x":0, "y":-170}, {"x":10, "y":175}], [{"x":-5, "y":-175}, {"x":0, "y":-170}]]' +
        //    '} ';
        // console.log(jsonTestPoints);
        // var testPoints = JSON.parse(jsonTestPoints);
        //console.log(testPoints);
        // drawIsolines(testPoints);


        //
        // getIsolines();
        console.log('init ok');
    }

//
//
//     function getIsolines() {
//         get_year();
//         code = getIsoCode();
//         getIsolines2(data, code);
//     }
//
//     function getIsolines2(year, code) {
//
//         var url = "/calc/iso/?data=" + year + "&code=" + code;
//         $.ajax({
//             url: url,
//             context: document.body,
//             success: function (json) {
//                 isolynes = JSON.parse(json);
//                 console.log(isolynes);
//                 lynesStep = getStepForZoom(view.zoom);
//                 createIsolynes(isolynes);
//                 console.log('success get iso');
//             }
//         });
//     }
//
//     function createIsolyne(points, val) {
//         result = [];
//
//         // Атрибуты линии - для подписи
//         var lineAtt = {
//             Name: "Isomagnet line",
//             Value: val + " nT"
//         };
//
//
//         for (var i1 in points) {//points - массив массивов
//             var polyline = {
//                 type: "polyline",  // autocasts as new Polyline()
//                 paths: []
//             };
//             path = [];
//
//             for (i in points[i1]) {//добавляем на неё все точки
//                 p = points[i1][i];
//                 if (i > 0) {
//                     prev = points[i1][i - 1];
//                    if (prev.y < -150 && p.y > 150) {//пересекает 180
//                         x = (prev.x + prev.x) / 2;
//                         path.push([-180, x]);
//                         polyline.paths.push(path);
//                         path = [];
//                         path.push([180, x]);
//                     }
//
//                     if (p.y < -150 && prev.y > 150) {//пересекает 180
//                         x = (prev.x + p.x) / 2;
//                         path.push([180, x]);
//                         polyline.paths.push(path);
//                         path = [];
//                         path.push([-180, x]);
//                     }
//                 }
//                 path.push([p.y, p.x]);
//             }
//             polyline.paths.push(path);
//
//
//             var s = lineSymbol;
//
//             if (val < 0) {
//                 if (val % 10000 == 0)
//                     s = lineSymbolMinBold;
//                 else
//                     s = lineSymbolMin;
//
//             } if (val == 0)
//                 s = lineSymbolZero;
//             if (val > 0) {
//                 if (val % 10000 == 0)
//                     s = lineSymbolMaxBold;
//                 else
//                     s = lineSymbolMax;
//             }
//             /*******************************************
//              * Create a new graphic and add the geometry,
//              * symbol, and attributes to it. You may also
//              * add a simple PopupTemplate to the graphic.
//              * This allows users to view the graphic's
//              * attributes when it is clicked.
//              ******************************************/
//             var polylineGraphic = new Graphic({
//                 geometry: polyline,
//                 symbol: s,
//                 attributes: lineAtt,
//                 popupTemplate: popupTemplate
//             });
//
//             result.push(polylineGraphic);
//
//         }
//         console.log('created');
//         return result;
//     }
//
//
//     function createIsolynes(points) {
//
//         for (var step in isolynesLayers) {
//             map.layers.remove(isolynesLayers[step]);
//             isolynesLayers[step] = new GraphicsLayer({ graphics: [] });
//             map.layers.add(isolynesLayers[step]);
//         }
//
//         console.log('create lynes');
//         for (var bx in points) {
//             lines = createIsolyne(points[bx], bx);
//             isolynes[bx] = lines;
//             for (var step in isolynesLayers) {
//                 if (bx % step === 0) {
//                     isolynesLayers[step].addMany(lines);
//                 }
//             }
//         }
//         for (var step in isolynesLayers) {
//             isolynesLayers[step].visible = false;
//         }
//
//         nowStep = getStepForZoom(view.zoom);
//         isolynesLayers[nowStep].visible = true;
//         console.log(isolynesLayers);
//         console.log('create lynes end');
//     }
//
//
//     function locationError(error) {
//         if (navigator.geolocation) {
//             navigator.geolocation.clearWatch(watchId);
//         }
//
//         switch (error.code) {
//             case error.PERMISSION_DENIED:
//                 alert("Location not provided");
//                 break;
//
//             case error.POSITION_UNAVAILABLE:
//                 alert("Current location not available");
//                 break;
//
//             case error.TIMEOUT:
//                 alert("Timeout");
//                 break;
//
//             default:
//                 alert("unknown error");
//                 break;
//         }
//     }

    function getColor(val, min, max) {
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


    function loadPoints() {
        let url = "points";
        let type = $('input[name = type]').val();
        console.log(type);

        $.ajax({
            url: url,
            data: {
                type: type,
            },
            success(result) {
                console.log(result);
                let n = result.n;
                let m = result.m;
                let x = result.x;
                let y = result.y;
                let matr = result.matr;


                let max = -1e36;
                let min = 1e36;

                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < m; j++) {
                        if (matr[i][j] == 1e36) {
                            continue;
                        }

                        let coord_x = (360 / 24) * x[i] - 180;//долгота?
                        let coord_y = y[j];//широта?
                        let val = matr[i][j];

                        console.log(`x=${coord_x}, y=${coord_y}, val = ${val}`);

                        min = val < min ? val : min;
                        max = val > max ? val : max;

                    }
                }

                console.log(`min=${min} max = ${max}`);


                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < m; j++) {
                        if (matr[i][j] == 1e36) {
                            continue;
                        }

                        let coord_x = (360 / 24) * x[i] - 180;//долгота?
                        let coord_y = y[j];//широта?
                        let val = matr[i][j];

                        console.log(`x=${coord_x}, y=${coord_y}, val = ${val}`);

                        let color = getColor(val, min, max);
                        var symbol = {
                            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                            style: "circle",
                            color: color,
                            size: "18px",  // pixels
                        };

                        let point = new Point(coord_x, coord_y);
                        let graphics = new Graphic({geometry: point, symbol: symbol});
                        console.log(point);
                        console.log(symbol);
                        console.log(graphics);
                        view.graphics.add(graphics);

                    }
                }
console.log(view);
            }
        })
    }

    function geolocation() {
        // console.log('geolocation  in');
        //map.graphics.clear();
        navigator.geolocation.getCurrentPosition(function (position) {
                // var shir = position.coords.latitude.toFixed(4);
                // var dolg = position.coords.longitude.toFixed(4);
                // shir_ = shir;
                // dolg_ = dolg;
                // var point = new Point(dolg, shir);
                // point = webMercatorUtils.geographicToWebMercator(point);
                // createMarker(point);
                // insert_coords(shir, dolg, 0);
                //  console.log('in get cur pos');
            }, function errorCallback(error) {
                alert("Невозможно определение текущей геопозиции");
            },
            {
                maximumAge: Infinity,
                timeout: 2000
            });
        //console.log('geolocation ok');
    }

//     function zoomToLocation(location) {
//         console.log('zoom in');
//         var pt = new Point(location.coords.longitude, location.coords.latitude);
//         //  console.log(location.coords.longitude);
//         //  console.log(location.coords.latitude);
//         var shir = location.coords.latitude.toFixed(4);
//         var dolg = location.coords.longitude.toFixed(4);
//         shir_ = shir;
//         dolg_ = dolg;
//         var point = new Point(dolg, shir);
//         point = webMercatorUtils.geographicToWebMercator(point);
//         createMarker(point);
//         insert_coords(shir, dolg, 0);
//         //addGraphic(pt);
//         view.goTo({ target: pt, zoom: 10/*15*/ });
//         console.log('zoom ok');
//     }
//
//     //console.log('ok');
//
//     function createMarker(point) {
//         //  console.log('createMarker in');
//         if (marker !== null)
//             //marker.point = point;
//             markerLayer.remove(marker);//view.graphics.remove(marker);
//
//
//         marker = new Graphic(point, markerSymbol);
//
//         // console.log(marker);
//         markerLayer.add(marker); //view.graphics.add(marker);
//         // console.log('createMarker ok');
//     }
//     //геокодирование
//     function codeAddress() {
//         var address = document.getElementById('search').value;
//         var geocoder = new google.maps.Geocoder();
//         geocoder.geocode({ 'address': address }, function (results, status) {
//             if (status == google.maps.GeocoderStatus.OK) {
//                 var lat_x = results[0].geometry.location.lat();
//                 var lng_x = results[0].geometry.location.lng();
//                 shir_ = lat_x;
//                 dolg_ = lng_x;
//                 insert_coords(lat_x, lng_x, 0);
//                 //	calcGMF(lat_x,lng_x,0);
//                 var point = new Point(lng_x, lat_x);
//                 point = webMercatorUtils.geographicToWebMercator(point);
//                 view.goTo(point);
//                 createMarker(point);
//             } else {
//                 alert('Неизвестный объект');
//             }
//         });
//     }
//
//
//     //function drawIsolynes(step) {
//     //    // console.log('draw');
//     //    view.graphics.removeAll();
//     //    for (var key in isolynes) {
//     //        if (key % step === 0)
//     //            for (var i = 0; i < isolynes[key].length; i++)
//     //                view.graphics.add(isolynes[key][i]);
//     //    }
//     //    view.graphics.add(marker);
//
//     //    console.log('draw end');
//     //}
//
//
//
//     function reversGeocode(lat, lng) {
//         console.log('reverse geocode in');
//         var geocoder = new google.maps.Geocoder();
//         var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
//         geocoder.geocode({ 'location': latlng }, function (results, status) {
//             if (status === google.maps.GeocoderStatus.OK) {
//                 if (results[1]) {
//                     document.getElementById("search").value = results[0].formatted_address;
//                 } else {
//                     document.getElementById("search").value = "Unknown Object";
//                 }
//             } else {
//                 document.getElementById("search").value = "Unknown Object";
//             }
//         });
//         console.log('reverse ok');
//     }
//
//
//     function convert_from_dd_to_dms() {
//         var shir_dd = document.getElementById("lat-simple").value;
//         if (shir_dd !== '') {
//             if (shir_dd >= 0 && shir_dd <= 90) {
//                 shir_ = shir_dd;
//                 var lat = Math.abs(shir_dd);
//                 var LatDeg = Math.floor(lat);
//                 var LatMin_1 = Math.abs((lat - LatDeg) * 60);
//                 var LatMin_2 = Math.floor((lat - LatDeg) * 60);
//                 var LatSec = Math.abs((LatMin_1 - LatMin_2) * 60);
//                 if (LatDeg < 10) {
//                     var extra1 = '0';
//                     LatDeg = extra1.concat(LatDeg);
//                     LatDeg = parseFloat(LatDeg);
//                 }
//                 document.getElementById("lat-mask").value = LatDeg + "°" + parseInt(LatMin_2) + "'" + (LatSec.toFixed(2)) + "''";
//                 if (switch_N === false) {
//                     shir_ = shir_dd * (-1);
//                 }
//             } else {
//                 alert("Latitude must be from 0 to 90");
//             }
//         }
//         var dolg_dd = document.getElementById("long-simple").value;
//         if (dolg_dd !== '') {
//             if (dolg_dd >= 0 && dolg_dd <= 180) {
//                 dolg_ = dolg_dd;
//                 var lng = Math.abs(dolg_dd);
//                 var LngDeg = Math.floor(lng);
//                 var LngMin_1 = Math.abs((lng - LngDeg) * 60);
//                 var LngMin_2 = Math.floor((lng - LngDeg) * 60);
//                 var LngSec = Math.abs((LngMin_1 - LngMin_2) * 60);
//                 if (LngDeg < 10) {
//                     var extra = '00';
//                     LngDeg = extra.concat(LngDeg);
//                 } else {
//                     if (LngDeg < 100) {
//                         var extra_ = '0';
//                         LngDeg = extra_.concat(LngDeg);
//                     }
//                 }
//                 document.getElementById("long-mask").value = LngDeg + "°" + parseInt(LngMin_2) + "'" + (LngSec.toFixed(2)) + "''";
//                 if (switch_E === false) {
//                     dolg_ = dolg_dd * (-1);
//                 }
//             } else {
//                 alert("Longitude must be from 0 to 180");
//             }
//         }
//     }
//
//     function convert_from_km_to_ft() {
//         var alt = document.getElementById('alt').value;
//         var alt_ = (alt * 3280.8399).toFixed(4);
//         document.getElementById('alt').value = alt_;
//         switch_km = false;
//     }
//
//     function convert_from_ft_to_km() {
//         var alt = document.getElementById('alt').value;
//         var alt_ = (alt * 0.0003048).toFixed(4);
//         document.getElementById('alt').value = alt_;
//         switch_km = true;
//         alt = alt_;
//     }
//
//     function convert_from_dms_to_dd() {
//         var shir = document.getElementById("lat-mask").value;
//         if (shir != "__°__'__.__''") {
//             var i1 = shir.indexOf("°");
//             var i2 = shir.indexOf("'");
//             var i3 = shir.indexOf("''");
//             var d1 = parseFloat(shir.substr(0, i1));
//             var d2 = parseFloat(shir.substr(i1 + 1, i2));
//             var d3 = parseFloat(shir.substr(i2 + 1, i3));
//             if (d1) {
//                 shir = d1 + d2 / 60 + d3 / 3600;
//                 shir = shir.toFixed(4);
//             } else {
//                 shir = 0;
//             }
//             if (shir >= 0 && shir <= 90) {
//                 document.getElementById("lat-simple").value = shir;
//                 shir_ = shir;
//                 if (switch_N === false) {
//                     shir_ = shir * (-1);
//                 }
//             } else {
//                 alert("Latitude must be from 0 to 90");
//             }
//         }
//         var dolg = document.getElementById("long-mask").value;
//         if (dolg != "___°__'__.__''") {
//             var i11 = dolg.indexOf("°");
//             var i22 = dolg.indexOf("'");
//             var i33 = dolg.indexOf("''");
//             var d11 = parseFloat(dolg.substr(0, i11));
//             var d22 = parseFloat(dolg.substr(i11 + 1, i22));
//             var d33 = parseFloat(dolg.substr(i22 + 1, i33));
//             if (d11) {
//                 dolg = d11 + d22 / 60 + d33 / 3600;
//                 dolg = dolg.toFixed(4);
//             } else {
//                 dolg = 0;
//             }
//             if (dolg >= 0 && dolg <= 180) {
//                 document.getElementById("long-simple").value = dolg;
//                 dolg_ = dolg;
//                 if (switch_E === false) {
//                     dolg_ = dolg * (-1);
//                 }
//             } else {
//                 alert("Longitude must be from 0 to 180");
//             }
//         }
//     }
//
//     function get_coordinates(with_alt) {
//         if (type_dd === true) {
//             convert_from_dd_to_dms();
//         } else {
//             convert_from_dms_to_dd();
//         }
//         if (with_alt === false) {
//             calc_elev(shir_, dolg_, false);
//         } else {
//             calc_elev(shir_, dolg_, true);
//         }
//
//         var point = new Point(dolg_, shir_);
//         point = webMercatorUtils.geographicToWebMercator(point);
//         view.goTo(point);
//         createMarker(point);
//         get_year();
//         calcGMF();
//     }
//
//
//
//
//     $(document).keypress(function (e) {
//         if (e.which == 13) {
//             if (document.activeElement.id == 'search') {
//                 codeAddress();
//             } else {
//                 if (document.activeElement.id == 'alt') {
//                     get_coordinates(true);
//                 } else {
//                     get_coordinates(false);
//                 }
//
//             }
//         }
//     });
//
//     //простановка в поля
//     function insert_coords(shir, dolg, flag) {
//         //высота
//         if (flag == 0) {
//             calc_elev(shir, dolg, false);
//         }
//
//         if (shir > 0) {
//             document.getElementById("switch_N").checked = true;
//             switch_N = true;
//         } else {
//             document.getElementById("switch_N").checked = false;
//             switch_N = false;
//         }
//         if (dolg > 0) {
//             document.getElementById("switch_E").checked = true;
//             switch_E = true;
//         } else {
//             document.getElementById("switch_E").checked = false;
//             switch_E = false;
//         }
//         document.getElementById('lat-simple').value = Math.abs(shir);
//         document.getElementById('long-simple').value = Math.abs(dolg);
//         //преобразование
//         shir = Math.abs(shir);
//         dolg = Math.abs(dolg);
//         if (shir == 0.0000001) {
//             document.getElementById("lat-simple").value = 0;
//         }
//
//         if (dolg == 0.0000001) {
//             document.getElementById("long-simple").value = 0;
//         }
//         var LatDeg = Math.floor(shir);
//         var LatMin_1 = Math.abs((shir - LatDeg) * 60);
//         var LatMin_2 = Math.floor((shir - LatDeg) * 60);
//         var LatSec = Math.abs((LatMin_1 - LatMin_2) * 60);
//         if (LatDeg < 10) {
//             var extra = '00';
//             LatDeg = extra.concat(LatDeg);
//         }
//         document.getElementById("lat-mask").value = LatDeg + "°" + parseInt(LatMin_2) + "'" + (LatSec.toFixed(2)) + "''";
//         var LngDeg = Math.floor(dolg);
//         var LngMin_1 = Math.abs((dolg - LngDeg) * 60);
//         var LngMin_2 = Math.floor((dolg - LngDeg) * 60);
//         var LngSec = Math.abs((LngMin_1 - LngMin_2) * 60);
//         if (LngDeg < 10) {
//             var extra = '00';
//             LngDeg = extra.concat(LngDeg);
//         }
//         document.getElementById("long-mask").value = LngDeg + "°" + parseInt(LngMin_2) + "'" + (LngSec.toFixed(2)) + "''";
//         get_year();
//
//         //
//     }
//
//     //расчет и подстановка высоты
//     function calc_elev(lat, lng, with_alt) {
//         if (with_alt === false) {
//             var elevator = new google.maps.ElevationService();
//             var locations = [];
//             locations.push(new google.maps.LatLng(lat, lng));
//             var positionalRequest = { 'locations': locations };
//             elevator.getElevationForLocations(positionalRequest, function (results, status) {
//                 if (status == google.maps.ElevationStatus.OK) {
//                     if (results[0]) {
//                         alt = (results[0].elevation / 1000).toFixed(3);
//                         // var alt_print = alt;
//
//                         alt_ = alt;
//                         if (switch_km === true) {
//                             document.getElementById('alt').value = alt;
//
//                         }
//                         else {
//                             document.getElementById('alt').value = alt * 3280.8399;
//
//                         }
//
//
//                     } else {
//                         document.getElementById('alt').value = 0;
//
//                     }
//                 } else {
//                     document.getElementById('alt').value = 0;
//                 }
//                 calcGMF();
//             });
//         }
//
//         else {
//             alt = document.getElementById("alt").value;
//             if (switch_km !== true) {
//                 alt = (alt * 0.0003048).toFixed(4);
//             }
//             calcGMF();
//         }
//     }
//
//     //
//     function calcGMF() {
//         get_year();
//         reversGeocode(shir_, dolg_);
//         var url = "/calc/?lat=" + shir_ + "&lng=" + dolg_ + "&data=" + data + "&alt=" + alt + "&h=" + h;
//         $.ajax({
//             url: url,
//             context: document.body,
//             success: function (xml) {
//                 // console.log(xml);
//                 showCalcResults(xml);
//             }
//         });
//     }
//
//     //
//     function showCalcResults(request) {
//         var arr = $.parseJSON(request);
//
//         // var lamda = arr[0];
//         // var teta = arr[1];
//         // var N = arr[2];
//         var U = arr[3];
//         var Bx = arr[4];
//         var By = arr[5];
//         var Bz = arr[6];
//         var B = arr[7];
//         var D = arr[8];
//         var I = arr[9];
//         var FI = arr[10];
//         var LAMDA = arr[11];
//         var M = arr[12];
//         var X_ = arr[13];
//         var Y_ = arr[14];
//         var Z_ = arr[15];
//
//
//         document.getElementById("lat_print").innerHTML = shir_;
//         document.getElementById("long_print").innerHTML = dolg_;
//         document.getElementById("alt_print").innerHTML = alt_;
//         document.getElementById("date_print").innerHTML = document.getElementById("data1").value;
//         document.getElementById('X_print').innerHTML = parseFloat(X_).toFixed(3);
//         document.getElementById('Y_print').innerHTML = parseFloat(Y_).toFixed(3);
//         document.getElementById('Z_print').innerHTML = parseFloat(Z_).toFixed(3);
//         document.getElementById('shir_geopole_print').innerHTML = parseFloat(FI).toFixed(3);
//         document.getElementById('dolg_geopole_print').innerHTML = parseFloat(LAMDA).toFixed(3);
//         document.getElementById('mom_geo_print').innerHTML = parseFloat(M).toPrecision(5);
//         document.getElementById('pot_ind_print').innerHTML = parseFloat(U).toPrecision(5);
//         document.getElementById('Bx_print').innerHTML = parseFloat(Bx).toFixed(1);
//         document.getElementById('By_print').innerHTML = parseFloat(By).toFixed(1);
//         document.getElementById('Bz_print').innerHTML = parseFloat(Bz).toFixed(1);
//         document.getElementById('B_print').innerHTML = parseFloat(B).toFixed(1);
//         document.getElementById('m_skl_print').innerHTML = parseFloat(D).toFixed(1);
//         document.getElementById('m_nakl_print').innerHTML = parseFloat(I).toFixed(1);
//         //
//         document.getElementById('shir_geopole').innerHTML = parseFloat(FI).toFixed(3);
//         document.getElementById('dolg_geopole').innerHTML = parseFloat(LAMDA).toFixed(3);
//         document.getElementById('mom_geo').innerHTML = parseFloat(M).toPrecision(5);
//         document.getElementById('pot_ind').innerHTML = parseFloat(U).toPrecision(5);
//         document.getElementById('Bx').innerHTML = parseFloat(Bx).toFixed(1);
//         document.getElementById('By').innerHTML = parseFloat(By).toFixed(1);
//         document.getElementById('Bz').innerHTML = parseFloat(Bz).toFixed(1);
//         document.getElementById('B').innerHTML = parseFloat(B).toFixed(1);
//         document.getElementById('m_skl').innerHTML = parseFloat(D).toFixed(1);
//         document.getElementById('m_nakl').innerHTML = parseFloat(I).toFixed(1);
//         document.getElementById('X_').innerHTML = parseFloat(X_).toFixed(3);
//         document.getElementById('Y_').innerHTML = parseFloat(Y_).toFixed(3);
//         document.getElementById('Z_').innerHTML = parseFloat(Z_).toFixed(3);
//     }
//
//
//     //
//     function get_year() {
//         data = null;
//         data = document.getElementById('data1').value;
//         var strs = data.split('-');
//
//         var dt1 = parseInt(strs[0]);
//         var mon1 = parseInt(strs[1]);
//         var yr1 = parseInt(strs[2]);
//
//         var d1 = new Date(yr1, mon1 - 1, dt1);
//         var first = new Date(d1.getFullYear(), 0, 1);
//         var theDay = Math.round(((d1 - first) / 1000 / 60 / 60 / 24) + .5, 0);
//         var part = theDay / 365;
//         var epoch1 = yr1 + part;
//         data = epoch1.toFixed(2);
//         current_date();
//     }
//
//     function current_date() {
//         var today = new Date();
//         var dd = today.getDate();
//         var mm = today.getMonth() + 1; //January is 0!
//         var yyyy = today.getFullYear();
//         if (dd < 10) {
//             dd = '0' + dd;
//         }
//         if (mm < 10) {
//             mm = '0' + mm;
//         }
//         today = dd + '-' + mm + '-' + yyyy;
//     }
//
//
//     //////////////event handlers
//     function check_switch_km() {
//         if (switch_km === true) {
//             convert_from_km_to_ft();
//         } else {
//             convert_from_ft_to_km();
//         }
//     }
//
//     function check_switch_km() {
//         if (document.getElementById("switch_km").checked) {
//             switch_km = true;
//         } else {
//             switch_km = false;
//         }
//     }
//
//     function check_switch_N() {
//         if (document.getElementById("switch_N").checked) {
//             switch_N = true;
//         } else {
//             switch_N = false;
//         }
//     }
//
    function check_switch_2d3d() {

        var zoom = view.zoom;
        var center = view.center;

        var graphics = view.graphics;
        graphics.remove(marker);
        if (document.getElementById("switch_2d3d").checked) {

            view = new MapView({
                container: "map",
                map: map,
                zoom: zoom,
                minZoom: 5,
                center: center,
                graphics: graphics
            });
            view.constraints = {minZoom: 3};
            markerSymbol = markerSymbol2D;

        } else {
            view = new SceneView({
                container: "map",
                map: map,
                zoom: zoom,
                minZoom: 5,
                center: center,
                graphics: graphics
                //ui: []
            });
            markerSymbol = markerSymbol3D;
        }

        view.ui.add(geoLocate, "top-right");

        //view.when(initFunc);
        view.on("click", pickPoint);
        view.on("mouse-wheel", viewOnResize);

    }

//
//     function check_switch_E() {
//         if (document.getElementById("switch_E").checked) {
//             switch_E = true;
//         } else {
//             switch_E = false;
//         }
//     }
//
//     //function inputtype() {
//     //    get_coordinates();
//     //    if (document.getElementById("someSwitchOptionPrimary").checked) {
//     //        type_dd = true;
//     //        document.getElementById("lat-simple").style.display = "block";
//     //        document.getElementById("long-simple").style.display = "block";
//     //        document.getElementById("lat-mask").style.display = "none";
//     //        document.getElementById("long-mask").style.display = "none";
//     //    } else {
//     //        type_dd = false;
//     //        document.getElementById("lat-simple").style.display = "none";
//     //        document.getElementById("long-simple").style.display = "none";
//     //        document.getElementById("lat-mask").style.display = "block";
//     //        document.getElementById("long-mask").style.display = "block";
//     //    }
//     //}
//
//
//     ///////set handkers
//
//
//     function checkChangeDate() {
//         console.log('date changed');
//         get_year();
//         console.log('date = ' + data);
//         getIsolines();
//     }
//
//     function getIsoCode() {
//         var checked = $('input[type=radio][name = iso]:checked');
//         return checked.val();
//     }
//
    function check_switch_iso() {
        console.log('iso changed');
        // isoCode = getIsoCode();
        // console.log(isoCode);
        // getIsolines();
    }

//
//
    $('#switch_2d3d').change(check_switch_2d3d);
//     $('#switch_E').change(check_switch_E);
//     $('#switch_N').change(check_switch_N);
//     $('#switch_km').change(check_switch_km);
//
//     $('#data1').change(checkChangeDate);
    $('input[type=radio][name = type]').change(check_switch_iso);
}

//
//
require(["esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/widgets/Locate",
    "esri/geometry/Point",
    "esri/geometry/support/webMercatorUtils",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color",
    "esri/layers/GraphicsLayer",
    "esri/layers/CSVLayer",

], requireHandler);
