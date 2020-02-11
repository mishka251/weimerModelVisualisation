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

import colorCreateContinuousRendererParams = __esri.colorCreateContinuousRendererParams;

import Polygon from "esri/geometry/Polygon";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import {AuroraPoint} from "../Model";
import {
    FeatureCollection,
    Polygon as turfPolygon,
    MultiLineString
} from "@turf/helpers";
import LineSymbol from "esri/symbols/LineSymbol3D";
import * as colorRendererCreator from "esri/renderers/smartMapping/creators/color";
import histogram from "esri/renderers/smartMapping/statistics/histogram";
import ColorSlider from "esri/widgets/smartMapping/ColorSlider";

import FeatureLayer from "esri/layers/FeatureLayer";
import SimpleRenderer from "esri/renderers/SimpleRenderer";
import ColorVariable from "esri/renderers/visualVariables/ColorVariable";
import AbstractView from "./abstractView";

export default class ArcgisTinColor extends AbstractView {
    map: Map;
    // markerLayer: GraphicsLayer;
    view: SceneView | MapView;
    constraints: MapViewConstraints;
    container: string;

    isolines: FeatureLayer;

    constructor(container: string, onLoad: () => void) {
        super(container, onLoad);
        this.container = container;
        this.map = new Map({
            basemap: "gray"
        });
        // this.markerLayer = new GraphicsLayer();
        //this.isolines = new FeatureLayer({});
        //this.map.add(this.markerLayer);


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


        let polygons = tins.features.map<Graphic>((feature) => {
            const polygon = new Polygon({
                rings: feature.geometry.coordinates
            });


            const param = (feature.properties.a + feature.properties.b + feature.properties.c) / 3;

            const fillSymbol = new SimpleFillSymbol({
                color: this.getColor(param, min, max),
                outline:  {
                    // autocasts as new SimpleLineSymbol()
                    color: this.getColor(param, min, max),
                    width: 1
                }
            });
            //console.log(feature);
            return new Graphic({
                geometry: polygon,
                symbol: fillSymbol,
                attributes: {
                    //latitude:feature.geometry.centroid,
                    //latitude: point.latitude,
                    //longitude: point.longitude,
                    value: param,
                    // id: Math.random()
                }
            });
        });

        polygons = polygons.filter((polygon) => {
            return polygon != null;
        });

        // const latitudeFieldInfo: FieldInfo = new FieldInfo({
        //     fieldName: "latitude",
        //     label: "latitude"
        // });
        //
        // const longitudeFieldInfo: FieldInfo = new FieldInfo({
        //     fieldName: "longitude",
        //     label: "longitude"
        // });

        const valueFieldInfo: FieldInfo = new FieldInfo({
            fieldName: "value",
            label: "value"
        });

        const fieldInfos: FieldInfo[] = [
            // latitudeFieldInfo,
            // longitudeFieldInfo,
            valueFieldInfo];

        const content: FieldsContent = new FieldsContent({
            fieldInfos: fieldInfos
        });

        const contents: PopupContent[] = [content];

        const popupTemplate: PopupTemplate = new PopupTemplate({
            title: type + " point",
            content: contents
        });


        console.log(polygons);

        this.isolines = new FeatureLayer({
            source: polygons,  // array of graphics objects
            objectIdField: "id",
            fields: [
                {
                    name: "id",
                    type: "oid"
                },
                {
                    name: "value",
                    type: "double"
                },
                // {
                //     name: "latitude",
                //     type: "double"
                // },
                // {
                //     name: "longitude",
                //     type: "double"
                // }
            ],
            popupTemplate: popupTemplate,
            renderer: new SimpleRenderer({  // overrides the layer's default renderer
                //type: "simple",
                symbol: new SimpleFillSymbol({
                    //type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    //color: this.getColor(param, min, max),
                    outline: {
                        // autocasts as new SimpleLineSymbol()
                        //color: this.getColor(param, min, max),
                        width: 1
                    }
                }),
                visualVariables: [
                    new ColorVariable({
                        field: "value",
                        // normalizationField: "SQ_KM",
                        // features with 30 ppl/sq km or below are assigned the first color
                        stops: [{value: 0, color: "#FFFCD4"},
                            {value: 10, color: "#0D2644"}]
                    })]

            })
        });

        this.map.add(this.isolines);
        this.generateRenderer();
        // polygons.forEach((polygon) => {
        //     this.isolines.add(polygon);
        // })
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


    generateRenderer() {
        // configure parameters for the color renderer generator
        // the testLayer must be specified along with a field name
        // or arcade expression. The view and other properties determine
        // the appropriate default color scheme.


        const colorParams2: colorCreateContinuousRendererParams = {
            layer: this.isolines,
            field: 'value',
            //valueExpression:"$feature.value",
            view: this.view,
            theme: "high-to-low",
            symbolType: "3d-flat",
        };

        colorRendererCreator
            .createContinuousRenderer(colorParams2)
            .then<any>((rendererResult) => {
                // set the renderer to the testLayer and add it to the map
                //rendererResult = response;


                this.isolines.renderer = rendererResult.renderer;
                this.isolines.refresh();

                return [histogram({
                    layer: this.isolines,
                    valueExpression: colorParams2.valueExpression,
                    view: this.view,
                    numBins: 70
                }), rendererResult];


            })
            .then<void>(([histogramResult, rendererResult]) => {
                // Construct a color slider from the result of both
                // smart mapping renderer and histogram methods

                const colorSlider = ColorSlider.fromRendererResult(
                    rendererResult,
                    histogramResult
                );

                const slider = document.createElement("div");
                slider.classList.add("slider");

                colorSlider.container = slider;//"slider";
                colorSlider.primaryHandleEnabled = true;
                // Round labels to 1 decimal place
                colorSlider.labelFormatFunction = function (value, type) {
                    return value.toFixed(1);
                };
                // styles the standard deviation lines to be shorter
                // than the average line
                colorSlider.histogramConfig.dataLineCreatedFunction = function (
                    lineElement,
                    labelElement,
                    index
                ) {
                    if (index != null) {
                        lineElement.setAttribute("x2", "66%");
                        const sign = index === 0 ? "-" : "+";
                        labelElement.innerHTML = sign + "σ";
                    }
                };
                colorSlider.viewModel.precision = 1;

                this.view.ui.empty("bottom-left");

                const container = document.createElement("div");
                container.classList.add("containerDiv");
                container.innerText = "Header";
                container.append(slider);
                this.view.ui.add(container, "bottom-left");


                // when the user slides the handle(s), update the renderer
                // with the updated color visual variable object

                const changeEventHandler = () => {
                    //@ts-ignore
                    const renderer = this.graphicLayer.renderer.clone();
                    const colorVariable = renderer.visualVariables[0].clone();
                    const outlineVariable = renderer.visualVariables[1];
                    colorVariable.stops = colorSlider.stops;
                    renderer.visualVariables = [colorVariable, outlineVariable];
                    this.isolines.renderer = renderer;
                };

                // @ts-ignore
                colorSlider.on(["thumb-change", "thumb-drag", "min-change", "max-change"],
                    changeEventHandler
                );


            })
            .catch(function (error) {
                console.log("there was an error: ", error);
                console.log(colorParams2);
            });
    }

}
