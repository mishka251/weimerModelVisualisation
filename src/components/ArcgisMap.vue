<template>
    <div class="map"></div>
</template>

<script lang="ts">
    import Map from 'esri/Map';
    import SceneView from 'esri/views/SceneView';
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import Camera from 'esri/Camera';
    import DirectLineMeasurement3D from 'esri/widgets/DirectLineMeasurement3D';
    import {FeatureCollection, Polygon as turfPolygon, Feature} from '@turf/turf';
    import GraphicsLayer from 'esri/layers/GraphicsLayer';
    import Graphic from 'esri/Graphic';
    import Polygon from "esri/geometry/Polygon";
    import Color from 'esri/Color';
    import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";

    @Component
    export default class ArcgisMap extends Vue {
        view: SceneView | null = null;
        camera: Camera;
        @Prop({type: Object, default: null}) polygons: FeatureCollection<turfPolygon> = null;
        @Prop({type: Date}) time: Date;
        @Prop({type: Array}) colors: Color[];
        @Prop({type: Array}) breaks: number[];

        getColor2(value: number): Color {
           // console.assert(this.colors.length == this.breaks.length + 1);
            if (value > this.breaks[0]) {
                return this.colors[0];
            }
            for (let i = 1; i < this.breaks.length; i++) {
                if (this.breaks[i - 1] >= value && value >= this.breaks[i]) {
                    return this.colors[i];
                }
            }

            return this.colors[this.colors.length - 1];
        }

        @Watch('polygons')
        setLayer(){
            this.layer=this.polygonsLayer;
        }

        get polygonsLayer(): GraphicsLayer {
            const isolines = this.layer;
            isolines.removeAll();
            if(this.polygons==null){
                return isolines;
            }
           // console.log("render start");
            //@ts-ignore
           // console.timeLog("time");

            // const type: string = model.type;
            // const tins: FeatureCollection<turfPolygon> = model.tins;
            // const time: Date = model.time;

            const hours: number = this.time.getHours();
           // console.log(hours);
            const deltaLongitude: number = (hours - 12) * 15;
            const cameraLatitude: number = deltaLongitude >= 0 ? deltaLongitude : 360 + deltaLongitude;
            this.camera.position.longitude = cameraLatitude;
            this.view.goTo(this.camera);
            //this.isolines.removeAll();

            //console.log("before polygons");
            //@ts-ignore
           // console.timeLog("time");
           // console.log(this.polygons);
            let polygons = this.polygons.features.map<Graphic>((feature: Feature<turfPolygon>) => {

                const polygon = new Polygon({
                    rings: feature.geometry.coordinates
                });

                const param = (feature.properties.a + feature.properties.b + feature.properties.c) / 3;

                const fillSymbol: SimpleFillSymbol = new SimpleFillSymbol({
                    color: this.getColor2(param),
                    outline: {
                        width: 0
                    }
                });

                return new Graphic({
                    geometry: polygon,
                    symbol: fillSymbol
                });
            });

           // console.log("polygons");
            //@ts-ignore
            //console.timeLog("time");

            //const breaks = type === "epot" ? this.epotBreaks : this.mpfacBreaks;


            // const visibleBreaks: number[] = [];
            // const visibleColor: Color[] = [this.colors[0]];
            // for (let i = 1; i < this.colors.length; i++) {
            //     if (this.colors[i].a > 0.3) {
            //         visibleBreaks.push(breaks[i - 1]);
            //         visibleColor.push(this.colors[i]);
            //     }
            // }

            // visibleBreaks.reverse();
            // visibleColor.reverse();

            // this.colorBar.$set(this.colorBar, 'breaks', visibleBreaks);
            // this.colorBar.$set(this.colorBar, 'colors', visibleColor);

           // console.log("load colors");
            //@ts-ignore
           // console.timeLog("time");

            polygons = polygons.filter((polygon) => {
                return polygon != null;
            });
            isolines.addMany(polygons);


            //console.log("polygons loaded");
            //@ts-ignore
            //console.timeLog("time");

            return isolines;
        }

        layer:GraphicsLayer;

        mounted() {
            const map = new Map({
                basemap: "hybrid",
                ground: "world-elevation",
            });

            this.camera = new Camera({
                position: {
                    latitude: 89,
                    longitude: 0,
                    z: 20_000_000,
                    hasZ: true,
                },

            });

            this.view = new SceneView({
                container: this.$el as HTMLDivElement,
                map: map,
                zoom: 5,
                camera: this.camera,
                qualityProfile: "high",
                alphaCompositingEnabled: true,
                highlightOptions: {
                    fillOpacity: 0,
                    color: "#ffffff"
                },
            });

            this.view.ui.empty('top-left');

            const measure3d = new DirectLineMeasurement3D({
                view: this.view
            });
            this.view.ui.add(measure3d, 'top-right');
            this.layer = new GraphicsLayer();
            map.add(this.layer);
        }


        beforeDestroy() {
            // destroy the map view
            if (this.view) {
                this.view.container = null;
            }
        }
    };
</script>

<style scoped>
    .map {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100%;
    }
</style>