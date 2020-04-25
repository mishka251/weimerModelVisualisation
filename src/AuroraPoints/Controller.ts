import AuroraPointsModel from "./Model";
import ArcgisTin from "./views/arcgisTIN";
import AbstractView from "./views/abstractView";

import $ from "jquery";

export default class AuroraPointsController {
    model: AuroraPointsModel;
    view: AbstractView;


    onMapLoad(): void {
        console.log("map load");
        console.log(this);
        console.log("on map load");
        //@ts-ignore
        console.timeLog("time");
        this.view.renderPoints(this.model);
    }

    onSwitchType(type: string) {
        console.log($('#date-input').val());
        const date:string = $('#date-input').val() as string;
        this.model.loadPoints(type,  date).then(() => {
            this.view.renderPoints(this.model);
        }).catch((error) => {
            console.log(error);
        });
    }


    constructor() {
        console.time("time");
        const date:string = $('#date-input').val() as string;

        this.model = new AuroraPointsModel("points");

        this.view = new ArcgisTin("map", () => this.onMapLoad());
        this.model.loadPoints("epot", date).then(() => {
            console.log("after load points");
            //@ts-ignore
            console.timeLog("time");
            this.onMapLoad()
        }).catch((error) => {
            console.log(error);
        });
    }
}