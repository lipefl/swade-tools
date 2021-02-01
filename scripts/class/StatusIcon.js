import Char from './Char.js';
import * as gb from './../gb.js';

export default class StatusIcon {

    statuses = [
        {stat: 'isShaken', icon: 'modules/swade-tools/icons/shaken.png'},
        {stat: 'isDistracted', icon: 'modules/swade-tools/icons/distracted.png'},
        {stat: 'isVulnerable', icon: 'modules/swade-tools/icons/vulnerable.png'},
        {stat: 'isStunned', icon: 'modules/swade-tools/icons/stunned.png'},
        {stat: 'isEntangled', icon: 'modules/swade-tools/icons/entangled.png'},
        {stat: 'isBound', icon: 'modules/swade-tools/icons/bound.png'}
    ]
    
    wounds = [
        {value: 1, icon: "/modules/swade-tools/icons/w1.png"},
        {value: 2, icon: "/modules/swade-tools/icons/w2.png"},
        {value: 3, icon: "/modules/swade-tools/icons/w3.png"},
        {value: 4, icon: "/modules/swade-tools/icons/w4.png"},
        {value: 5, icon: "/modules/swade-tools/icons/w5.png"},
        {value: 6, icon: "/modules/swade-tools/icons/w6.png"}    
       
    ]
    
    
    fatigues = [
        {value: 1, icon: "/modules/swade-tools/icons/f1.png"},
        {value: 2, icon: "/modules/swade-tools/icons/f2.png"}
       
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
        
    }

    addOptions(){

        if (gb.setting('defaultStatusIcons')){
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

    applyEffect(icon,active,overlay=false){

        this.getTokens().map(token=>{
           token.toggleEffect(icon,{active:active,overlay:overlay}) 
        })
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
           return [canvas.tokens.get(this.entity._id)]; 
        }
    }

    checkStatusUpdate(statusName){
        let statusvar;
    
        if (this.entityType=='actor'){
            statusvar=this.data?.data?.status?.[statusName];
        } else if (this.entityType=='token'){
            statusvar=this.data?.actorData?.data?.status?.[statusName];
        }
    
    
        if (statusvar!==undefined){
            let varcheck;
            if (this.entityType=='actor'){
                varcheck=this.data.data.status[statusName];
            } else if (this.entityType=='token'){
                varcheck=this.data.actorData.data.status[statusName];
            }

            let icon=this.statuses.filter(el=>el.stat==statusName)[0].icon;
    

            this.applyEffect(icon,varcheck)
            this.chainedStatus(statusName,varcheck);
            
            
           
            /* if (varcheck){
                this.applyEffect(icon,true);
            } else {
                this.applyEffect(icon,false);
            } */

            
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


    chainedStatus(statusName,val){

      // let char=new Char(this.entity,this.is)
       
        if (statusName=='isStunned'){

           // console.log(this.entity);
         //   console.log(val);

             /// manually to avoid bugs
           if (this.istoken){
             //  console.log(this.entity)
               canvas.tokens.get(this.entity._id).update({'actorData.data.status.isDistracted':val,'actorData.data.status.isVulnerable':val})
           } else {
            this.entity.update({'data.status.isDistracted':val,'data.status.isVulnerable':val})
           }


            
            /* setTimeout(()=>{ /// silver tape for bug
                this.upStatus('isDistracted',val);
                this.upStatus('isVulnerable',val);
            },250) */
           
           
        }
        else
        if (statusName=='isEntangled'){
            if (this.istoken){
                canvas.tokens.get(this.entity._id).update({'actorData.data.status.isDistracted':val})
               } else {
                this.entity.update({'data.status.isDistracted':val})
               }
           
        }
        else
        if (statusName=='isBound'){
            if (this.istoken){
                canvas.tokens.get(this.entity._id).update({'actorData.data.status.isDistracted':val,'actorData.data.status.isVulnerable':val})
               } else {
                this.entity.update({'data.status.isDistracted':val,'data.status.isVulnerable':val})
               }
    
        }
       // return true;
    }


    checkLevels(levelType){

        let statval
        let levels;
    
        if (levelType=='wounds'){
            if (this.entityType=='actor'){
                statval=this.data?.data?.wounds?.value;
            } else if (this.entityType=='token'){
                statval=this.data?.actorData?.data?.wounds?.value;
            }
            
            levels=this.wounds;
        } else if (levelType=='fatigues'){
    
            if (this.entityType=='actor'){
                statval=this.data?.data?.fatigue?.value;
            } else if (this.entityType=='token'){
                statval=this.data?.actorData?.data?.fatigue?.value;
            }
            
            levels=this.fatigues;
        }
    
        if (statval!==undefined){

            /// mark defeated
            this.markDefeated(levelType,statval);

            levels.map(item => {
                if (item.value==statval){
                    this.applyEffect(item.icon,true)
                } else {
                    this.applyEffect(item.icon,false)
                }
            })
            
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
    

    checkAllStatus(){
        this.statuses.map(item => {        
            this.checkStatusUpdate(item.stat)
        })
        
        this.checkLevels('wounds');
        this.checkLevels('fatigues');
    }

    createTokenCheck(){
        let actor=game.actors.get(this.entity.actorId);
    this.statuses.map(item=>{
        if (actor.data.data.status[item.stat]){
            this.applyEffect(item.icon,true);
        } 
    });
    
    let woundsval=actor.data.data.wounds.value;
    if (woundsval){
       
        this.applyEffect(this.wounds.filter(el=>el.value==woundsval)[0].icon,true);
      
    }

    let fatigueval=actor.data.data.fatigue.value;
    if (fatigueval){        
        this.applyEffect(this.fatigues.filter(el=>el.value==fatigueval)[0].icon,true);
    }
    }
    
}

