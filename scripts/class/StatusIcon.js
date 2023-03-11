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

    noBasicActiveEffect(statusName){
        
        if (statusName && this.entity.effects.filter(el=>el.flags?.core?.statusId==this.translateActiveEffect(statusName)).length>0){
            return false;
        } else {
            return true;
        }
    }

    async applyEffect(icon,active,overlay=false){


        

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
                    }
                    
                },500)
            
                
            
            
                
            
           
        })
    }

}
       /*  if (this.entityType=='actor'){
            this.entity.getActiveTokens().map((token)=>{
                
            })
        } else if (this.entityType=='token'){
           canvas.tokens.get(this.entity._id).toggleEffect(icon,{active:active}); 
        } */
    }

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
        let idstat=this.entity.data.effects.filter(el=>el.data.flags?.core?.statusId && el.data.flags?.core?.statusId==this.translateActiveEffect(statusName))[0]?._id;
        if (idstat){
            this.entity.deleteEmbeddedDocuments('ActiveEffect',[idstat]);
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
                statval=this.data?.actorData?.data?.wounds?.value;
            }
            
            levels=this.wounds;
        } else if (levelType=='fatigues'){
    
            if (this.entityType=='actor'){
                statval=this.data.system?.fatigue?.value;
            } else if (this.entityType=='token'){
                statval=this.data?.actorData?.data?.fatigue?.value;
            }
            
            levels=this.fatigues;
        }

        //console.log(levelType,levels,statval);
    
        if (statval!==undefined){

            /// mark defeated
            this.markDefeated(levelType,statval);

            levels.map(async item => {
                if (item.value==statval){
                     await this.applyEffect(item.icon,true)
                } else {
                    await this.applyEffect(item.icon,false)
                }
            })
            
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

    markDefeated(){
      //  let actor=this.getActor();
      
        let char=new Char(this.entity,this.istoken);

        
            this.applyEffect(CONFIG.controlIcons.defeated,char.isDefeated(),true)
       
       
    }
    

    async checkAllStatus(){
       /*  this.statuses.map(item => {        
            this.checkStatusUpdate(item.stat)
        }) */

       
        
        await this.checkLevels('wounds');
        await this.checkLevels('fatigues');
    }

    createTokenCheck(){
        let actor=this.entity.actor;
    /* this.statuses.map(item=>{
        if (actor.data.data.status[item.stat]){
            this.applyEffect(item.icon,true);
        } 
    }); */
    
    let woundsval=actor.system?.wounds?.value;
    if (woundsval){
       
        this.applyEffect(this.wounds.filter(el=>el.value==woundsval)[0].icon,true);
      
    }

    let fatigueval=actor.system?.fatigue?.value;
    if (fatigueval){        
        this.applyEffect(this.fatigues.filter(el=>el.value==fatigueval)[0].icon,true);
    }
    }
    
}

