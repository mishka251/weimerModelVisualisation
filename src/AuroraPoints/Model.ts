import $ from "jquery";

import {isolines, MultiLineString, Point, Polygon} from "@turf/turf";
import {FeatureCollection, point, feature, featureCollection} from '@turf/helpers'
import {Feature} from "@turf/turf"
import tin from "@turf/tin";

export interface AuroraPoint {
    latitude: number;
    longitude: number;
    value: number;
}

interface IServerValue {
    lat: number;
    lng: number;
    val: number;
}

interface IServerResponse {
    points: IServerValue[];
    min: number;
    max: number;
}

export default class AuroraPointsModel {
    public points: AuroraPoint[];
    public url: string;

    public max: number;
    public min: number;

    public isolines: FeatureCollection<MultiLineString>;
    public tins: FeatureCollection<Polygon>;

    public type: string;

    constructor(url: string) {
        this.url = url;
    }

    loadPoints(type: string): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            $.ajax({
                url: this.url,
                data: {
                    type: type
                },
                success: (result: IServerResponse) => {
                    this.points = [];
                    this.min = result.min;
                    this.max = result.max;
                    this.type = type;

                    for (const point of result.points) {
                        this.points.push({
                            latitude: point.lat,
                            longitude: point.lng,
                            value: point.val
                        });
                    }

                    interface MyProps {
                        value: number;
                    }

                    const featurePoints: Feature<Point, MyProps>[] = this.points.map<Feature<Point, MyProps>>((my_point: AuroraPoint) => {
                        return point<MyProps>([my_point.longitude, my_point.latitude], {value: my_point.value});
                    });

                    const collection: FeatureCollection<Point, MyProps> = featureCollection<Point, MyProps>(featurePoints);
                    //TODO сделать range генератор для этого
                    const breaks: number[] = [];// [-45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
                    for (let i = -15; i <= 15; i += 0.5) {
                        breaks.push(i);
                    }

                    this.isolines = isolines(collection, breaks, {zProperty: 'value'});
                    this.tins = tin(collection, 'value');
                    console.log(collection);
                    console.log(this.isolines);
                    console.log(this.tins);


                    this.points = this.points.filter((point)=>{
                        return point.value!=null;
                    });

                    this.tins.features = this.tins.features.filter((feature)=>{
                        return Object.values( feature.properties).every((value)=>{
                            return value!=null
                        });
                    });

                    console.log(this.tins);


                    resolve();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log(textStatus);
                    reject();
                }
            });
        });

    }

}