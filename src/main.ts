import AuroraPointsController from './AuroraPoints/Controller';
import $ from 'jquery';


import esriConfig from "esri/config";

// Set worker's AMD loader configuration to set up
// a path to folder called workersFolder.
$(() => {
    // CDN version of the API
    const DEFAULT_WORKER_URL = "https://js.arcgis.com/4.14/";
// Lite AMD loader on the CDN
    const DEFAULT_LOADER_URL = `${DEFAULT_WORKER_URL}dojo/dojo-lite.js`;

// You define the `esriConfig.workers.loaderUrl` to point to the CDN
    (esriConfig.workers as any).loaderUrl = DEFAULT_LOADER_URL;
    esriConfig.workers.loaderConfig = {
         name: "arcgis-js-api",
        location: `${DEFAULT_WORKER_URL}esri`,
        // Set up the loader config
        // to treat the CDN as the base url for workers
        baseUrl: `${DEFAULT_WORKER_URL}dojo`,
        // need to also let the workers know
        // where the module packages are on the CDN
        packages: [
            { name: "arcgis-js-api", location: `${DEFAULT_WORKER_URL}esri`},
            {name: "esri", location: DEFAULT_WORKER_URL + "esri"},
            {name: "dojo", location: DEFAULT_WORKER_URL + "dojo"},
            {name: "dojox", location: DEFAULT_WORKER_URL + "dojox"},
            {name: "dijit", location: DEFAULT_WORKER_URL + "dijit"},
            {name: "dstore", location: DEFAULT_WORKER_URL + "dstore"},
            {name: "moment", location: DEFAULT_WORKER_URL + "moment"},
            {name: "@dojo", location: DEFAULT_WORKER_URL + "@dojo"},
            {
                name: "cldrjs",
                location: DEFAULT_WORKER_URL + "cldrjs",
                main: "dist/cldr"
            },
            {
                name: "globalize",
                location: DEFAULT_WORKER_URL + "globalize",
                main: "dist/globalize"
            },
            {
                name: "maquette",
                location: DEFAULT_WORKER_URL + "maquette",
                main: "dist/maquette.umd"
            },
            {
                name: "maquette-css-transitions",
                location: DEFAULT_WORKER_URL + "maquette-css-transitions",
                main: "dist/maquette-css-transitions.umd"
            },
            {
                name: "maquette-jsx",
                location: DEFAULT_WORKER_URL + "maquette-jsx",
                main: "dist/maquette-jsx.umd"
            },
            {name: "tslib", location: DEFAULT_WORKER_URL + "tslib", main: "tslib"}
        ]
    } as any;


    const controller: AuroraPointsController = new AuroraPointsController();

    $('input[type=radio][name = type]').on('change', (e: Event) => {
        const type: string = (e.target as HTMLInputElement).value;
        controller.onSwitchType(type);
    });

});
