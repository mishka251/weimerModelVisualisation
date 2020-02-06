import Map from "esri/Map";
import MapView from "esri/views/MapView";
import SceneView from "esri/views/SceneView";
import FeatureLayer from "esri/layers/FeatureLayer";
import * as colorRendererCreator from "esri/renderers/smartMapping/creators/color";
import histogram from "esri/renderers/smartMapping/statistics/histogram";
import ColorSlider from "esri/widgets/smartMapping/ColorSlider";
import * as watchUtils from "esri/core/watchUtils";
import {AuroraPoint} from "./Model";
import {FeatureCollection, MultiLineString} from "@turf/helpers";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Color from "esri/Color";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import FieldInfo from "esri/popup/FieldInfo";
import FieldsContent from "esri/popup/content/FieldsContent";
import PopupContent from "esri/popup/content/Content";
import PopupTemplate from "esri/PopupTemplate";
import Point from "esri/geometry/Point";
import Graphic from "esri/Graphic";

import SimpleRenderer from "esri/renderers/SimpleRenderer";

export default class Chorroleth {
    map: Map;
    view: SceneView;
    testLayer: FeatureLayer;
    graphicLayer: FeatureLayer;

    constructor(container: string, onLoad: () => void) {
        this.map = new Map({
            basemap: "gray-vector"
        });

        this.view = new SceneView({
            container: container,
            map: this.map,
            center: [-85.0502, 33.125524],
            zoom: 5
        });

        this.init_all();

        this.view.when(onLoad);
    }

    init_all() {
        // Create a map and add it to a MapView


// Create FeatureLayer instance with popupTemplate

        this.testLayer = new FeatureLayer({
            url:
                "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/counties_politics_poverty/FeatureServer/0",
            popupTemplate: {
                // autocasts as new PopupTemplate()
                title: "{COUNTY}, {STATE}",
                content:
                    "{POP_POVERTY} of {TOTPOP_CY} people live below the poverty line.",
                fieldInfos: [
                    {
                        fieldName: "POP_POVERTY",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    },
                    {
                        fieldName: "TOTPOP_CY",
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }
                ]
            }
        });

        //this.graphicLayer = new GraphicsLayer();

        //this.map.add(this.testLayer);
        // this.map.add(this.graphicLayer);
        // watchUtils.whenFalseOnce(this.view, "updating", () => {
        //     this.generateRenderer();
        // });
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

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string, isolines: FeatureCollection<MultiLineString>) {

        console.log("start render");
        const arr_graphics: Graphic[] = [];

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
                    value: point.value,
                    id: 1
                }

            });
            arr_graphics.push(graphics);
            //this.graphicLayer.add(graphics);
        }

        this.graphicLayer = new FeatureLayer({
            source: arr_graphics,  // array of graphics objects
            objectIdField: "id",
            fields: [{
                name: "id",
                type: "oid"
            }, {
                name: "value",
                type: "double"
            }],
            popupTemplate: {
                content: "<img src='{url}'>"
            },
            renderer: new SimpleRenderer({  // overrides the layer's default renderer
              //type: "simple",
              symbol: new SimpleMarkerSymbol({
                  style: "circle"
              })
              //     {
              //   type: "text",
              //   color: "#7A003C",
              //   text: "\ue661",
              //   font: {
              //     size: 20,
              //     family: "CalciteWebCoreIcons"
              //   }
              // }
            })
        });

        //this.generateRenderer();

    }

    generateRenderer() {
        // configure parameters for the color renderer generator
        // the testLayer must be specified along with a field name
        // or arcade expression. The view and other properties determine
        // the appropriate default color scheme.

        const colorParams = {
            layer: this.testLayer,
            valueExpression:
                "( $feature.POP_POVERTY / $feature.TOTPOP_CY ) * 100",
            view: this.view,
            theme: "above-and-below",
            outlineOptimizationEnabled: true
        };

        const colorParams2 = {
            layer: this.graphicLayer,
            valueExpression:
                "( $feature.value ) * 100",
            view: this.view,
            theme: "above-and-below",
            outlineOptimizationEnabled: true
        };

        // Generate a continuous color renderer based on the
        // statistics of the data in the provided testLayer
        // and field normalized by the normalizationField.
        //
        // This resolves to an object containing several helpful
        // properties, including color scheme, statistics,
        // the renderer and visual variable

        //let rendererResult: any;

        colorRendererCreator
            .createContinuousRenderer(colorParams2)
            .then((rendererResult) => {
                // set the renderer to the testLayer and add it to the map
                //rendererResult = response;
                //@ts-ignore
                // this.graphicLayer.renderer = rendererResult.renderer;
            })
            .catch(function (error) {
                console.log("there was an error: ", error);
                console.log(colorParams2);
            });

        colorRendererCreator
            .createContinuousRenderer(colorParams)
            .then((rendererResult) => {
                // set the renderer to the testLayer and add it to the map
                //rendererResult = response;
                //this.testLayer.renderer = rendererResult.renderer;
                //@ts-ignore
                // this.graphicLayer.renderer = rendererResult.renderer;
                //
                // if (!this.map.layers.includes(this.testLayer)) {
                //     this.map.add(this.testLayer);
                // }

                // generate a histogram for use in the slider. Input the testLayer
                // and field or arcade expression to generate it.

                // return histogram({
                //     testLayer: this.testLayer,
                //     valueExpression: colorParams.valueExpression,
                //     view: this.view,
                //     numBins: 70
                // });
            })
            .then((histogramResult) => {
                // Construct a color slider from the result of both
                // smart mapping renderer and histogram methods
                // const colorSlider = ColorSlider.fromRendererResult(
                //     rendererResult,
                //     histogramResult
                // );
                // colorSlider.container = "slider";
                // colorSlider.primaryHandleEnabled = true;
                // // Round labels to 1 decimal place
                // colorSlider.labelFormatFunction = function (value, type) {
                //     return value.toFixed(1);
                // };
                // styles the standard deviation lines to be shorter
                // than the average line
                // colorSlider.histogramConfig.dataLineCreatedFunction = function (
                //     lineElement,
                //     labelElement,
                //     index
                // ) {
                //     if (index != null) {
                //         lineElement.setAttribute("x2", "66%");
                //         const sign = index === 0 ? "-" : "+";
                //         labelElement.innerHTML = sign + "σ";
                //     }
                // };
                // colorSlider.viewModel.precision = 1;
                // this.view.ui.add("containerDiv", "bottom-left");

                // when the user slides the handle(s), update the renderer
                // with the updated color visual variable object

                // const changeEventHandler = () => {
                //     //@ts-ignore
                //     const renderer = this.testLayer.renderer.clone();
                //     const colorVariable = renderer.visualVariables[0].clone();
                //     const outlineVariable = renderer.visualVariables[1];
                //     colorVariable.stops = colorSlider.stops;
                //     renderer.visualVariables = [colorVariable, outlineVariable];
                //     this.testLayer.renderer = renderer;
                // }

                // @ts-ignore
                // colorSlider.on(["thumb-change", "thumb-drag", "min-change", "max-change"],
                //     changeEventHandler
                // );
            })
            .catch(function (error) {
                console.log("there was an error: ", error);
                console.log(colorParams);
            });
    }

}



