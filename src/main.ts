import AuroraPointsController from "./AuroraPoints/Controller";
import $ from "jquery";

$(document).ready(() => {

    const controller: AuroraPointsController = new AuroraPointsController();

    $('#switch_2d3d').on("change", (e: Event) => {
        controller.onChange2d_3d((e.target as HTMLInputElement).checked);
    });

    $('input[type=radio][name = type]').on("change", (e: Event) => {
        const type: string = (e.target as HTMLInputElement).value;
        controller.onSwitchType(type);
    });

});