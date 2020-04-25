import AuroraPointsController from './AuroraPoints/Controller';

//import $ from 'jquery';
require('./style/styles.scss');
import Root from "./components/Root.vue";
import setArcgisConfig from "./arcgisConfig";
setArcgisConfig();
import AsyncComputed from 'vue-async-computed'
import Vue from 'vue';
require('@fortawesome/fontawesome-free/css/all.css');

document.addEventListener('DOMContentLoaded', ()=>{
    Vue.use(AsyncComputed);
    const root = new Root({
        el:'#vue-root'
    });
    console.log('inited');
});



// $(() => {
//
//
//
//
//     const controller: AuroraPointsController = new AuroraPointsController();
//
//     // $('input[type=radio][name = type]').on('change', (e: Event) => {
//     //     const type: string = (e.target as HTMLInputElement).value;
//     //     controller.onSwitchType(type);
//     // });
//
// });
