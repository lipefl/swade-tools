import CharRoll from './CharRoll.js';
import * as gb from './../gb.js';
import ItemRoll from './ItemRoll.js';
import Char from './Char.js';

export default class ItemDialog {
    constructor(actor,itemId){
        this.item=actor.items.get(itemId);
     //   this.vehicle=false;
       

        if (actor.type=='vehicle'){
            this.vehicle=actor;
           // console.log(this.vehicle);
            actor=gb.getDriver(actor);
         //   console.log(actor);
        }

        this.actor=actor;
        this.charRoll=new CharRoll(actor);

        this.dontDisplay=false;
    }


    saveSkill(newSkill){
        this.item.update({'data.actions.skill':newSkill});
        this.item.system.actions.skill=newSkill;
        this.dontDisplay=false;
        this.showDialog();
    }

    noSkillItem(){
        
        let item=this.item;       
        
        let content=`<p><strong>${this.item.name}</strong> ${gb.trans('NoSkillQuestion')}</p>`;
        content+=`<p><select id="skillitem">`;
        this.actor.items.filter(el=>el.type=='skill').map(skill=>{
            content+=`<option value="${skill.name}">${skill.name}</option>`;
        })

        content+=`<optgroup label="${gb.trans('Attributes','SWADE')}">`;
        gb.attributesShort.map(attr=>{
            content+=`<option value="${attr.trans}">${attr.trans}</option>`
        })
        content+=`</optgroup>`

        content+=`</select></p>`;

        new Dialog({
            title: item.name,
            content: content,
            buttons: {
                no: {
                    label: `<i class="fas fa-times"></i> ${gb.trans('LeaveItBlank')}`,
                    callback: async ()=>{
                        await item.setFlag('swade-tools','skillitem',true);
                        this.dontDisplay=false;
                        this.showDialog();
                        
                    }
                },/* 
                cancel: {
                    label: `<i class="fas fa-times"></i> ${gb.trans('Unskilled')}`,
                    callback: ()=>{
                        this.saveSkill(gb.trans('Unskilled'));
                        
                    }
                }, */
                ok: {
                    label: `<i class="fas fa-check"></i> ${gb.trans('UseSkillSelected')}`,
                    callback: (html)=>{
                    
                        this.saveSkill(html.find('#skillitem')[0].value);
                        
                    }
                }

                
            }
        }).render(true);

        this.dontDisplay=true;
    
    
    }

