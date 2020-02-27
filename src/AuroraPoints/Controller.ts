import ArcgisView from "./views/arcgisView";
import AuroraPointsModel from "./Model";
import LeafletView from "./views/leafletView";
import leafletView from "./views/leafletView";
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
        this.view.renderPoints(this.model.points, this.model.min, this.model.max, this.model.type,
            this.model.isolines,
            this.model.tins);
    }

    onSwitchType(type: string) {
        this.model.loadPoints(type).then(() => {
            this.view.renderPoints(this.model.points, this.model.min, this.model.max, this.model.type,
                this.model.isolines,
                this.model.tins);
        }).catch((error) => {
            console.log(error);
        });
    }

    onChange2d_3d(use_2d: boolean) {
        //this.view.switch_2d3d(use_2d);
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