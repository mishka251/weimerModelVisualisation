import AuroraPointsModel from "./Model";
import AbstractView from "./views/abstractView";
export default class AuroraPointsController {
    model: AuroraPointsModel;
    view: AbstractView;
    onMapLoad(): void;
    onSwitchType(type: string): void;
    constructor();
}
