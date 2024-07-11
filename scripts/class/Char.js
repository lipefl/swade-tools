
import * as gb from './../gb.js';
import CharRoll from './CharRoll.js';

export default class Char {
    constructor(entity,istoken=false){
        this.entity=entity;
        this.bennies=null;
        this.gmBenny=false;
        this.istoken=false; /// foundry change
        this.isvehicle=false;
       
      //  this.update={}

     // console.log(entity);

        /* if (entity.actorData) { /// target token
            this.entity=canvas.tokens.get(entity._id)
            this.istoken=true;
        } 

        if (!istoken && this.entity.actor!==undefined){
        //    console.log(this.entity.actor);
            this.istoken=true;
        } */

        
        if (this.entity.actor!==undefined){
            this.entity=this.entity.actor;
        }

      // console.log(this.entity);
        if (this.getActor().type=='vehicle'){
            this.isvehicle=true;
        }
    }

    getStrForMinStr(){
        let str=this.getActor(true).system.attributes.strength.die.sides;

       
            if (this.hasEdgeSetting('Soldier')){
                str=str+2
            }
            if (this.hasEdgeSetting('Brawny')){
                str=str+2
            }
        

       // console.log(str);
        return str;
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

    hasAbilitySetting(abilityName){
        
        let ability=this.getActor().items.filter(el=>(el.type=='ability' || el.type=='edge') && el.name.trim()==gb.settingKeyName(abilityName).trim());
        if (ability && ability.length>0){
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
        let data=this.getActor().system;
       
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
        if (!this.isvehicle && this.data('fatigue.value')>this.data('fatigue.max')){
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


    isVehicle(){
        return this.isvehicle;
    }


    getActualPP(arcane='') {
        if (!arcane){
            arcane='general'
        }
        
        return this.entity.system?.powerPoints?.[arcane]?.value;
           
            
    }
    
    spendPP(pp,itemId){
    
        let item=this.entity.items.get(itemId);

        let arcane=item.system.arcane;
        if (!item.system.arcane){
            // actualPP=this.actor.data.data.powerPoints[arcane].value;
             arcane='general';
         }

         let actualPP;
         let updateKey;
         let entity;
        
    
         if (item.isArcaneDevice){

            actualPP=item.system.powerPoints.value;
            updateKey='system.powerPoints.value';
            entity=item;

         } else {

            actualPP=this.getActualPP(arcane);
               // let updateKey='data.powerPoints.general.value';
               
    
               
                updateKey='system.powerPoints.'+arcane+'.value'
    
                entity=this.entity
               
         }
         
         let newpp=gb.realInt(actualPP)-pp;
        
                entity.update({[updateKey]:newpp})
    }



    async outOfControl(){
        let vehicle=this.getActor();
        let driver=gb.getDriver(vehicle);
        
            //// test for out of control
            if (driver){
            let charroll=new CharRoll(driver);
            charroll.addFlavor(gb.trans('OutOfControlRoll')+' ('+vehicle.name+')');
            await charroll.rollSkill(gb.getDriverSkill(vehicle));
            charroll.display();

            if (charroll.isSuccess()){
               // chardrive=new Char(target);
                this.say(gb.trans('OutOfControlSuccess'));
            } else {
                this.say(gb.trans('OutOfControlFail'));
                
                if (gb.setting('outofcontrolTable')){
                    let table=await fromUuid(gb.setting('outofcontrolTable'))
                    await this.rollTable(table);
                   // game.tables.get(gb.setting('outofcontrolTable')).draw();
                }
                
            }
        }
    }


    async rollTable(table){
        let sort=await table.roll();

      //  console.log(sort);

        let chatData={
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this.getActor() })
        }
       
        table.toMessage(sort.results,{roll:sort.roll,messageData:chatData});
    }

    updateData(dataobj){
        if (this.hasPerm()){
        let entity=this.entity;
        let prefix='system.';
        if (this.istoken){
            prefix="actorData.data.";
            entity=canvas.tokens.get(this.entity.id)
        }

        let dataupdate={}
        for (const i in dataobj){
            dataupdate[prefix+i]=dataobj[i]
        }

    //   console.log(dataupdate);
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

  

    async off(statusName){
     //  console.log(statusName,this.is(statusName),'off');
    // console.log(statusName);
 

        if (this.is(statusName)){
          //  this.update('status.'+statusName,false);
          
          await gb.statusChange(this.entity,statusName,false);
           // this.actor.update({['data.status.'+statusName]:false})
       }
       
    }

    async on(statusName){
      //  console.log(statusName);
     //   console.log(statusName,this.is(statusName),'on');
        if (!this.is(statusName)){
           //this.update('status.'+statusName,true);
           await gb.statusChange(this.entity,statusName,true);
          //  this.actor.update({['data.status.'+statusName]:true})
        }
       
    }

    applyWounds(wounds){
      //  console.log(wounds);
        let actualwounds=gb.realInt(this.data('wounds.value'))+gb.realInt(wounds);
       // let maxwounds=this.actor.data.data.wounds.max

       this.update('wounds.value',actualwounds);
      // console.log(actualwounds);
      //  this.actor.update({'data.wounds.value':actualwounds});
        /* if(actualwounds>=maxwounds){
            /// mark defeated
            tokenTarget.toggleOverlay(CONFIG.controlIcons.defeated);
        } */
    }


    activeEffect(status,del){

      

    if (gb.statusDefault.includes(status)){
  
        let onName='is'+status.charAt(0).toUpperCase() + status.slice(1);
        
        if (!del){
            this.on(onName);
        } else {
            this.off(onName);
        }

    }

        
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

                if (gb.systemSetting('hardChoices')){ /// give the GM a BENNY
              /*       let gmPlayer=gb.GMPlayer();
                    let actualGMBennies=gmPlayer.flags.swade.bennies;
                    actualGMBennies++;                   
                    gb.GMPlayer().update({"flags.swade.bennies":actualGMBennies}); */

                    game.swade.sockets.giveBenny([gb.GMPlayer().id]);
                    
                    
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


    getActor(useDriverIfVehicle=false){
        let actor=this.entity;
        if (this.istoken){
            actor=this.entity.actor;
        }

        if (useDriverIfVehicle && this.isvehicle){
            actor=gb.getDriver(actor);
        }

        return actor;
    }
    

    bennyCount(){
        if (this.bennies==null){       
        let actualBennies=0;

        let actor=this.getActor();

        if (actor.isWildcard){
            if (!gb.systemSetting('hardChoices') || actor.type=='character'){
                actualBennies=this.dataint('bennies.value');
            }
            
            
        } 

        

        if (actualBennies<=0 && actor.type=='npc'){
            this.gmBenny=true; /// uses gm benny if it's an enemy and has no bennies.
        }
    
        if (this.gmBenny){
            let gmPlayer=gb.GMPlayer();
            actualBennies=gmPlayer.bennies;
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