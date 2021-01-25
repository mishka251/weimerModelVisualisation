/// <reference types="arcgis-js-api" />
import SceneView from 'esri/views/SceneView';
import SceneViewProperties from 'esri/views/SceneView';
export default class MyCustomSceneView extends SceneView {
    constructor(params: Partial<SceneViewProperties>);
}
