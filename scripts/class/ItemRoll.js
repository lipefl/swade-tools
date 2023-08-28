import CharRoll from "./CharRoll.js";
import * as gb from './../gb.js';

export default class ItemRoll extends CharRoll{
    constructor(actor,item){
        super();
        this.actor=actor;
        this.item=item;
        this.data=item.system.actions;
        this.actions=this.data.additional;
        
        //this.combatRoll(this.item._id);

        this.addFlavor(item.name);
        this.isItem(item);

        

        /* if (actor.data.type=='vehicle'){
            this.usingVehicle(actor);
            actor=game.actors.get(actor.data.data.driver.id);
            
        } */
      //  console.log(this.item);

    }




    async rollAction(actionId){
        let action=this.actions[actionId];

        this.defineAction(actionId);


        if (action.type=='trait'){

      


                  
          
           if (gb.realInt(action.resourcesUsed)>0){
            this.useShots(action.resourcesUsed);
            } 
            
            

           
            this.addModifier(action.skillMod,action.name);
            let rof=1;
            if (action.dice!==undefined){
               rof=action.dice;
            }

            let skill=this.data.trait;

           // console.log(skill,'skill1');
            
            if (action.override){
                skill=action.override;
            }

           // console.log(skill,'skill2');
            
            this.addSkillMod();

           
            
            await this.rollSkill(skill,rof);
            

        } else if (action.type=='damage'){
            this.addModifier(action.modifier,action.name);
            let damage=this.item.system.damage;            

            if (action.override){
                damage=action.override;
            } /* else {
                
                ui.notifications.warn(gb.trans('NoDmgActionDefined'));
                
            } */

           

            this.addDmgMod();
            await this.rollDamage(damage,'',this.raiseDie());
        }

        
        

        
    }

    raiseDie(){
        let raisedie=6;
        if (this.item.system?.bonusDamageDie){
            raisedie=this.item.system.bonusDamageDie;
        }

        return raisedie;
    }

    /// universal mods
    addSkillMod(){
        this.addModifier(this.item.system.trademark,gb.trans('TrademarkWeapon.Label','SWADE'))
        this.addModifier(this.data.modifier,gb.trans('ModItem'));
        
    }

    addDmgMod(){
        this.addModifier(this.data.modifier,gb.trans('ModItem'));
    }
    ///

    useTarget(targetid){
        /// set the target for info
        this.usetarget=targetid;
    }

    usePP(extraPP){
        if (this.item.type=='power'){
            let usepp=gb.realInt(this.item.system.pp)+gb.realInt(extraPP);
            if (usepp<0){ /// min 0
                usepp=0
            }

           // console.log(usepp,'usepp');
            this.useShots(usepp);
        } else if (this.item.isArcaneDevice){
            this.useShots(gb.realInt(extraPP))
        }
    }




    async rollBaseSkill(rof=1){

        let rofstr='';
        if (rof>1){
            rofstr=rof;
        }
        this.defineAction('formula'+rofstr);
        
        
       
        this.addSkillMod();

        let attr=gb.findAttr(this.data.skill)
       // gb.log(this.data.skill,attr);
        if (attr){
            await this.rollAtt(attr,rof);
        } else {
            await this.rollSkill(this.data.skill,rof);
        }
        
       
        
        
        
    }

    async rollBaseDamage(){
        this.defineAction('damage');
        this.addDmgMod();
        let extrainfo='';
        if (this.item.system.ap){
            extrainfo+=` (${gb.trans('Ap','SWADE')}: ${this.item.system.ap}) `;
        }
        
        await this.rollDamage(this.item.system.damage,extrainfo,this.raiseDie());
    }

    
}