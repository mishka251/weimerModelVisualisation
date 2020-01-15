function requireHandler(Map,
                        MapView,
                        SceneView,
                        Graphic,
                        Point,
                        SimpleMarkerSymbol,
                        Color,
                        GraphicsLayer,
) {

    const map = new Map(
        {
            basemap: "gray"
        }
    );

    const markerLayer = new GraphicsLayer();

    map.add(markerLayer);

    let view = new SceneView({
        //view = new MapView({
        container: "map",
        map: map,
        zoom: 5,
        center: [54.7249, 55.9425]
    });

    view.constraints = {minZoom: 3};
    view.when(loadPoints);


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

                const min = result.min;
                const max = result.max;

                for (const point of result.points) {
                    let coord_x = point.lat;//долгота?
                    let coord_y = point.lng;//широта?
                    let val = point.val;


                    let color = getColor(val, min, max);
                    const symbol = {
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        style: "circle",
                        color: color,
                        size: "18px",  // pixels
                    };

                    const popupTemplate = {
                        title: type+" point",
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

                    let _point = new Point(coord_x, coord_y);
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
        const zoom = view.zoom;
        const center = view.center;

        if (document.getElementById("switch_2d3d").checked) {

            view = new MapView({
                container: "map",
                map: map,
                zoom: zoom,
                minZoom: 5,
                center: center,
            });
            view.constraints = {minZoom: 3};

        } else {
            view = new SceneView({
                container: "map",
                map: map,
                zoom: zoom,
                minZoom: 5,
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
}

require(["esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color",
    "esri/layers/GraphicsLayer",

], requireHandler);
