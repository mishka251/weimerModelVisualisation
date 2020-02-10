import {AuroraPoint} from "../Model";
import {FeatureCollection, MultiLineString, Polygon as turfPolygon} from "@turf/helpers";

export default abstract class AbstractView {

    constructor(container: string, onLoad: () => void) {

    }

    abstract renderPoints(points: AuroraPoint[], min: number, max: number, type: string,
                          isolines: FeatureCollection<MultiLineString>,
                          tins: FeatureCollection<turfPolygon>
    ): void ;
}
