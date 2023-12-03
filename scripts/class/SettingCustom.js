import * as gb from './../gb.js';

export default class SettingName extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "setting-custom-config";
        options.template = "modules/swade-tools/templates/setting-custom.html";
      
        options.width = 600;
        return options;
      }

     
      get title() {
        return gb.trans('settingCustomButton');
    }

    async getData(options){
        let data={};
        data.formHtml=``;


        data.formHtml+=`<h2>${gb.trans('SituationalRules')}</h2>`;
        data.formHtml+=gb.settingFieldCheckbox('gangUp',gb.trans('SettingGangUp'),gb.trans('SettingGangUpHint'));
        data.formHtml+=gb.settingFieldCheckbox('useScale',gb.trans('SettinguseScale'),gb.trans('SettinguseScaleHint'));
        data.formHtml+=gb.settingFieldCheckbox('askCalledShots',gb.trans('SettingAskCalledShots'),gb.trans('SettingAskCalledShotsHint'));
        data.formHtml+=gb.settingFieldCheckbox('ignoreRange',gb.trans('IgnoreRange'),'');
        data.formHtml+=gb.settingFieldCheckbox('autoCover',gb.trans('SettingautoCover'),gb.trans('SettingautoCoverHint'));

        data.formHtml+=gb.settingFieldCheckbox('onlySystemMod',gb.trans('SettingonlySystemMod'),gb.trans('SettingonlySystemModHint'));


        data.formHtml+=gb.settingFieldCheckbox('bloodAndGoreRifts',gb.trans('bloodAndGoreRifts'),gb.trans('bloodAndGoreRiftsHint'));
        

      //  data.formHtml+=`<h2>${gb.trans('RulesSettings')}</h2>`;
      //  data.formHtml+=gb.settingFieldCheckbox('reloadX',gb.trans('SettingreloadX'),gb.trans('SettingreloadXHint'));
      //  data.formHtml+=gb.settingFieldCheckbox('desperateAttack',gb.trans('SettingDesperateAttack'),gb.trans('SettingDesperateAttackHint'));


        data.formHtml+=`<h2>${gb.trans('Customization')}</h2>`;
        
        data.formHtml+=gb.settingFieldCheckbox('simpleRolls',gb.trans('SettingsSimpleRolls'),gb.trans('SettingsSimpleRollsHint'));

        data.formHtml+=gb.settingFieldCheckbox('useGroupRolls',gb.trans('SettingsUseGroupRolls'),gb.trans('SettingsUseGroupRollsHint'));
        data.formHtml+=gb.settingFieldCheckbox('itemNameClick',gb.trans('SettingsItemNameClick'),gb.trans('SettingsItemNameClickHint'));
        data.formHtml+=gb.settingFieldCheckbox('alwaysShowSituational',gb.trans('SettingShowSituational'),gb.trans('SettingShowSituationalHint'));
        data.formHtml+=gb.settingFieldCheckbox('selectModifiers',gb.trans('SelectModifiers'),gb.trans('SelectModifiersHint'));
        
        
     //   data.formHtml+=gb.settingFieldCheckbox('noStatusAutoRoll',gb.trans('SettingNoAutoRoll'),gb.trans('SettingNoAutoRollHint'));

        data.formHtml+=gb.settingFieldSelect('noStatusAutoRoll',gb.trans('SettingNoAutoRoll'),gb.trans('SettingNoAutoRollHint'),[{value:'','text':gb.trans('No')},{value:'all',text:gb.trans('Yes')},{value:'npconly',text:gb.trans('YesButPC')}])
        
        data.formHtml+=gb.settingTextArea('wildAttackSkills',gb.trans('SettingWildAttackSkills'),gb.trans('SettingWildAttackSkillsHint'));

     //   data.formHtml+=gb.settingFieldCheckbox('disableAutoInitStart',gb.trans('SettingsAutoInitStart'),gb.trans('SettingsAutoInitStartHint')+' '+gb.trans('AutoDisableWarn')+' '+gb.trans('AutoInit','SWADE'));

     data.formHtml+=gb.settingFieldSelect('defaultStatusIcons',gb.trans('StatusIconsSetting'),gb.trans('StatusIconsSettingHint'),[{value:'',text:gb.trans('StatusIconsSettingDefault')},{value:'system',text:gb.trans('StatusIconsSettingSystem')}])


     data.formHtml+=gb.settingFieldCheckbox('noWoundFatigueIcon',gb.trans('SettingnoWoundFatigueIcon'),'');

    // data.formHtml+=gb.settingFieldCheckbox('debugger',gb.trans('Debugger'),gb.trans('DebuggerHint'));

       /*  data.formHtml+=`<div class="form-group">
    <label>${gb.trans('StatusIconsSetting')}</label>
    <div class="form-fields">

        <select name="defaultStatusIcons">
            <option value="">${gb.trans('StatusIconsSettingDefault')}</option>
            <option value="system" ${game.settings.get(gb.moduleName,'defaultStatusIcons')=='system'?'selected':''}>${gb.trans('StatusIconsSettingSystem')}</option>
                        
        </select>

    </div>

    <p class="notes">${gb.trans('StatusIconsSettingHint')}</p>
</div>` */

        


        return data
    }

      async _updateObject(event, formData) {
        for (let name in formData){
            game.settings.set(gb.moduleName,name,formData[name]);
        }

      }

}