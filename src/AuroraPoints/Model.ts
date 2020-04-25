import $ from "jquery";

import {Point, Polygon, Feature} from "@turf/turf";
import {FeatureCollection, point, featureCollection} from '@turf/helpers'
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
    time: string;
}

export default class AuroraPointsModel {
    public time: Date;
    public url: string;

    public max: number;
    public min: number;

    public tins: FeatureCollection<Polygon>;

    public type: string;

    constructor(url: string) {
        this.url = url;
    }

    loadPoints(type: string, date:string): Promise<void> {
        console.log("load start");
        //@ts-ignore
        console.timeLog("time");
        return new Promise<void>((resolve, reject) => {
            $.ajax({
                url: this.url,
                data: {
                    type: type,
                    date:date,
                },
                success: (result: IServerResponse) => {
                    console.log("success");
                    //@ts-ignore
                    console.timeLog("time");
                    //this.points = [];
                    this.min = result.min;
                    this.max = result.max;
                    this.type = type;

                    this.time = new Date(Date.parse(result.time));
                    console.log(this.time);


                    interface MyProps {
                        value: number;
                    }

                    const featurePoints: Feature<Point, MyProps>[] =
                        result.points.map<Feature<Point, MyProps>>((_point: IServerValue) => {
                            return point<MyProps>([_point.lng, _point.lat], {value: _point.val});
                        });

                    const collection: FeatureCollection<Point, MyProps> = featureCollection<Point, MyProps>(featurePoints);


                    this.tins = tin(collection, 'value');


                    this.tins.features = this.tins.features.filter((feature) => {
                        return Object.values(feature.properties).every((value) => {
                            return value != null;
                        });
                    });

                    console.log("after TIN");
                    //@ts-ignore
                    console.timeLog("time");
                    resolve();
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log(textStatus);
                    console.log(jqXHR);
                    console.log(errorThrown);
                    reject();
                }
            });
        });

    }

}