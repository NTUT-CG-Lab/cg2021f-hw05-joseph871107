import { ModelMorphGui } from './modelMorphGui.js';

export class MorphContainer{
    static pairList = {
        'eyebrow_troubled':	[2, ['困る', '困り']],              // 0
        'eyebrow_angry':	[2, ['怒る', '怒り']],              // 1
        'eyebrow_serious':	[2, ['真面目']],                    // 2
        'eyebrow_happy':	[2, ['にこり', 'にこ', 'にこっ']],   // 3
        'eyebrow_lowered':	[2, ['下', '眉下']],                // 4
        'eyebrow_raised':	[2, ['上', '眉上']],                // 5

        'eye_wink':	[2, ['まばたき', 'ウィンク']],               // 6
        'eye_happy_wink':	[2, ['笑い']],                      // 7
        'eye_relaxed':	[2, ['なごみ']],                        // 8
        'eye_unimpressed':	[2, ['ジト目']],                    // 9
        'eye_raised_lower_eyelid':	[2, ['下瞼上げ']],          // 10
        'eye_surprised':	[2, ['びっくり']],                  // 11
        'iris_small':	[2, ['瞳小']],                          // 12

        'mouth_aaa':	[1, ['あ']],                            // 13
        'mouth_iii':	[1, ['い']],                            // 14
        'mouth_uuu':	[1, ['う']],                            // 15
        'mouth_eee':	[1, ['え']],                            // 16
        'mouth_ooo':	[1, ['お']],                            // 17
        'mouth_delta':	[1, ['Δ', '▲']],                        // 18
        'mouth_smirk':	[1, ['はんっ！']],                       // 19
        'mouth_raised_corner':	[2, ['口角上げ', 'v']],          // 20
        'mouth_lowered_corner':	[2, ['口角下げ']],               // 21
    };

    static eyeLabelKeys = [
        "RXNA",
        "LXNA",
        "RXPA",
        "LXPA",
        "RYNA",
        "LYNA",
        "RYPA",
        "LYPA",
    ];

    constructor(stdlistGui, morphsGui){
        this.stdlistGui = stdlistGui;
        this.morphsGui = morphsGui;

        this.controls = {};
        this.pairList = {};
        this.rangeList = {};
        this.types = {};
        this.leftControlOnly = [];
        this.leftControlOnly.findRoot = function(sub){
            for(const pairs of this){
                var found = pairs.indexOf(sub);
                if (found != -1)
                    return pairs[0];
            }
            return -1;
        }
        /*
        for (const key of Object.keys(this.constructor.pairList)){
            var content = this.constructor.pairList[key];
            var relatedMorphs = [];
            for (const index of content[1]){
                relatedMorphs.push(this.morphsGui.getControlIndex(index));
            }
            relatedMorphs = relatedMorphs.filter((el) => {return el != null});
            relatedMorphs.sort();
            var relatedMorph = -1;
            if (relatedMorphs.length > 0)
                relatedMorph = relatedMorphs[0];
            switch (content[0]){
                case 1:
                    this.pairList[key] = relatedMorph;
                    break;
                case 2:
                    this.pairList[key + '_left'] = relatedMorph;
                    this.pairList[key + '_right'] = relatedMorph;
                    break;
            }
        }
        */
    }

    bindOnChangeParams(morphTargetInfluences, irises, neck){
        this.onChangeParams = {
            morphTargetInfluences: morphTargetInfluences,
            irises: irises,
            neck: neck,
        };
        this.onChangeParams.eyeLimitDict = {
            'iris_rotation_x': [
                {
                    'key': 'iris_rotation_xl',
                    'eyeReference': this.onChangeParams.irises[0],
                    'property': 'x',
                    'rangeList': this.rangeList['iris_rotation_xl'],
                },
                {
                    'key': 'iris_rotation_xr',
                    'eyeReference': this.onChangeParams.irises[1],
                    'property': 'x',
                    'rangeList': this.rangeList['iris_rotation_xr'],
                },
            ],
            'iris_rotation_y': [
                {
                    'key': 'iris_rotation_yl',
                    'eyeReference': this.onChangeParams.irises[0],
                    'property': 'y',
                    'rangeList': this.rangeList['iris_rotation_yl'],
                },
                {
                    'key': 'iris_rotation_yr',
                    'eyeReference': this.onChangeParams.irises[1],
                    'property': 'y',
                    'rangeList': this.rangeList['iris_rotation_yr'],
                },
            ],
        };
    }

