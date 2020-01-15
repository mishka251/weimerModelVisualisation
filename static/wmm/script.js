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

    markerLayer = new GraphicsLayer();

    map.add(markerLayer);

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

//
    view.when(initFunc);


    function initFunc(view) {
        console.log('init');
        loadPoints();

        console.log('init ok');
    }


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

                        //console.log(`x=${coord_x}, y=${coord_y}, val = ${val}`);

                        min = val < min ? val : min;
                        max = val > max ? val : max;

                    }
                }



                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < m; j++) {
                        if (matr[i][j] == 1e36) {
                            continue;
                        }

                        let coord_x = (360 / 24) * x[i] - 180;//долгота?
                        let coord_y = y[j];//широта?
                        let val = matr[i][j];


                        let color = getColor(val, min, max);
                        var symbol = {
                            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                            style: "circle",
                            color: color,
                            size: "18px",  // pixels
                        };

                        let point = new Point(coord_x, coord_y);
                        let graphics = new Graphic({geometry: point, symbol: symbol});

                        markerLayer.add(graphics);

                    }
                }

            }
        })
    }


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


    }


    function check_switch_iso() {
        console.log('iso changed');
        loadPoints();

    }


    $('#switch_2d3d').change(check_switch_2d3d);

    $('input[type=radio][name = type]').change(check_switch_iso);
}


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
