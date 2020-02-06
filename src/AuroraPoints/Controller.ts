import ArcgisView from "./arcgisView";
import AuroraPointsModel from "./Model";
import LeafletView from "./leafletView";
import arcgisView from "./arcgisView";
import leafletView from "./leafletView";
import Chorroleth from "./arcgisChoropleth"
//import {AuroraPoint} from "./Model";

export default class AuroraPointsController {
    model: AuroraPointsModel;
    view: ArcgisView | LeafletView | Chorroleth;


    onMapLoad(): void {
        console.log("map load");
        console.log(this);
        this.view.renderPoints(this.model.points, this.model.min, this.model.max, this.model.type, this.model.isolines);
    }

    onSwitchType(type: string) {
        this.model.loadPoints(type).then(() => {
            this.view.renderPoints(this.model.points, this.model.min, this.model.max, this.model.type, this.model.isolines);
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
            this.view = new Chorroleth("map", () => this.onMapLoad());
        }).catch((error) => {
            console.log(error);
        });
    }
}