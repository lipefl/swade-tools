import * as gb from './../gb.js';

export default class SettingName extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "setting-name-config";
        options.template = "modules/swade-tools/templates/setting-name.html";
      
        options.width = 600;
        return options;
      }

     
      get title() {
        return gb.trans('settingNameButton');
    }

    async getData(options){
        let data={};
        data.formHtml=``;

        gb.edgesNaming.map((value)=>{
            let confkey=gb.settingKey(value);
          //  data[confkey]= gb.setting(confkey);
            data.formHtml+=`<div class="form-group">
            <label>${gb.trans(confkey)}</label>
            <div class="form-fields"><input type="text" name="${confkey}" id="${confkey}" value="${gb.setting(confkey)}"/></div>
            </div>`;
        })


        gb.abilitiesNaming.map((value)=>{
            let confkey=gb.settingKey(value);
          //  data[confkey]= gb.setting(confkey);
            data.formHtml+=`<div class="form-group">
            <label>${gb.trans(confkey)}</label>
            <div class="form-fields"><input type="text" name="${confkey}" id="${confkey}" value="${gb.setting(confkey)}"/></div>
            </div>`;
        })

        data.fightingName=gb.setting('fightingSkill')
        data.shootingName=gb.setting('shootingSkill')

        return data
    }

      async _updateObject(event, formData) {
        for (let name in formData){
            game.settings.set(gb.moduleName,name,formData[name]);
        }

      }

}