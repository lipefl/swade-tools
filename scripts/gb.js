import Char from "./class/Char.js";
import CharRoll from "./class/CharRoll.js";
import ItemDialog from './class/ItemDialog.js';
import SystemRoll from './class/SystemRoll.js';
export const moduleName='swade-tools'


export const attributes=['agility','smarts','spirit','strength','vigor']
export const edgesNaming=['Elan','No Mercy','Iron Jaw','Combat Reflexes'];
export const abilitiesNaming=['Construct','Hardy','Undead'];
export const settingRules=['Dumb Luck','Hard Choices','Unarmored Hero','Wound Cap'];

export const settingKey=(name)=>{
    return name.replace(' ','')+'Setting';
}

export const settingKeyName=(name)=>{
    return setting(settingKey(name))
}

export const trans=(term,initialFlag=false)=>{ 
    if (!initialFlag){
        initialFlag='SWADETOOLS';
    }
    return game.i18n.localize(initialFlag+'.'+term)
}

export const GMPlayer=()=>{return game.users.filter((el)=> el.isGM===true)[0]}

export const mainGM=()=>{
    if(game.user.id==GMPlayer().id) {return true} else {return false} /// get only one main GM
}

export const stringDiceMod=(mod)=>{
    if (!mod.startsWith('+') && !mod.startsWith('-')){
        mod='+'+mod; // add the plus sign
    }

    return mod;
}

export const stringMod=(mod)=>{
  //  let modStr=mod;
  let modval=realInt(mod);
    if (modval>0){
        return `+${String(modval)}`;
    } else {
        return String(mod);
    }



}

export const updateParry=(actor,item,istoken=false,isdelete=false)=>{
  //  console.log(item);
    if (setting('fightingSkill')){
        let items;
       // let updateArg="data.stats.parry.value"
        if (istoken){
            items=item?.actorData?.items;
        //    updateArg="actorData."+updateArg;
         //   actor=canvas.tokens.get(actor) /// get the token by the id;

            if (!items){
                return false; /// no item change
            } else {
                items=items.filter(el=>el.type=='skill'); // only skills
            }


        } else {
            items=[item]
        }


        items.map(skill=>{

           
            if (skill.name==setting('fightingSkill')){    
               
                let parry;
                if (isdelete){
                    parry=0
                } else {

                    let fightdie=realInt(skill.data.die.sides);
                    let mod=realInt(skill.data.die.modifier);
                    if (fightdie<12){ // count modifier only for d12
                        mod=0;
                    }
                    if (skill.data.die.sides)
                    parry=Math.floor((fightdie+mod)/2)+2
                }

               // console.log(parry)
               //  console.log(actor);

                 let char=new Char(actor,istoken);
                 char.update('stats.parry.value',parry);
                
                // updateActor(actor,'data.stats.parry.value',parry,istoken);
                //actor.update({[updateArg]:parry})
            } 
        })
        
    }
    
}

export const getActorData=(entity,data,istoken)=>{
    let keys=data.split('.');
    let obj

   // console.log('reading: '+data);

    if (istoken){
      //  console.log(entity);
        /// search for actorData and return if true, if not, return actor
       let tokendata=entity.actorData;
        let dataRet=keys.reduce((a, v) => a?.[v], tokendata);
        if (!dataRet){
           // console.log(game.actors.get(entity.actor.id));
            obj=game.actors.get(entity.actor.id).data;
        } else {
            return dataRet;
        }
        
    } else {
        obj=entity.data;
    }
    
    return keys.reduce((a, v) => a[v], obj)
}

export const updateActor=(actor,data,val,istoken)=>{
    if (istoken){
        data="actorData."+data;
        actor=canvas.tokens.get(actor._id)
    }
    actor.update({[data]:val});
}

export const macroRoll=(type,itemName)=>{
    let actor=findUserActor();

        if (actor){
        let item=actor.items.filter(el=>el.type==type && el.name==itemName)[0];
        
        if (item){
            if (type=='skill'){
                let sys=new SystemRoll(actor);
                sys.rollSkill(item._id);
            } else {
                let itemd=new ItemDialog(actor,item._id);
                itemd.showDialog()
            }
            
        } else {
            return ui.notifications.warn(`${trans('No'+type+'InActor')} ${itemName}`);
        }
        }
}

export const findUserActor=()=>{
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token)
        actor = game.actors.tokens[speaker.token];
    if (!actor)
        actor = game.actors.get(speaker.actor);

    if (!actor){
        ui.notifications.warn(`${trans('NoActorFound')}`);
        return false;
    }
    
    return actor;
}

export const realInt =(variable)=>{
    return parseInt(variable) || 0;
}

export const actorIsJoker=(actor)=>{

   // actor.token.id==el.tokenId

    if(game.combat && game.combat.combatants.filter(el=>el.flags?.swade?.hasJoker===true && el?.actor?._id===actor._id && 
        (!actor?.isToken || actor.token.id==el.tokenId)  /// check if it's the same token
        ).length>0){

       

        return true;
    } else {
        return false;
    }
}

