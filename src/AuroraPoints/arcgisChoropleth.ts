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


export default class Chorroleth {
    map: Map;
    view: SceneView;
    layer: FeatureLayer;

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
    }

    init_all() {
        // Create a map and add it to a MapView


// Create FeatureLayer instance with popupTemplate

        this.layer = new FeatureLayer({
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

        watchUtils.whenFalseOnce(this.view, "updating", () => {
            this.generateRenderer()
        });
    }

    renderPoints(points: AuroraPoint[], min: number, max: number, type: string, isolines: FeatureCollection<MultiLineString>) {
    }

    generateRenderer() {
        // configure parameters for the color renderer generator
        // the layer must be specified along with a field name
        // or arcade expression. The view and other properties determine
        // the appropriate default color scheme.

        const colorParams = {
            layer: this.layer,
            valueExpression:
                "( $feature.POP_POVERTY / $feature.TOTPOP_CY ) * 100",
            view: this.view,
            theme: "above-and-below",
            outlineOptimizationEnabled: true
        };

        // Generate a continuous color renderer based on the
        // statistics of the data in the provided layer
        // and field normalized by the normalizationField.
        //
        // This resolves to an object containing several helpful
        // properties, including color scheme, statistics,
        // the renderer and visual variable

        let rendererResult: any;

        colorRendererCreator
            .createContinuousRenderer(colorParams)
            .then((response) => {
                // set the renderer to the layer and add it to the map
                rendererResult = response;
                this.layer.renderer = rendererResult.renderer;

                if (!this.map.layers.includes(this.layer)) {
                    this.map.add(this.layer);
                }

                // generate a histogram for use in the slider. Input the layer
                // and field or arcade expression to generate it.

                return histogram({
                    layer: this.layer,
                    valueExpression: colorParams.valueExpression,
                    view: this.view,
                    numBins: 70
                });
            })
            .then((histogramResult) => {
                // Construct a color slider from the result of both
                // smart mapping renderer and histogram methods
                const colorSlider = ColorSlider.fromRendererResult(
                    rendererResult,
                    histogramResult
                );
                colorSlider.container = "slider";
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
                this.view.ui.add("containerDiv", "bottom-left");

                // when the user slides the handle(s), update the renderer
                // with the updated color visual variable object

                const changeEventHandler = () => {
                    //@ts-ignore
                    const renderer = this.layer.renderer.clone();
                    const colorVariable = renderer.visualVariables[0].clone();
                    const outlineVariable = renderer.visualVariables[1];
                    colorVariable.stops = colorSlider.stops;
                    renderer.visualVariables = [colorVariable, outlineVariable];
                    this.layer.renderer = renderer;
                }

                // @ts-ignore
                colorSlider.on(["thumb-change", "thumb-drag", "min-change", "max-change"],
                    changeEventHandler
                );
            })
            .catch(function (error) {
                console.log("there was an error: ", error);
                console.log(colorParams);
            });
    }

}