    showDialog(){
        
      //  let actor=this.sheet.actor;
        let item=this.item;
        let weaponinfo=item.system;
        let weaponactions=item.system.actions;
        let showDamage=true;
        let showRaiseDmg=true;
        
        let damageActions=[];
      //  let showReload=false;

        let patxt='';
        if (weaponinfo.ap>0){
            patxt=` (${gb.trans('Ap','SWADE')}: ${weaponinfo.ap})`;
        }


        if (item.type=='power' && !weaponinfo.damage){
            showDamage=false;
            showRaiseDmg=false;
           
            
        }

        

        for (const id in weaponactions.additional){
            if (weaponactions.additional[id].type=='damage'){
                showRaiseDmg=true;
                damageActions.push({id:id,name:weaponactions.additional[id].name});
            }
           
        }

       // let raise=false;
        let content=`<div class="swadetools-dialog-item">
        <div class="swadetools-itemfulldata">
        <div class="swadetools-2grid">`


        if (item.type=='weapon'){
        content+=`<div><strong>${gb.trans('Dmg','SWADE')}</strong>: ${weaponinfo.damage}${patxt}</div>
        <div><strong>${gb.trans('Mag','SWADE')}</strong>: ${weaponinfo.currentShots}/${weaponinfo.shots}</div>
        
        
        <div><strong>${gb.trans('Range._name','SWADE')}</strong>: ${weaponinfo.range}</div>
        <div><strong>${gb.trans('RoF','SWADE')}</strong>: ${weaponinfo.rof}</div>`
        }  else if (item.type=='power'){

            if (showDamage){
             
                content+=`<div><strong>${gb.trans('Dmg','SWADE')}</strong>: ${weaponinfo.damage}${patxt}</div>`;
            }
            
            content+=`<div><strong>${gb.trans('PPCost','SWADE')}</strong>: ${gb.realInt(weaponinfo.pp)}/${gb.realInt(this.actor.system.powerPoints.value)}</div>
            <div><strong>${gb.trans('Dur','SWADE')}</strong>: ${weaponinfo.duration}</div>
            <div><strong>${gb.trans('Range._name','SWADE')}</strong>: ${weaponinfo.range}</div>
        `
        }
       
        content+=`</div>

        <div class="swadetools-formpart swadetools-2grid">
        
        <div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" value=""></div>`

       
        
        if (!gb.systemSetting('noPowerPoints') && item.type=='power'){
            content+=`<div class="swade-tools-pp-extra swadetools-mod-add"><label><strong>${gb.trans('ExtraPP')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('PPHint')}"></i></label><input type="text" id="extrapp" value="">
            </div>`
        }

        if (showRaiseDmg){
            content+=`<div class="swadetools-raise swadetools-raise-${item.type}"><label><input type="checkbox" id="raise" value="1"><strong>${gb.trans('RaiseDmg')}</strong></label></div>`;
        }

        
        if (gb.setting('useScale')){ ///swat
            let char=new Char(this.actor);
            if (char.hasAbilitySetting('Swat')){
                content+=`<div class="swadetools-raise swadetools-raise-${item.type}"><label><input type="checkbox" id="swat" value="1"><strong>${gb.trans('SwatSetting')}</strong></label></div>`;
            }

        }



        if (gb.setting('wildAttackSkills').split(',').map(s => s.trim()).includes(weaponactions.skill)){ /// wild attack
            content+=`<div class="swadetools-raise swadetools-raise-${item.type}"><label><input type="checkbox" id="wildattack" value="1"><strong>${gb.trans('WildAttack')}</strong></label></div>`;

        }

        if (damageActions.length>0){
            content+=`<div class="swadetools-damage-actions swadetools-mod-add"><label><strong>${gb.trans('Damage')}:</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ActDmgHint')}"></i></label> <select id="actiondmg">
            <option value="">${gb.trans('Default')}</option>`;

          //  console.log(damageActions)
         
            damageActions.forEach(act=>{
                content+=`<option value="${act.id}">${act.name}</option>`;
            })
             
            /* for (const i in damageActions) {
                content+=`<option value="${act[i].id}">${act[i].name}</option>`;
            }  */

           

            content+=`</select>
            </div>`;
        }


        if (gb.setting('askCalledShots')){
            content+=`<div class="swadetools-damage-actions swadetools-mod-add"><label><strong>${gb.trans('CalledShot')}:</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('CalledShotHint')}"></i></label> <select id="calledshots">`
            //<option value="">${gb.trans('Default')}</option>`;

          //  console.log(damageActions)

            let called=[
                {val:'Torso',text:gb.trans('Torso','SWADE')+' (0)'},
                {val:'Arms',text:gb.trans('Arms','SWADE')+ ' (-2)'},
                {val:'Legs',text:gb.trans('Legs','SWADE')+ ' (-2)'},
                {val:'Head',text:gb.trans('Head','SWADE')+ ' (-4/+4 '+gb.trans('Damage')+')'}
            ]
         
            called.forEach(act=>{
                content+=`<option value="${act.val}">${act.text}</option>`;
            })
             
            /* for (const i in damageActions) {
                content+=`<option value="${act[i].id}">${act[i].name}</option>`;
            }  */

           

            content+=`</select>
            </div>`;
        }

        
        content+=`</div>`


       

        let buttons={};

        let skillName=weaponactions.skill;
        let skillflag=item.getFlag('swade-tools','skillitem')
        let noMainSkill=false;
       
        if (!skillName){

            if (skillflag!==true){
                skillName=this.noSkillItem();
            } else {
                noMainSkill=true;
            }
            
           
           // skillName=gb.trans('Unskilled');
        }

       
           
           // skillName=gb.trans('Unskilled');
        

        


        let skillIcon='<i class="fas fa-bullseye"></i> ';
        let damageIcon='<i class="fas fa-tint"></i> ';
        

        if (!noMainSkill){  //// hide button for main skill if there's no skill

        buttons.mainSkill={
            label: skillIcon+skillName+gb.stringMod(weaponactions.skillMod),
            callback: (html)=>{
                
                let itemRoll=new ItemRoll(this.actor,this.item);
                
                
                this.processItemFormDialog(html,itemRoll);               
                itemRoll.rollBaseSkill();               
                itemRoll.display();
               

                /* let data={
                    mod: {
                        value: weaponactions.skillMod,
                        reason: gb.trans('ModItem')
                    },
                    skill: weaponactions.skill,
                    weapon: item.name+patxt,
                    weaponid: item._id,
                }

                this.processRoll(html,data); */
            }
        }
    }
        
        if (showDamage){
        buttons.mainDamage={
            label: damageIcon+gb.trans('Damage'),//weaponinfo.damage+gb.stringMod(weaponactions.dmgMod),
            
            callback: (html)=>{
               
                let itemRoll=new ItemRoll(this.actor,this.item)
                this.processItemFormDialog(html,itemRoll);
                itemRoll.rollBaseDamage();
                itemRoll.display();

                /* let data={
                    mod: {
                        value: weaponactions.dmgMod,
                        reason: gb.trans('ModItem')
                    },
                    damage: weaponinfo.damage,
                    weapon: item.name+patxt,
                    weaponid: item._id,
                }

                this.processRoll(html,data); */
            }
        }
    }
      

    if (weaponinfo.shots>0 && !weaponinfo.autoReload){
        buttons.reload={
            label: `<i class="fas fa-redo"></i> `+gb.trans('Reload','SWADE'),
            callback: ()=> {
                gb.rechargeWeapon(this.actor,this.item);
            }
        }

        if (gb.setting('reloadX')){
            
            buttons.reloadx={
                label: `<i class="fas fa-spinner"></i> `+gb.trans('Reload','SWADE')+' X',
                callback: ()=> {
                    /// ask how many bullets
                    gb.rechargeWeaponXDialog(this.actor,this.item);
                }
            }
        }
    }

        if (skillName==gb.setting('fightingSkill')){
           /*  buttons.wildattack={
                label: gb.trans('WildAttack'),
                callback: (html)=>{
                    let itemRoll=new ItemRoll(this.actor,this.item);
                    
            //    console.log(this.item);
                    this.processItemFormDialog(html,itemRoll);
                    
                   
                    itemRoll.rollBaseSkill();                  
                    itemRoll.wildAttack();
                    itemRoll.display();
                }
            } */

            let char=new Char(this.actor);
            if (char.hasEdgeSetting('Frenzy')){
                buttons.frenzy={
                    label: gb.settingKeyName('Frenzy'),
                    callback: (html)=>{
                        let itemRoll=new ItemRoll(this.actor,this.item);
                    
            //    console.log(this.item);
                    this.processItemFormDialog(html,itemRoll);                    
                    
                    itemRoll.rollBaseSkill(2);                  
                   
                    itemRoll.display();
                    }
                }
            }
        }


        if (skillName == gb.setting('shootingSkill')) {
            let rof = gb.realInt(this.item?.data?.data?.rof)+1;
              
            let char = new Char(this.actor);
            if (char.hasEdgeSetting('Rapid Fire')) {
                buttons.rapidFire={
                    label: gb.settingKeyName('Rapid Fire') +' ('+gb.trans('RoF','SWADE')+' '+rof+')',
                    callback: (html)=>{
                        let itemRoll=new ItemRoll(this.actor,this.item);
                        itemRoll.useShots(gb.RoFBullets[rof])
                        this.processItemFormDialog(html,itemRoll);
                        
                        itemRoll.rollBaseSkill(rof);
                        itemRoll.display();
                    }
                }
            }
        }
      

        for (const id in weaponactions.additional){
           
            let action=weaponactions.additional[id];

            let actionIcon;
            if (action.type=='skill'){
                actionIcon=skillIcon;
            } else if (action.type=='damage'){
                actionIcon=damageIcon;
            }
       
            buttons[id]={
                label: actionIcon+action.name,
                callback: (html)=>{


                    let itemRoll=new ItemRoll(this.actor,this.item)
                this.processItemFormDialog(html,itemRoll);

                itemRoll.rollAction(id);
              //  itemRoll.rollBaseDamage();
                itemRoll.display();


                   /*  if(action.type=='skill'){

                        let skill=weaponactions.skill;



                        if (action.skillOverride){
                            skill=action.skillOverride;
                        }

                        let data={
                            mod: {
                                value: action.skillMod,
                                reason: gb.trans('ModItem')
                            },
                            skill: skill,
                            rof: action.rof,
                            weapon: item.name,
                            weaponid: item._id,
                            shots: action.shotUsed
                        }
        
                        this.processRoll(html,data);

                        
                       
                    } else if (action.type=='damage'){

                        let data={
                            mod: {
                                value: action.dmgMod,
                                reason: gb.trans('ModItem')
                            },
                            damage: action.dmgOverride,
                            weapon: item.name+patxt,
                            weaponid: item._id
                        }

                        this.processRoll(html,data);
                    
                    } */


                }
            }
        }

      

      
        if (!this.dontDisplay){
        new Dialog({
            title: item.name,
            content: content,
            buttons: buttons
        },{classes:['dialog swadetools-vertical']}).render(true);
        }
        
    }


