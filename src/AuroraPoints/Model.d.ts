import { Polygon } from "@turf/turf";
import { FeatureCollection } from '@turf/helpers';
export interface AuroraPoint {
    latitude: number;
    longitude: number;
    value: number;
}
export default class AuroraPointsModel {
    time: Date;
    url: string;
    max: number;
    min: number;
    tins: FeatureCollection<Polygon>;
    type: string;
    constructor(url: string);
    loadPoints(type: string, date: string): Promise<void>;
}
