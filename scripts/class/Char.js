
import * as gb from './../gb.js';

export default class Char {
    constructor(entity,istoken=false){
        this.entity=entity;
        this.bennies=null;
        this.gmBenny=false;
        this.istoken=istoken;
      //  this.update={}

     // console.log(entity);

        if (entity.actorData) { /// target token
            this.entity=canvas.tokens.get(entity._id)
            this.istoken=true;
        } 

        if (!istoken && this.entity.actor!==undefined){
            this.istoken=true;
        }
    }

    is(statusName){
        if (this.data('status.'+statusName)){
            return true;
        } else {
            return false;
        }
    }

    hasEdgeSetting(edgeName){
        
        let edge=this.getActor().items.filter(el=>el.type=='edge' && el.name.trim()==gb.settingKeyName(edgeName).trim());
        if (edge && edge.length>0){
            return true;
        } else {
            return false;
        }
    }

    data(key){ // after data.data
      //  console.log(this.getActor());
       // console.log(key,this.getActor().data[key]);
        let keys=key.split('.');
       // let actor=
     //  console.log(this.entity,this.getActor());
        let data=this.getActor().data.data;
       
        keys.map(k=>{
        //    console.log(k);
            data=data[k];
        //    console.log(data);
        })

      //  console.log(key,data);
        return data;
       // return gb.getActorData(this.entity,'data.'+key,this.istoken)
    }

    dataint(key){
        return gb.realInt(this.data(key));
    }

    hasPerm(){
        if (this.getActor().permission==3){
            return true;
        } else {
            return false;
        }
    }

    isDefeated(){

        let defeated=false;
        if (this.data('fatigue.value')>this.data('fatigue.max')){
            defeated=true;
        } else if (this.data('wounds.value')>this.data('wounds.max')) {
            defeated=true;
        }
        return defeated;

    }

   /*  update(key,val){ /// after data.data
        this.applyUpdate
        gb.updateActor(this.actor,'data.'+key,val,this.istoken);
    } */

    

    update(data,val){
        /* let entity=this.actor;
        data='data.'+data;
        if (this.istoken){
            data="actorData."+data;
            entity=canvas.tokens.get(this.actor.id)
        }
       entity.update({[data]:val}); */

       this.updateData({[data]:val});
    }


    updateData(dataobj){
        if (this.hasPerm()){
        let entity=this.entity;
        let prefix='data.';
        if (this.istoken){
            prefix="actorData.data.";
            entity=canvas.tokens.get(this.entity.id)
        }

        let dataupdate={}
        for (const i in dataobj){
            dataupdate[prefix+i]=dataobj[i]
        }

       // console.log(dataupdate);
       entity.update(dataupdate);
        }
    }

  /*  getEntity(){
       let entity=this.actor;
       if (this.istoken){
        entity=canvas.tokens.get(this.actor._id)
       }

       return entity;
   } */


    off(statusName){
     //   console.log(statusName,this.is(statusName));
        if (this.is(statusName)){
            this.update('status.'+statusName,false);
           // this.actor.update({['data.status.'+statusName]:false})
       }
       
    }

    on(statusName){
      //  console.log(statusName,this.is(statusName));
        if (!this.is(statusName)){
           this.update('status.'+statusName,true);
          //  this.actor.update({['data.status.'+statusName]:true})
        }
       
    }

    applyWounds(wounds){
        let actualwounds=gb.realInt(this.data('wounds.value'))+gb.realInt(wounds);
       // let maxwounds=this.actor.data.data.wounds.max

       this.update('wounds.value',actualwounds);
      //  this.actor.update({'data.wounds.value':actualwounds});
        /* if(actualwounds>=maxwounds){
            /// mark defeated
            tokenTarget.toggleOverlay(CONFIG.controlIcons.defeated);
        } */
    }

    spendBenny(){
        if (this.getActor().permission!=3){
            ui.notifications.error(gb.trans('PermissionActor'))
            return false;
        } else 
        if(!this.bennyCount()){
            this.say(gb.trans('NoBennies'))
            return false; /// não tem bene
        } else {
            let actualBennies=this.bennyCount()-1;
            if (this.gmBenny){
                gb.GMPlayer().update({"flags.swade.bennies":actualBennies});   
            } else {
                this.update('bennies.value',actualBennies);

                if (gb.settingKeyName('Hard Choices')){ /// give the GM a BENNY
                    let gmPlayer=gb.GMPlayer();
                    let actualGMBennies=gmPlayer.data.flags.swade.bennies;
                    actualGMBennies++;
                    gb.GMPlayer().update({"flags.swade.bennies":actualGMBennies});
                    
                }
              //  this.actor.update({"data.bennies.value":actualBennies});
            }

            gb.bennyAnimation();

            return true;
        }


    }

    giveBenny(){
        let actualBennies=this.dataint('bennies.value')+1;
        this.update('bennies.value',actualBennies);
     //   this.actor.update({"data.bennies.value":actualBennies});
    }


    getActor(){
        let actor=this.entity;
        if (this.istoken){
            actor=this.entity.actor;
        }

        return actor;
    }
    

    bennyCount(){
        if (this.bennies==null){       
        let actualBennies=0;

        let actor=this.getActor();

        if (actor.isWildcard){
            if (!gb.settingKeyName('Hard Choices') || actor.isPC===true){
                actualBennies=this.dataint('bennies.value');
            }
            
            
        } 

        

        if (actualBennies<=0 && actor.data.type=='npc'){
            this.gmBenny=true; /// uses gm benny if it's an enemy and has no bennies.
        }
    
        if (this.gmBenny){
            let gmPlayer=gb.GMPlayer();
            actualBennies=gmPlayer.data.flags.swade.bennies;
          //  console.log(gmPlayer);
        }

        this.bennies=actualBennies;
        }
        return this.bennies;
    }

    bennySay(){
        this.bennyCount();
        let bennieWord='Bennies';
        if (this.bennies==1){
            bennieWord='Benny';
        }
        if (this.gmBenny){
            return `${gb.trans('YouHave')} ${this.bennies} ${gb.trans(bennieWord)} ${gb.trans('AsGM')}`
        } else {
            return `${gb.trans('Have')} ${this.bennies} ${gb.trans(bennieWord)}`;
        }
    }

    say(msg,flavor){
       
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
          content: msg,
        flavor: flavor
        };
    
        /* let chat=new ChatMessage();
        chat.render(false,) */
        return ChatMessage.create(chatData, {});

       // return gb.say(msg,this.entity.name,flavor)
    }

    /* rollAtt(attribute,modifier=0){  ///if targetNumber, use modifier => tn always 4
        let dieType=this.actor.data.attributes[attribute].die.sides;
        let modDice=this.actor.data.attributes[attribute].die.modifier+modifier;
        let wildCard=this.actor.isWildcard;
        let rollExp;

        if (!wildCard){
            rollExp=`1d${dieType}x${modDice}`;
        } else {
            let wildDie=this.actor.data.attributes[attribute]["wild-die"].sides;
            rollExp=`{1d${dieType}x,1d${wildDie}}kh`
        }

        let roll=new Roll(rollExp).roll();
        roll.toMessage();

    } */
}