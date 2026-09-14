import Char from './Char.js';
import * as gb from './../gb.js';

export default class StatusIcon {

    statuses = gb.stIcons
    
    wounds = [
        {value: 1, icon: "modules/swade-tools/icons/w1.png"},
        {value: 2, icon: "modules/swade-tools/icons/w2.png"},
        {value: 3, icon: "modules/swade-tools/icons/w3.png"},
        {value: 4, icon: "modules/swade-tools/icons/w4.png"},
        {value: 5, icon: "modules/swade-tools/icons/w5.png"},
        {value: 6, icon: "modules/swade-tools/icons/w6.png"}    
    ]
    fatigues = [
        {value: 1, icon: "modules/swade-tools/icons/f1.png"},
        {value: 2, icon: "modules/swade-tools/icons/f2.png"}
    ]

    constructor(entity,entityType,data){
        this.entity=entity;
        this.entityType=entityType;
        this.data=data;

        this.istoken=false;
        if (this.entityType=='token'){
            this.istoken=true;
        }

        this.addOptions();

        this.applied=[];
        
    }

    addOptions(){

        if (gb.setting('defaultStatusIcons')=='system'
        || gb.setting('defaultStatusIcons')=='1' /// old setting
        ){
        this.statuses=[
        {stat: 'isShaken', icon: 'systems/swade/assets/icons/status/status_shaken.svg'},
        {stat: 'isDistracted', icon: 'systems/swade/assets/icons/status/status_distracted.svg'},
        {stat: 'isVulnerable', icon: 'systems/swade/assets/icons/status/status_vulnerable.svg'},
        {stat: 'isStunned', icon: 'systems/swade/assets/icons/status/status_stunned.svg'},
        {stat: 'isEntangled', icon: 'systems/swade/assets/icons/status/status_entangled.svg'},
        {stat: 'isBound', icon: 'systems/swade/assets/icons/status/status_bound.svg'}
        ]
    }
    }

    getActor(){
        return this.entityType === 'token' ? this.entity.actor : this.entity;
    }

    noBasicActiveEffect(statusName){
        const actor = this.getActor();
        const statusId = this.translateActiveEffect(statusName);
        if (statusName && actor?.effects.filter(el => el.statuses?.has(statusId) || el.flags?.core?.statusId == statusId).length > 0){
            return false;
        } else {
            return true;
        }
    }

    async woundFatigueIcon(type,number,active){
        if (gb.setting('defaultStatusIcons')!='none'){
            const actor = this.getActor();
            if (!actor) return;
            
            if (number<=0){
                active=false;
            }
            await actor.toggleStatusEffect(type+'t',{active:active});

            if (number>0){

                let typeid;
            let letter;
            let max;
            if (type=='wounds'){
                typeid=gb.wounds_id;
                letter='w';
                max=6;

            } else if (type=='fatigues'){
                typeid=gb.fatigues_id;
                letter='f';
                max=2;
            }

            if (number>max){
                number=max;
            }
           // console.log(typeid);
            await actor.effects.get(typeid)?.update({"img":`modules/swade-tools/icons/${letter}${number}.png`})
            }
            
        }
    }

  /*   async applyEffect(icon,active,overlay=false){


        

        if (gb.setting('defaultStatusIcons')!='none'){

       let stat=this.statuses.filter(el=>el.icon==icon)[0]?.stat;

    if (!active || this.noBasicActiveEffect(stat)){
      //  console.log(this.getTokens());
        this.getTokens().map(async token=>{

            //token.effects.parent.document.effects

         
            /// should be just this
         ///await token.toggleEffect(icon,{active:active,overlay:overlay})

         ///silver tape 
                setTimeout(async ()=>{

                    let doit=false;
                    if (active && !token.effects.parent.document.effects.includes(icon)){
                        doit=true;
                    }
                    if (!active && token.effects.parent.document.effects.includes(icon)){
                        doit=true;
                    }


                    if (doit){
                       await token.toggleEffect(icon,{active:active,overlay:overlay})
                       // await token.actor.toggleStatusEffect('aiming');
                    }
                    
                },500)
            
                
            
            
                
            
           
        })
    }

}
     
    } */

    getTokens(){ /// return an array of tokens
        if (this.entityType=='actor'){
           return this.entity.getActiveTokens();
        } else if (this.entityType=='token'){
           return [canvas.tokens.get(this.entity.id)]; 
        }
    }

