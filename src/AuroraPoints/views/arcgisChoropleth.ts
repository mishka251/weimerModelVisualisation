import Map from "esri/Map";
import MapView from "esri/views/MapView";
import SceneView from "esri/views/SceneView";
import FeatureLayer from "esri/layers/FeatureLayer";
import * as colorRendererCreator from "esri/renderers/smartMapping/creators/color";
import histogram from "esri/renderers/smartMapping/statistics/histogram";
import ColorSlider from "esri/widgets/smartMapping/ColorSlider";
import * as watchUtils from "esri/core/watchUtils";
import AuroraPointsModel, {AuroraPoint} from "../Model";
import {FeatureCollection, MultiLineString, Polygon as turfPolygon, Polygon} from "@turf/helpers";
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
import ColorVariable from "esri/renderers/visualVariables/ColorVariable";
import colorCreateContinuousRendererParams = __esri.colorCreateContinuousRendererParams;
import AbstractView from "./abstractView";

export default class Chorroleth extends AbstractView {
    map: Map;
    view: SceneView;
    //testLayer: FeatureLayer;
    graphicLayer: FeatureLayer;

    constructor(container: string, onLoad: () => void) {
        super(container, onLoad);
        this.map = new Map({
            basemap: "gray-vector"
        });

        this.view = new SceneView({
            container: container,
            map: this.map,
            center: [-85.0502, 33.125524],
            zoom: 5
        });


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

    renderPoints(model:AuroraPointsModel) {

                const points: AuroraPoint[] = model.points;
        const min: number = model.min;
        const max: number = model.max;
        const type: string = model.type;
        const isolines: FeatureCollection<MultiLineString> = model.isolines;
        const tins: FeatureCollection<turfPolygon> = model.tins;
        const time: Date = model.time;

        console.log("start render");
        const arr_graphics: Graphic[] = [];


        const latitudeFieldInfo: FieldInfo = new FieldInfo({
            fieldName: "latitude",
            label: "latitude"
        });

        const longitudeFieldInfo: FieldInfo = new FieldInfo({
            fieldName: "longitude",
            label: "longitude"
        });

        const valueFieldInfo: FieldInfo = new FieldInfo({
            fieldName: "value",
            label: "value"
        });

        const fieldInfos: FieldInfo[] = [
            latitudeFieldInfo,
            longitudeFieldInfo,
            valueFieldInfo];

        const content: FieldsContent = new FieldsContent({
            fieldInfos: fieldInfos
        });

        const contents: PopupContent[] = [content];

        const popupTemplate: PopupTemplate = new PopupTemplate({
            title: type + " point",
            content: contents
        });


        if (this.graphicLayer) {
            this.map.remove(this.graphicLayer);
        }

        for (const point of points) {
            let val: number = point.value;


            let color: Color = this.getColor(val, min, max);
            const symbol: SimpleMarkerSymbol = new SimpleMarkerSymbol({
                style: "circle",
                color: color,
                size: 6  // pixels
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
                    latitude: point.latitude,
                    longitude: point.longitude,
                    value: point.value,
                }

            });
            arr_graphics.push(graphics);
            //this.graphicLayer.add(graphics);
        }
        console.log(arr_graphics);

        this.graphicLayer = new FeatureLayer({
            source: arr_graphics,  // array of graphics objects
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
                {
                    name: "latitude",
                    type: "double"
                },
                {
                    name: "longitude",
                    type: "double"
                }],
            popupTemplate: popupTemplate,
            renderer: new SimpleRenderer({  // overrides the layer's default renderer
                //type: "simple",
                symbol: new SimpleMarkerSymbol({
                    style: "circle"
                }),
                visualVariables: [
                    new ColorVariable({
                        field: "value",
                        //normalizationField: "SQ_KM",
                        // features with 30 ppl/sq km or below are assigned the first color
                        stops: [{value: 0, color: "#FFFCD4"},
                            {value: 10, color: "#0D2644"}]
                    })]

            })
        });

        this.map.add(this.graphicLayer);
        this.generateRenderer();

    }

    generateRenderer() {
        // configure parameters for the color renderer generator
        // the testLayer must be specified along with a field name
        // or arcade expression. The view and other properties determine
        // the appropriate default color scheme.


        const colorParams2: colorCreateContinuousRendererParams = {
            layer: this.graphicLayer,
            field: 'value',
            view: this.view,
            theme: "high-to-low",
            symbolType: "3d-flat",
            outlineOptimizationEnabled: true
        };

        colorRendererCreator
            .createContinuousRenderer(colorParams2)
            .then<any[]>((rendererResult) => {
                // set the renderer to the testLayer and add it to the map
                //rendererResult = response;

                this.graphicLayer.renderer = rendererResult.renderer;
                this.graphicLayer.refresh();

                return [histogram({
                    layer: this.graphicLayer,
                    valueExpression: colorParams2.valueExpression,
                    view: this.view,
                    numBins: 70
                }), rendererResult];
            })
            .then(([histogramResult, rendererResult]) => {
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
                    this.graphicLayer.renderer = renderer;
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



