import * as THREE from '../build/three.module.js';
import { EyeLabelSystem } from './eyeLabelSystem.js';
import { ModelLoader } from './modelLoader.js';
import { ModelVpdGui } from './modelVpdGui.js';
import { MorphContainer } from './morphContainer.js';

export class PmxEditor{
    constructor(scene, camera, modelData, mouseRaycaster, gui, vpdLoader, morphsGui, callback=function(){}){
        this.scene = scene;
        this.camera = camera;
        this.modelData = modelData;
        this.mouseRaycaster = mouseRaycaster;
        this.gui = gui;
        this.vpdLoader = vpdLoader;
        this.morphsGui = morphsGui;
        this.callback = callback;

        this.modelPath = this.modelData.location;

		this.mesh;
		this.eyeLabelSystem;
		this.vpdsGui;

		this.eyes;
		this.neck;

        var scope = this;
        this.modelLoader = new ModelLoader(
            this.modelPath,
            this.scene,
            (modelLoader) => {
                scope.mesh = modelLoader.model;
                scope.updateEyes();
                scope.updateNeck();
                scope.eyeLabelSystem = new EyeLabelSystem(scene, scope.mouseRaycaster);
                // scope.vpdsGui = new ModelVpdGui(modelLoader, vpdLoader, gui);
                scope.morphContainer = new MorphContainer(scope.morphsGui, scope.vpdsGui);
                scope.morphContainer.updateFromJson(this.modelData);
                scope.morphContainer.bindOnChangeParams(modelLoader.model.object3D.morphTargetInfluences, scope.eyes, scope.neck);
                scope.callback(scope);
            }
        );
    }
    
    updateEyes(){
        var objs = [
            this.mesh.findBone("左目"),
            this.mesh.findBone("右目"),
        ];
        this.eyes = objs;
    }

    updateNeck(){
        this.neck = this.mesh.findBone("頭");
    }

    getEyePosition(index){
        var getWorldPosition = function(obj3D){
            var target = new THREE.Vector3();
            return obj3D.getWorldPosition( target );
        }
        this.updateEyes();

        if (index >= this.eyes.length)
            index = this.eyes.length - 1;
        if (index < 0)
            index = 0;

        return getWorldPosition(this.eyes[index].children[0]);
    }

    hide(){
        this.mesh.hide();
        this.eyeLabelSystem.hide();
        // this.vpdsGui.guiShow = false;
    }

    show(){
        this.mesh.show();
        this.eyeLabelSystem.show();
        // this.vpdsGui.guiShow = true;
    }

    onMouseMove() {
        if (this.eyeLabelSystem)
            this.eyeLabelSystem.update();
    }

    onMouseDown() {
        if (this.eyeLabelSystem)
            this.eyeLabelSystem.mouseDown();
    }

    onKeyDown(event){
        var key = event.key;
        switch(key){
            case 'q':
                if (this.eyeLabelSystem)
                    this.eyeLabelSystem.showRight();
                break
            case '1':
            case '2':
            case '3':
            case '4':
                var index = parseInt(key)-1;
                this.updateEyes();
                if (this.eyeLabelSystem)
                    this.eyeLabelSystem.keyDown(index);
                break
        }
    }

    toJSON(){
        return Object.assign({location: this.modelPath}, this.eyeLabelSystem.toJSON(), this.morphContainer.toJSON());
    }

    fromJSON(serialize, scene, mouseRaycaster){
        this.eyeLabelSystem.fromJSON(serialize, scene, mouseRaycaster);
    }
};