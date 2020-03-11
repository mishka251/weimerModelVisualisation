import AuroraPointsModel, {AuroraPoint} from "../Model";
import {FeatureCollection, MultiLineString, Polygon as turfPolygon} from "@turf/helpers";

export default abstract class AbstractView {

    constructor(container: string, onLoad: () => void) {

    }

    abstract renderPoints(model: AuroraPointsModel): void ;
}