    map_range(value, pair1, pair2) {
        var low1 = pair1[0], high1 = pair1[1], low2 = pair2[0], high2 = pair2[1];
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    onChange(){
        if (this.onChangeParams){
            for(const key in this.types){
                var type = this.types[key];
                var value = this.controls[key];
                var pair = this.pairList[key];
    
                var rangContainer = this.rangeList[key];
                var range = [];
                var mapRange = [];
                if (rangContainer){
                    range = rangContainer.range;
                    mapRange = rangContainer.mapRange;
                }
                
                // console.log(type, pair, range)
                switch(type){
                    case -1:    // Model location
                        break;
                    case 0:     // Standard list
                        var root = this.leftControlOnly.findRoot(key);
                        if (key == root)
                            this.onChangeParams.morphTargetInfluences[pair] = this.map_range(value, range, mapRange);
                        else
                            this.controls[key] = this.controls[root];
                        break;
                    case 1:     // Iris rotations
                        for(const changeObject of this.onChangeParams.eyeLimitDict[key]){
                            range = changeObject.rangeList.range;
                            mapRange = changeObject.rangeList.mapRange;
                            if (value > 0){
                                changeObject.eyeReference.rotation[changeObject.property] = -this.map_range(value, [0, range[1]], [0, mapRange[1]]);
                            }else{
                                changeObject.eyeReference.rotation[changeObject.property] = -this.map_range(value, [range[0], 0], [mapRange[0], 0]);
                            }
                        }
                        break;
                    case 2:     // Head morphs
                        var property = key[key.length-1];
                        var mapped_value = 0;
                        if ((property == 'x' || property == 'z') && value == 0)
                            mapped_value = -0;
                        else if ((property == 'y') && value == 0)
                            mapped_value = 0;
                        else
                            mapped_value = this.map_range(value, range, mapRange);
                        this.onChangeParams.neck.rotation[property] = mapped_value;
                        break;
                }
            }
        }
    }

    setRange(key, v1, v2){
        this.rangeList[key] = {};
        this.rangeList[key].range = v1;
        this.rangeList[key].mapRange = v2;
    }

    updateFromJson(json){
        var keys = Object.keys(json);
        var eyeLabelLimits = new Array(4);
        for (var i=0; i<eyeLabelLimits.length; i++)
            eyeLabelLimits[i] = [];

        // Process loaded data from model_data.json
        for (var i=0; i<keys.length; i++){
            var key = keys[i];
            var value = json[key];
            if (key == 'location'){                                     // Model location
                this.types[key] = -1;
            }else if (key in ModelMorphGui.standardlist){               // Standard list
                this.types[key] = 0;
                this.pairList[key] = value;
                if (value == -1){
                    this.controls[key] = -1;
                    this.setRange(key, [-1, -1, 0.01], [0, 1]);
                }
                else{
                    this.controls[key] = 0;
                    this.setRange(key, [0, 1, 0.01], [0, 1]);
                }
            }else if (this.constructor.eyeLabelKeys.includes(key)){     // Eye labels
                var lr = key[0] == 'R' ? 0 : 1;
                var pos = key[1] == 'X' ? 0 : 1;
                var sign = key[2] == 'N' ? 0 : 1;
                var eyeIndex = lr*2 + pos;
                eyeLabelLimits[eyeIndex][sign] = value;
                eyeLabelLimits[eyeIndex][2] = key.slice(0, 2);
            }
        }

        // Process both equal pair number of standard list to let only left one control
        for (const key in this.pairList){
            var found = key.indexOf('_left');
            var keys = Object.keys(this.pairList);

            if (found != -1){
                var substring = key.slice(0, found);
                var value1 = this.pairList[key];
                var found_multiple = keys.filter((value) => {
                    var value2 = this.pairList[value];
                    if (value1 == value2){
                        var lf = value.indexOf('_left');
                        var rf = value.indexOf('_right');
                        var otherKey = '';
                        if (lf != -1)
                            otherKey = value.slice(0, lf);
                        else if (rf != -1)
                            otherKey = value.slice(0, rf);
                        if (otherKey == substring)
                            return true;
                    }
                    return false;
                });
                this.leftControlOnly.push(found_multiple);
            }
            else{
                this.leftControlOnly.push([key]);
            }
        }
        for (const leftControlPairs of this.leftControlOnly){
            if (leftControlPairs.length > 1){
                for(const key of leftControlPairs.slice(1, leftControlPairs.length)){
                    this.rangeList[key].range = [0, 0, 0.01];
                }
            }
        }

        // Process eye labels to Iris rotations
        for (var i=0; i<eyeLabelLimits.length; i++){
            var value = eyeLabelLimits[i];
            var key = value[2];
            var mn = Math.PI * value[0] / 180.0, mx = Math.PI * value[1] / 180.0;
            switch (key.slice(0, 2)){
                case 'RX':
                    key = 'iris_rotation_x';
                    this.setRange(key+'r', [-1, 1, 0.01], [mn, mx]);
                    break;
                case 'LX':
                    key = 'iris_rotation_x';
                    this.setRange(key+'l', [-1, 1, 0.01], [mn, mx]);
                    break;
                case 'RY':
                    key = 'iris_rotation_y';
                    this.setRange(key+'r', [-1, 1, 0.01], [mn, mx]);
                    break;
                case 'LY':
                    key = 'iris_rotation_y';
                    this.setRange(key+'l', [-1, 1, 0.01], [mn, mx]);
                    break;
            }
            this.types[key] = 1;
            this.controls[key] = 0;
            this.setRange(key, [-1, 1, 0.01], [0, 1]);
        }

        // Add head morphs
        var head_morphs = [
            ['head_x', [-1, 1, 0.01], [0, 1]],
            ['head_y', [-1, 1, 0.01], [0, 1]],
            ['head_z', [-1, 1, 0.01], [0, 1]],
        ];
        for (const value of head_morphs){
            var key = value[0];

            this.types[key] = 2;
            this.controls[key] = 0;
            var mn = -15, mx = 15;
            this.setRange(key, [-1, 1, 0.01], [Math.PI * mn / 180.0, Math.PI * mx / 180.0]);
        }

        this.eyeLabelLimits = eyeLabelLimits;
    }

    toJSON(){
        var obj = {};
        var keys = Object.keys(this.controls);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            obj[String(i)] = this.controls[key];
        }
        return obj;
    }
}