export const actorIsConvicted=(actor)=>{
   // let actor=game.actors.get(actorId);
   
    if (actor?.data?.data?.details?.conviction.active===true){
       // console.log('conviction is on');
        return true;
       
    } else {
      //  console.log('conviction is off');
        return false;
    }
}

export const setting=(settingName)=>{
    return game.settings.get('swade-tools',settingName);
}

export const systemSetting=(settingName)=>{
    return game.settings.get('swade',settingName);
}

export const say=(what,who,flavor='')=>{
    let chatData = {
        user: game.user._id,
        speaker: {alias:who},
      content: what,
    flavor: flavor
    };

    /* let chat=new ChatMessage();
    chat.render(false,) */
    return ChatMessage.create(chatData, {});
}

export const raiseCount=(result,targetNumber=4)=>{
    return Math.floor((result-targetNumber)/4);
}

export const bennyAnimation=()=>{
    if (game.dice3d) {
        const benny = new Roll('1dB').roll();
        game.dice3d.showForRoll(benny, game.user, true, null, false);
    }
}

export const rechargeWeapon=(actor,item)=>{
    let newshots;
    let shots=realInt(item.data.data.shots);
    let curShots=realInt(item.data.data.currentShots);
    let stop=false;

    if (shots==curShots){
        ui.notifications.info(trans('ReloadUnneeded','SWADE'));
        stop=true;
    } else {
        if ((systemSetting('ammoFromInventory') && actor.isPC) || (!actor.isPC && systemSetting('npcAmmo'))){
            let gearname=item.data.data.ammo.trim();
            if (!gearname){
               ui.notifications.error(trans('NoAmmoSet','SWADE'));
               stop=true;
            } else {
                let gearitem=actor.items.filter(el=>el.type=='gear' && el.name==gearname)[0];
                let shotsToFull=shots-curShots;
                
                console.log(gearname);
                console.log(gearitem);

                if (!gearitem){
                    ui.notifications.warn(trans('NotEnoughAmmoToReload','SWADE'));
                    newshots=0

                } else {
                    let gearshots=realInt(gearitem.data.data.quantity);
                    let usedgearshots;
                    if (gearshots<shotsToFull){
                        ui.notifications.warn(trans('NotEnoughAmmoToReload','SWADE'));
                        newshots=curShots+gearshots;
                        usedgearshots=gearshots;
                    } else {
                        usedgearshots=shotsToFull;
                        newshots=shots;
                    }

                    let newgearshots=gearshots-usedgearshots;
                    gearitem.update({"data.quantity":newgearshots})
                }

            }
        } else {
            /// no ammo gear setting
            newshots=item.data.data.shots;
        }

        if (!stop && newshots!=curShots){
            item.update({"data.currentShots":newshots});
            let char=new Char(actor);
            char.say(`${item.name} ${trans('Recharged')}`);
        }
       
      
    }
}

export const btnAction = { /// button functions

    keepConviction:(argsArray)=>{
        let actor=game.actors.get(argsArray[0]);

        
        if (!actorIsConvicted(actor.id)){
            let char=new Char(actor);
            if (char.spendBenny()){
                char.update('details.conviction.active',true);
                char.say(trans("ConvictionKept"));
            }
        } else {
            ui.notifications.warn(trans('AlreadyConvic'));
        }
    },

    unshakeBenny:(argsArray)=>{
        let actor=game.actors.get(argsArray[0]);
       
        let char=new Char(actor);

        if (char.is('isShaken')){
        if (char.spendBenny()){
            char.off('isShaken');
            char.say(trans("RemShaken"));
        }} else {
            ui.notifications.warn(trans('NotShaken'));
        }
    },

    rollTargetDmg:(argsArray)=>{
      //args  actorid,itemid,targetid,raise
      let actor=game.actors.get(argsArray[0]);
      let target=canvas.tokens.get(argsArray[2])
      let item=actor.items.get(argsArray[1]);

     
      let charRoll=new CharRoll(actor);
      charRoll.combatRoll(argsArray[1]);
    //  charRoll.damageTarget(target);
        charRoll.addFlavor(item.name);
        charRoll.addModifier(item.data.data.actions.dmgMod,trans('ModItem'));
        if (argsArray[3]){
            charRoll.raiseDmg();
        }
      charRoll.rollDamage(`${item.data.data.damage}`);
      charRoll.display();
    },

    applyTargetDmg:(argsArray)=>{
        //args targetid,raisecount
      //  console.log(argsArray);

        let target=canvas.tokens.get(argsArray[0]).actor
        let raisecount=argsArray[1];
        let char=new Char(target);

     //   console.log(target);
     //   console.log(raisecount);
    

        if (raisecount==0){
            if (char.is('isShaken')){
                char.applyWounds(1);
            } else {
                char.on('isShaken');
            }
        } else if (raisecount>0){
            char.on('isShaken');
            char.applyWounds(raisecount);
        }
    },

    rechargeWeapon:(argsArray)=>{
       // args actorid,itemid
       let actor=game.actors.get(argsArray[0]);
       let item=actor.items.get(argsArray[1]);

       rechargeWeapon(actor,item);
       /* item.update({"data.currentShots":item.data.data.shots});
       let char=new Char(actor);
       char.say(`${item.name} ${trans('Recharged')}`); */
    }
}