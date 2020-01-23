import $ from "jquery";

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

    public isolines: any;
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