    /* processRoll(html,data){
      //  console.log(data);
        let charRoll=new CharRoll(this.actor)
        let type='skill';
        if (data.damage!==undefined){
            type='damage';
        }
        this.processItemFormDialog(html,charRoll);

        charRoll.combatRoll(data.weaponid);


        if (data.shots!==undefined){
            charRoll.useShots(data.shots);
        }

        charRoll.addFlavor(data.weapon);

        if (data.mod!==undefined){
           
              
                charRoll.addModifier(data.mod.value,data.mod.reason);
            
        }

        if (type=='skill'){
            let rof=1;
            if (data.rof!==undefined){
                rof=data.rof;
            }
            
            charRoll.rollSkill(data.skill,rof);
        } else

        if (type=='damage'){
            
            charRoll.rollDamage(data.damage)
        }

        
        charRoll.display();
    } */

    processItemFormDialog(html,charRoll){
        
        if (this.vehicle){
            charRoll.usingVehicle(this.vehicle);
        }
        
           charRoll.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
            if (html.find("#raise")[0]?.checked){
                charRoll.raiseDmg();
            } 


            if (html.find("#wildattack")[0]?.checked){
                charRoll.addModifier(2,gb.trans('WildAttack'));
                charRoll.wildAttack();
            } 

            if (html.find("#swat")[0]?.checked){
                charRoll.addFlag('useswat',1);
            } 
        
            if (html.find('#extrapp')[0]){
                charRoll.usePP(html.find('#extrapp')[0].value);
            }

            if (html.find('#calledshots')[0]){
                charRoll.addFlag('usecalled',html.find('#calledshots')[0].value);
                
                
            }

            

            if (html.find('#actiondmg')[0] && html.find('#actiondmg')[0].value!=''){
                charRoll.useDamageAction(html.find('#actiondmg')[0].value);
            }

            
        
    }
}