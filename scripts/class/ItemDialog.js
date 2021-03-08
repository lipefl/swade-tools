import CharRoll from './CharRoll.js';
import * as gb from './../gb.js';
import ItemRoll from './ItemRoll.js';

export default class ItemDialog {
    constructor(actor,itemId){
        this.item=actor.items.get(itemId);
     //   this.vehicle=false;
       

        if (actor.data.type=='vehicle'){
            this.vehicle=actor;
            actor=game.actors.get(actor.data.data.driver.id);
            
        }

        this.actor=actor;
        this.charRoll=new CharRoll(actor);
    }

    showDialog(){
        
      //  let actor=this.sheet.actor;
        let item=this.item;
        let weaponinfo=item.data.data;
        let weaponactions=item.data.data.actions;
        let showDamage=true;
        let showRaiseDmg=true;
      //  let showReload=false;

        let patxt='';
        if (weaponinfo.ap>0){
            patxt=` (${gb.trans('Ap','SWADE')}: ${weaponinfo.ap})`;
        }


        if (item.type=='power' && !weaponinfo.damage){
            showDamage=false;
            showRaiseDmg=false;
           
            for (const id in weaponactions.additional){
                if (weaponactions.additional[id].type=='damage'){
                    showRaiseDmg=true;
                }
               
            }
        }
       // let raise=false;
        let content=`<div class="swadetools-dialog-item">
        <div class="swadetools-itemfulldata">
        <div class="swadetools-2grid">`


        if (item.type=='weapon'){
        content+=`<div><strong>${gb.trans('Dmg','SWADE')}</strong>: ${weaponinfo.damage}${patxt}</div>
        <div><strong>${gb.trans('Mag','SWADE')}</strong>: ${weaponinfo.currentShots}/${weaponinfo.shots}</div>
        
        
        <div><strong>${gb.trans('Rng','SWADE')}</strong>: ${weaponinfo.range}</div>
        <div><strong>${gb.trans('RoF','SWADE')}</strong>: ${weaponinfo.rof}</div>`
        }  else if (item.type=='power'){

            if (showDamage){
             
                content+=`<div><strong>${gb.trans('Dmg','SWADE')}</strong>: ${weaponinfo.damage}${patxt}</div>`;
            }
            
            content+=`<div><strong>${gb.trans('PP','SSO')}</strong>: ${gb.realInt(weaponinfo.pp)}/${gb.realInt(this.actor.data.data.powerPoints.value)}</div>
            <div><strong>${gb.trans('Dur','SWADE')}</strong>: ${weaponinfo.duration}</div>
            <div><strong>${gb.trans('Rng','SWADE')}</strong>: ${weaponinfo.range}</div>
        `
        }
       
        content+=`</div>

        <div class="swadetools-formpart swadetools-2grid">
        
        <div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" value=""></div>`

       
        
        if (gb.setting('countPP') && item.type=='power'){
            content+=`<div class="swade-tools-pp-extra swadetools-mod-add"><label><strong>${gb.trans('ExtraPP')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('PPHint')}"></i></label><input type="text" id="extrapp" value="">
            </div>`
        }

        if (showRaiseDmg){
            content+=`<div class="swadetools-raise swadetools-raise-${item.type}"><label><input type="checkbox" id="raise" value="1"><strong>${gb.trans('RaiseDmg')}</strong></label></div>`;
        }
        
        content+=`</div>`
        let buttons={};

        let skillName=weaponactions.skill;
        if (!skillName){
            skillName=gb.trans('Unskilled');
        }


        let skillIcon='<i class="fas fa-bullseye"></i> ';
        let damageIcon='<i class="fas fa-tint"></i> ';
        

        buttons.mainSkill={
            label: skillIcon+skillName+gb.stringMod(weaponactions.skillMod),
            callback: (html)=>{
                
                let itemRoll=new ItemRoll(this.actor,this.item);
                
            //    console.log(this.item);
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
            label: gb.trans('Reload','SWADE'),
            callback: ()=> {
                gb.rechargeWeapon(this.actor,this.item);
            }
        }
    }

        /// TODO other actions
      

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

      

      

        new Dialog({
            title: item.name,
            content: content,
            buttons: buttons
        },{classes:['dialog swadetools-vertical']}).render(true);
        
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
        
            if (html.find('#extrapp')[0]){
                charRoll.usePP(html.find('#extrapp')[0].value);
            }
        
    }
}