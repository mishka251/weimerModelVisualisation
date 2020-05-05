<template>
    <div class="container-fluid">
        <ArcgisMap
                :colors="colors"
                :breaks="breaks"
                :time="dateTime"
                :polygons="points"
        ></ArcgisMap>

        <div id="menu_map" class="col-md-3">
            <div class="menu_map-header wow zoomIn animated">
                Weimer model
            </div>

            <RadioButtonsField
                    label="parameter"
                    id="type"
                    :value.sync="type"
                    :possible-values="possibleTypes"
            ></RadioButtonsField>

            <DateTimeInput
                    :value.sync="dateTime"
                    label="Date and time"
            ></DateTimeInput>

            <ProgressBar v-show="isPreloaderVisible"></ProgressBar>
            <ColorBar
                    v-if="points"
                    :colors="colors"
                    :breaks="breaks"
            ></ColorBar>

            <!--                <div style="padding-top: 25px">-->
            <!--                    <span class="simple-text">Isolines</span>-->
            <!--                    <table>-->
            <!--                        <tr>-->
            <!--                            <td>-->
            <!--                                <label for="rb_epot">-->
            <!--                                    Epot-->
            <!--                                </label>-->

            <!--                                <input id="rb_epot" type="radio" value="epot" name="type" checked-->
            <!--                                       style=" width: 14px; height:14px ; display: table-cell; text-align: center;  vertical-align: middle;">-->
            <!--                            </td>-->

            <!--                            <td>-->
            <!--                                <label for="rb_mpfac">MPfac</label>-->
            <!--                                <input id="rb_mpfac" type="radio" value="mpfac" name="type"-->
            <!--                                       style="width: 14px; height:14px ; display: table-cell;  text-align: center;  vertical-align: middle;">-->
            <!--                            </td>-->
            <!--                        </tr>-->
            <!--                    </table>-->

            <!--                    <label for="date-input">Date</label>-->
            <!--                    <input type="text" id="date-input">-->

            <!--                    <label for="time-input">Time</label>-->
            <!--                    <input type="time" id="time-input">-->

            <!--                    &lt;!&ndash;                <div id="sliderDiv"></div>&ndash;&gt;-->
            <!--              -->
            <!--                </div>-->
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from "vue-property-decorator";
    import ArcgisMap from "./ArcgisMap.vue";

    import IItem from "./BaseComponents/IItem";
    import RadioButtonsField from "./RadioButtonsField/RadioButtonsField.vue";
    import DateTimeInput from "./DateTimeInput/DateTimeInput.vue";

    import ColorBar from "./colorBar.vue";
    import {Point, Polygon, Feature} from "@turf/turf";
    import AsyncComputed from "vue-async-computed-decorator";

    import {FeatureCollection, point, featureCollection} from '@turf/helpers'
    import tin from "@turf/tin";
    import axios, {AxiosError, AxiosResponse} from "axios";
    import Color = require("esri/Color");
    import {Exclusion} from "tslint/lib/rules/completed-docs/exclusion";
    import {debounce} from 'lodash';
    import ProgressBar from "./Preloader/ProgressBar.vue";
    import {format} from 'date-fns';

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

    interface IServerError {
        error: string[];
    }

    interface IServerCorrectResponse {
        points: IServerValue[];
        min: number;
        max: number;
        time: string;
    }

    type IServerResponse = IServerError | IServerCorrectResponse;

    @Component({
        components: {
            ArcgisMap,
            RadioButtonsField,
            DateTimeInput,
            ColorBar,
            ProgressBar,
        }
    })
    export default class Root extends Vue {
        possibleTypes: IItem[] = [
            {id: 'epot', caption: 'epot(V)'},
            {id: 'mpfac', caption: 'mpfac(A/m^2)'},
        ];
        type: IItem = this.possibleTypes[0];

        dateTime: Date = null;

        beforeMount(): void {
            const now = new Date();
            now.setDate(now.getDate()-1);
            this.dateTime=now;
        }

         isPreloaderVisible: boolean =false;

        // colors: any = [];
        get breaks(): number[] {
            if (this.type.id == 'epot') {
                return this.epotBreaks;
            }
            if (this.type.id == 'mpfac') {
                return this.mpfacBreaks;
            }
            throw new Error('unknown type');
        };

        url: string = '/points/';

        readonly colors: Color[] = [
            new Color([0, 0, 180, 1]),
            new Color([0, 36, 255, 0.9]),
            new Color([0, 165, 255, 0.8]),
            new Color([0, 255, 255, 0.6]),
            new Color([0, 255, 0, 0.4]),
            new Color([0, 255, 0, 0.2]),
            new Color([0, 255, 0, 0.0]),
            new Color([0, 255, 0, 0.2]),
            new Color([0, 255, 0, 0.4]),
            new Color([255, 255, 0, 0.6]),
            new Color([255, 165, 0, 0.8]),
            new Color([255, 36, 0, 0.9]),
            new Color([180, 0, 0, 1]),
        ].reverse();
        readonly epotBreaks = [
            -30,
            -20,
            -10,
            -5,
            -3,
            -1,
            1,
            3,
            5,
            10,
            20,
            30,
        ].reverse();

        readonly mpfacBreaks = [
            -0.5,
            -0.4,
            -0.3,
            -0.2,
            -0.1,
            -0.05,
            0.05,
            0.1,
            0.2,
            0.3,
            0.4,
            0.5
        ].reverse();

        points: FeatureCollection<Polygon> = null;
        // @AsyncComputed()
        // async points(): Promise<> {
        //     return await this.loadPoints(this.type.caption, this.dateTime.toISOString());
        // }

        // mounted() {
        //     this.loadPoints();
        // }

        @Watch('type')
        @Watch('dateTime')
        debouncedLoadPoints = debounce(this.loadPoints, 1000);

        loadPoints(): Promise<void> {
            //console.log("load start");
            //@ts-ignore
            // console.timeLog("time");
            this.isPreloaderVisible=true;
            this.points = null;
            return axios.get(this.url, {
                params: {
                    type: this.type.id,
                    date: format( this.dateTime, `yyyy-MM-dd'T'HH:mm:ss`),
                }
            })
                .then<void>((response: AxiosResponse<IServerResponse>) => {
                    const result: IServerResponse = response.data;
                    //console.log("success");
                    //@ts-ignore
                    // console.timeLog("time");

                    if (result.error) {
                        alert("Error: " + (result as IServerError).error);
                        this.isPreloaderVisible=false;
                        return null;
                    }

                    interface MyProps {
                        value: number;
                    }

                    const featurePoints: Feature<Point, MyProps>[] =
                        (result as IServerCorrectResponse).points.map<Feature<Point, MyProps>>((_point: IServerValue) => {
                            return point<MyProps>([_point.lng, _point.lat], {value: _point.val});
                        });

                    const collection: FeatureCollection<Point, MyProps> = featureCollection<Point, MyProps>(featurePoints);


                    let tins: FeatureCollection<Polygon> = tin(collection, 'value');


                    tins.features = tins.features.filter((feature) => {
                        return Object.values(feature.properties).every((value) => {
                            return value != null;
                        });
                    });

                    // console.log("after TIN");
                    //@ts-ignore
                    // console.timeLog("time");
                    this.isPreloaderVisible=false;
                    this.points = tins;

                }).catch((error: AxiosError) => {
                    console.error(error);
                    alert(error);
                    this.isPreloaderVisible=false;
                });


            // return new Promise<void>((resolve, reject) => {
            //     $.ajax({
            //         url: this.url,
            //         data: {
            //             type: type,
            //             date: date,
            //         },
            //         success: (result: IServerResponse) => {
            //             console.log("success");
            //             //@ts-ignore
            //             console.timeLog("time");
            //             //this.points = [];
            //             //this.min = result.min;
            //             // this.max = result.max;
            //             //this.type = type;
            //
            //             //this.time = new Date(Date.parse(result.time));
            //             //console.log(this.time);
            //
            //
            //             interface MyProps {
            //                 value: number;
            //             }
            //
            //             const featurePoints: Feature<Point, MyProps>[] =
            //                 result.points.map<Feature<Point, MyProps>>((_point: IServerValue) => {
            //                     return point<MyProps>([_point.lng, _point.lat], {value: _point.val});
            //                 });
            //
            //             const collection: FeatureCollection<Point, MyProps> = featureCollection<Point, MyProps>(featurePoints);
            //
            //
            //             let tins = tin(collection, 'value');
            //
            //
            //             tins.features = tins.features.filter((feature) => {
            //                 return Object.values(feature.properties).every((value) => {
            //                     return value != null;
            //                 });
            //             });
            //
            //             console.log("after TIN");
            //             //@ts-ignore
            //             console.timeLog("time");
            //             resolve();
            //         },
            //         error: (jqXHR, textStatus, errorThrown) => {
            //             console.log(textStatus);
            //             console.log(jqXHR);
            //             console.log(errorThrown);
            //             reject();
            //         }
            //     });
            // });

        }

    }
</script>

<style scoped>
    #menu_map {
        right: 0;
        max-width: 280px;
        min-width: 100px;
        z-index: 6;
        background-color: #d8d8d8;
        opacity: 0.87;
        height: 100%;
        padding: 5px -15px 45px;

    }

    .menu_map-header {
        width: 90%;
        display: inline-block;
        color: green;
        text-align: center;
    }

    .container-fluid {
        height: 100%;
        padding-left: 0;
    }
</style>