import ArcgisView from "./views/arcgisView";
import AuroraPointsModel from "./Model";
import Chorroleth from "./views/arcgisChoropleth";
//import {AuroraPoint} from "./Model";
import ArcgisTin from "./views/arcgisTIN";
import AbstractView from "./views/abstractView";
import ArcgisTinColor from "./views/arcgisTinChoropleth";
import ArcgisChoropleth from "./views/arcgisChoropleth";

export default class AuroraPointsController {
    model: AuroraPointsModel;
    view: AbstractView;


    onMapLoad(): void {
        console.log("map load");
        console.log(this);
        this.view.renderPoints(this.model);
    }

    onSwitchType(type: string) {
        this.model.loadPoints(type).then(() => {
            this.view.renderPoints(this.model);
        }).catch((error) => {
            console.log(error);
        });
    }


    constructor() {
        this.model = new AuroraPointsModel("points");

        this.model.loadPoints("epot").then(() => {
            this.view = new ArcgisTin("map", () => this.onMapLoad());
        }).catch((error) => {
            console.log(error);
        });
    }
}