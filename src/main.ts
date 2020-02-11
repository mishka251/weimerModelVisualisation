import AuroraPointsController from './AuroraPoints/Controller';
import $ from 'jquery';

//require('dojo');
import esriConfig from "esri/config";

// Set worker's AMD loader configuration to set up
// a path to folder called workersFolder.
$(() => {
    const DEFAULT_WORKER_URL = "http://127.0.0.1:8000/static/dist/"; //"https://js.arcgis.com/4.14/";
    const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo.js`;
    esriConfig.fontsUrl = "http://static.arcgis.com/fonts";
    esriConfig.workers.loaderUrl = DEFAULT_LOADER_URL;
    esriConfig.workers.loaderConfig = {
        baseUrl: `${DEFAULT_WORKER_URL}dojo`,
        packages: [
            {name: "esri", location: `${DEFAULT_WORKER_URL}esri`},
            {name: "dojo", location: `${DEFAULT_WORKER_URL}dojo`},
            {name: "dojox", location: `${DEFAULT_WORKER_URL}dojox`},
            {name: "dstore", location: `${DEFAULT_WORKER_URL}dstore`},
            {name: "moment", location: `${DEFAULT_WORKER_URL}moment`},
            {name: "@dojo", location: `${DEFAULT_WORKER_URL}@dojo`},
            {
                name: "cldrjs",
                location: `${DEFAULT_WORKER_URL}cldrjs`,
                main: "dist/cldr"
            },
            {
                name: "globalize",
                location: `${DEFAULT_WORKER_URL}globalize`,
                main: "dist/globalize"
            },
            {
                name: "maquette",
                location: `${DEFAULT_WORKER_URL}maquette`,
                main: "dist/maquette.umd"
            },
            {
                name: "maquette-css-transitions",
                location: `${DEFAULT_WORKER_URL}maquette-css-transitions`,
                main: "dist/maquette-css-transitions.umd"
            },
            {
                name: "maquette-jsx",
                location: `${DEFAULT_WORKER_URL}maquette-jsx`,
                main: "dist/maquette-jsx.umd"
            },
            {name: "tslib", location: `${DEFAULT_WORKER_URL}tslib`, main: "tslib"}
        ]
    };


    const controller: AuroraPointsController = new AuroraPointsController();

    $('#switch_2d3d').on('change', (e: Event) => {
        controller.onChange2d_3d((e.target as HTMLInputElement).checked);
    });

    $('input[type=radio][name = type]').on('change', (e: Event) => {
        const type: string = (e.target as HTMLInputElement).value;
        controller.onSwitchType(type);
    });

});
