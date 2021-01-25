import SceneView from 'esri/views/SceneView';
import SceneViewProperties from 'esri/views/SceneView';

export default class MyCustomSceneView extends SceneView {
    constructor(params: Partial<SceneViewProperties> ) {
        super(params);
        console.log(this);
        this.environment.lighting = null;
    }
}