export class ModelMorphGui{
    static standardlist = {
        "eyebrow_troubled_left":0,
        "eyebrow_troubled_right":0,
        "eyebrow_angry_left":0,
        "eyebrow_angry_right":0,
        "eyebrow_serious_left":0,
        "eyebrow_serious_right":0,
        "eyebrow_happy_left":0,
        "eyebrow_happy_right":0,
        "eyebrow_lowered_left":0,
        "eyebrow_lowered_right":0,
        "eyebrow_raised_left":0,
        "eyebrow_raised_right":0,
        "eye_wink_left":0,
        "eye_wink_right":0,
        "eye_happy_wink_left":0,
        "eye_happy_wink_right":0,
        "eye_relaxed_left":0,
        "eye_relaxed_right":0,
        "eye_unimpressed_left":0,
        "eye_unimpressed_right":0,
        "eye_raised_lower_eyelid_left":0,
        "eye_raised_lower_eyelid_right":0,
        "eye_surprised_left":0,
        "eye_surprised_right":0,
        "iris_small_left":0,
        "iris_small_right":0,
        "mouth_aaa":0,
        "mouth_iii":0,
        "mouth_uuu":0,
        "mouth_eee":0,
        "mouth_ooo":0,
        "mouth_delta":0,
        "mouth_smirk":0,
        "mouth_raised_corner_left":0,
        "mouth_raised_corner_right":0,
        "mouth_lowered_corner_left":0,
        "mouth_lowered_corner_right":0
    };

    constructor(modelLoaderPtr, gui, callback = function(){}, dictionary=this.constructor.standardlist){
        this.modelLoaderPtr = modelLoaderPtr;
        this.gui = gui;
        this.callback = callback;
        
        this.initGui(dictionary);
        this.callback(this);
    }

    static getBaseName(s) {
        return s.slice(s.lastIndexOf('/') + 1);
    }

    initGui(dictionary) {
        const gui = this.gui;
        
        this.controlDictionary = Object.keys(dictionary);

        const morphs = gui.addFolder('stdlist');

        this.gui = {
            morphs: morphs,
        }
        this.controllers = [];

        morphs.open();
    }

    clearMorphs(){
        for(const controller of this.controllers)
            this.gui.morphs.remove(controller);
        this.controllers = [];
    }

    initMorphs() {
        this.controllers = [];
        for (const key of this.controlDictionary) {
            var controller = this.gui.morphs.add(
                this.morphContainer.controls, key,
                this.morphContainer.rangeList[key].range[0],
                this.morphContainer.rangeList[key].range[1],
                this.morphContainer.rangeList[key].range[2]
            );
            controller.onChange(() => {
                this.morphContainer.onChange();
                this.gui.morphs.updateDisplay();
            });
            this.controllers.push(controller);
        }
    }

    getControlIndex(index){
        var found = this.controlDictionary.indexOf(index);
        if (found != -1)
            return this.controlDictionary.indexOf(this.controlDictionary[found]);
        else
            return null;
    }

    updateControls(morphContainer){
        this.clearMorphs();
        this.morphContainer = morphContainer;

        this.controlDictionary = Object.keys(morphContainer.controls);
        this.initMorphs();
        this.gui.morphs.updateDisplay();
    }

    set guiShow(flag){
        if (flag){
            this.gui.morphs.open();
        }else{
            this.gui.morphs.close();
        }
    }
}