    /* checkStatusUpdate(statusName){ ///not used anymore
        let statusvar;
    
        if (this.entityType=='actor'){
            statusvar=this.data?.system?.status?.[statusName];
        } else if (this.entityType=='token'){
            statusvar=this.data?.actorData?.data?.status?.[statusName];
        }
    
    
        if (statusvar!==undefined){
            let varcheck;
            if (this.entityType=='actor'){
                varcheck=this.system.status[statusName];
            } else if (this.entityType=='token'){
                varcheck=this.data.actorData.data.status[statusName];
            }

            let icon=this.statuses.filter(el=>el.stat==statusName)[0].icon;
    

            this.applyEffect(icon,varcheck)
            this.chainedStatus(statusName,varcheck);
            
            if (!varcheck){ 
                this.removeActiveEffects(statusName);
            }
            
           
            // if (varcheck){
            //     this.applyEffect(icon,true);
            // } else {
            //     this.applyEffect(icon,false);
            // } 

            
        }
       
    } */


    translateActiveEffect(statusName){
        if (!statusName){
            return false;
        }
        return statusName.substring(2).toLowerCase();///remove is and put in lowercase
    }

    removeActiveEffects(statusName){ /// also remove Active Effect
        const actor = this.getActor();
        if (!actor) return;
        const statusId = this.translateActiveEffect(statusName);
        const effect = actor.effects.find(el => el.statuses?.has(statusId) || el.flags?.core?.statusId === statusId);

        if (!effect) return;

        if (typeof actor.deleteEmbeddedDocuments === 'function') {
            try {
                actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id]);
            } catch (error) {
                // Ignore stale ActiveEffect deletions; the effect may already be gone
                // and the combat state should continue normally.
            }
        }
    }

    upStatus(statusName,val){
     //   let actor=this.getActor();
      
       let char=new Char(this.entity,this.istoken);
       if (val){
        char.on(statusName);
       } else {
        char.off(statusName);
       }
      
   //   return true;
      //  actor.update({['data.status.'+statusName]:val})
    }


    /* async chainedStatus(statusName,val){ ///removed  => done by swade system

     
        if (statusName=='stunned' || statusName=='bound'){

   

           
           await gb.statusChange(this.entity,'vulnerable',val);

           setTimeout(async ()=>{
            await gb.statusChange(this.entity,'distracted',val);
           },250)

            
            
           
           
        }
        else
        if (statusName=='entangled'){
            

               await gb.statusChange(this.entity,'distracted',val);
           
        }
        
    } */


    async checkLevels(levelType){

        if (!gb.setting('noWoundFatigueIcon')){

        let statval
        let levels;
    
        if (levelType=='wounds'){
            if (this.entityType=='actor'){
                statval=this.data.system?.wounds?.value;
            } else if (this.entityType=='token'){
                statval=this.data?.delta?.system?.wounds?.value
                    ?? this.data?.actorData?.system?.wounds?.value
                    ?? this.data?.actorData?.data?.wounds?.value;
            }
            
            levels=this.wounds;
        } else if (levelType=='fatigues'){
    
            if (this.entityType=='actor'){
                statval=this.data.system?.fatigue?.value;
            } else if (this.entityType=='token'){
                statval=this.data?.delta?.system?.fatigue?.value
                    ?? this.data?.actorData?.system?.fatigue?.value
                    ?? this.data?.actorData?.data?.fatigue?.value;
            }
            
            levels=this.fatigues;
        }

        //console.log(levelType,levels,statval);
    
        if (statval!==undefined){

            /// mark defeated
            this.markDefeated();
            this.woundFatigueIcon(levelType,statval,true);

            /* levels.map(async item => {
                if (item.value==statval){
                     await this.applyEffect(item.icon,true)
                } else {
                    await this.applyEffect(item.icon,false)
                }
            }) */
            
        }
        }
    }


  /*   getActor(){
        let actor=this.entity;
       
        if (this.entityType=='token'){
            actor=game.actors.get(this.entity.actorId);
        }

        return actor;
    } */

    async markDefeated(){
        let char=new Char(this.entity,this.istoken);
        const actor = this.getActor();
        if (!actor) return;

        /// char.isDefeated checks if it's defeated;
        await actor.toggleStatusEffect('incapacitated', { active: char.isDefeated(), overlay: true });
    }
    

    async checkAllStatus(){
       /*  this.statuses.map(item => {        
            this.checkStatusUpdate(item.stat)
        }) */

       
        
        await this.checkLevels('wounds');
        await this.checkLevels('fatigues');
    }

   /*  createTokenCheck(){
        let actor=this.entity.actor;
 
    
    let woundsval=actor.system?.wounds?.value;
    if (woundsval){
       
        this.applyEffect(this.wounds.filter(el=>el.value==woundsval)[0].icon,true);
      
    }

    let fatigueval=actor.system?.fatigue?.value;
    if (fatigueval){        
        this.applyEffect(this.fatigues.filter(el=>el.value==fatigueval)[0].icon,true);
    }
    } */
    
}

