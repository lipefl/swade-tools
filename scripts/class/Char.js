
import * as gb from './../gb.js';

export default class Char {
    constructor(actor,istoken=false){
        this.actor=actor;
        this.bennies=null;
        this.gmBenny=false;
        this.istoken=istoken;
      //  this.update={}
    }

    is(statusName){
        if (this.data('status.'+statusName)){
            return true;
        } else {
            return false;
        }
    }

    data(key){ // after data.data
        return gb.getActorData(this.actor,'data.'+key,this.istoken)
    }

    dataint(key){
        return gb.realInt(this.data(key));
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
        let entity=this.actor;
        data='data.'+data;
        if (this.istoken){
            data="actorData."+data;
            entity=canvas.tokens.get(this.actor._id)
        }
        entity.update({[data]:val});
    }


  /*  getEntity(){
       let entity=this.actor;
       if (this.istoken){
        entity=canvas.tokens.get(this.actor._id)
       }

       return entity;
   } */


    off(statusName){
        if (this.is(statusName)){
            this.update('status.'+statusName,false);
           // this.actor.update({['data.status.'+statusName]:false})
       }
       
    }

    on(statusName){
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
        if (this.actor.permission!=3){
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
              //  this.actor.update({"data.bennies.value":actualBennies});
            }

            return true;
        }


    }

    giveBenny(){
        let actualBennies=this.dataint('bennies.value')+1;
        this.update('bennies.value',actualBennies);
     //   this.actor.update({"data.bennies.value":actualBennies});
    }

    

    bennyCount(){
        if (this.bennies==null){       
        let actualBennies=0;
        if (this.actor.isWildcard){
            actualBennies=this.dataint('bennies.value');
            
        } 

      //  console.log(this.actor);

        if (actualBennies<=0 && this.actor.data.type=='npc'){
            this.gmBenny=true; /// uses gm benny if it's an enemy and has no bennies.
        }
    
        if (this.gmBenny){
            let gmPlayer=gb.GMPlayer();
            actualBennies=gmPlayer.data.flags.swade.bennies;
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
       

        return gb.say(msg,this.actor.name,flavor)
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