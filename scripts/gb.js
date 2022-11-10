import Char from "./class/Char.js";
import CharRoll from "./class/CharRoll.js";
import ItemDialog from './class/ItemDialog.js';
import SystemRoll from './class/SystemRoll.js';
export const moduleName='swade-tools'


export const attributes=['agility','smarts','spirit','strength','vigor']
export const edgesNaming=['Elan','No Mercy','Iron Jaw','Combat Reflexes','Dodge','Block','Improved Block','Frenzy', 'Formation Fighter','Rapid Fire','Soldier','Brawny'];
export const abilitiesNaming=['Construct','Hardy','Undead','Swat','Unstoppable'];
export const settingRules=['Dumb Luck','Unarmored Hero','Wound Cap'];

export const RoFBullets={
    2: 5,
    3: 10,
    4: 20,
    5: 40,
    6: 50
}

export const attrlang={
    agility: "AttrAgi",
    spirit:"AttrSpr",
    strength: "AttrStr",
    smarts:  "AttrSma",
    vigor: "AttrVig"
}

export const statusDefault = ['shaken','distracted','vulnerable','stunned','bound','entangled'];

export const stIcons=[
    {stat: 'isShaken', icon: 'modules/swade-tools/icons/shaken.png'},
    {stat: 'isDistracted', icon: 'modules/swade-tools/icons/distracted.png'},
    {stat: 'isVulnerable', icon: 'modules/swade-tools/icons/vulnerable.png'},
    {stat: 'isStunned', icon: 'modules/swade-tools/icons/stunned.png'},
    {stat: 'isEntangled', icon: 'modules/swade-tools/icons/entangled.png'},
    {stat: 'isBound', icon: 'modules/swade-tools/icons/bound.png'}
]

export const attributesShort=[
    {name: 'strength', short: 'str'},
    {name: 'agility', short: 'agi'},
    {name: 'spirit', short: 'spi'},
    {name: 'smarts', short: 'sma'},
    {name: 'vigor', short: 'vig'},
]




export const settingKey=(name)=>{
    return name.replace(' ','')+'Setting';
}

export const settingKeyName=(name)=>{
    return setting(settingKey(name))
}

export const getDriver=(vehicle)=>{
    if (vehicle.system?.driver?.id){
        let driverid=vehicle.system.driver.id.split('.');
        return game.actors.get(driverid[1]);
    } else {
        ui.notifications.error(trans('NoOperator'));
        return false
    }
    
}

export const statusDefaultToIs=(status)=>{
    return 'is'+status.charAt(0).toUpperCase() + status.slice(1);
}

export const getDriverSkill=(vehicle)=>{
    if (vehicle.system?.driver?.skill){
        return vehicle.system.driver.skill
    } else if(vehicle.system?.driver?.skillAlternative) {
        return vehicle.system.driver.skillAlternative;
    } else {
        ui.notifications.error(trans('NoOperatorSkill'));
        return false;
    }
   
}

// canvas.tokens.placeables => all tokens in the scene

export const getTokenCoordinates=(token)=>{
    let coo=new Array;    
    

   // console.log(token);
    let gridsize=token.scene.grid.size;
    let middlegrid=Math.round(gridsize/2);
    let width=token.document.width;
    let height=token.document.height;

    //console.log(gridsize,middlegrid,width,height);

    if (width>1 || height>1){
    
    let cx=new Array
    let cy=new Array

    cx.push(token.x+middlegrid);
    cy.push(token.y+middlegrid);

    if (width>1){
        
        let sizew=width;
        
       

        for (let i=1;i<sizew;i++){
        cx.push(token.x+middlegrid+(gridsize*i))
        }

       // console.log(cx);
    }

    if (height>1){
        
        let sizey=height;
        for (let i=1;i<sizey;i++){
        cy.push(token.y+middlegrid+(gridsize*i))
        }

     //   console.log(cy);
    }

    cx.flatMap(d => cy.map(v => coo.push({x:d,y:v})))
} else {
    coo.push({x:token.x+middlegrid,y:token.y+middlegrid}); 
}
    return coo;
    
}

export const getDistance=(origin,target,grid=false,checkWalls=false)=>{
   
    const ray = new Ray(origin, target);

    if (checkWalls){
        if (canvas.walls.checkCollision(ray,{type:"move",mode:"any"})===true){ 
         //   console.log('collision');
            return null
        }
    }

   // let distance = ;
   // console.log(origin,target,);
  //  console.log(CONFIG.Canvas.losBackend.testCollision(origin,target));
  //  console.log(ray.getRayCollisions());
    
    
    //console.log(getRayCollisions(ray,{mode:'any'}))
    return canvas.grid.measureDistances([{ ray }], {gridSpaces: grid})[0];
}

export const getRange=(origin,target,checkWalls=false)=>{ /// walls return null
   // const ray = new Ray(origin, target);
    const grid_unit = canvas.grid.grid.options.dimensions.distance
    let grid=false;
   if (origin.scene.gridType==1){
       grid=true;
   }

    let origin_coo=getTokenCoordinates(origin);
    let target_coo=getTokenCoordinates(target);

    

    let distances=new Array;

    origin_coo.flatMap(d => target_coo.map(v => distances.push(getDistance(d,v,grid,checkWalls))))

   // console.log(distances);

    if (checkWalls && distances.includes(null)){ /// checking for collisions
        return null
    }

    let distance=Math.round(Math.min(...distances)/grid_unit);
   
   
  // console.log(distance,'distance');
   // distance = Math.round(distance / grid_unit) 

   // console.log(distance,'distance-big');

    /// bigger tokens

    


    // adding flying
    let alt=Math.abs(origin.elevation-target.elevation);

    if (alt){
        ///hipotenusa
        distance=Math.round(Math.sqrt(Math.pow(distance,2)+Math.pow(alt,2)));
    }

    if (distance<1){
        distance=1;
    }

   // console.log(distance);
   
    return distance;
}


/* export const tokenIsDefeated=token=>{
   
    if (token.combatant.defeated){
       
        return true;
    }
    if (token.document?.overlayEffect==CONFIG.controlIcons.defeated) {
       
        return true;
    }
    ;
    if (Array.from(token?.actor?.effects).find(el=>el._statusId=='incapacitaded')?.length>0) {
        
        return true;
    }

    return false;
} */


export const trans=(term,initialFlag=false)=>{ 
    if (!initialFlag){
        initialFlag='SWADETOOLS';
    }
    return game.i18n.localize(initialFlag+'.'+term)
}

export const findAttr=(attr)=>{
    
    //attr=attr.trim();
   // log(attributesShort.filter(el=>el.trans==attr.trim()));
    return attributesShort.filter(el=>el.trans==attr.trim())[0]?.name

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
        if (modval==0){
            return '';
        }
        return String(mod);
    }



}


export const explodeAllDice=(weaponDamage)=>{
    let regexDiceExplode = /d[0-9]{1,2}/g;
    weaponDamage = weaponDamage.replace(/x|=/g,'') /// remove x and = if it already has
    weaponDamage = weaponDamage.replace(regexDiceExplode, "$&x");
    return weaponDamage;
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



export const macroRoll=(itemName)=>{
    let actor=findUserActor();
    

        if (actor){
        let item=actor.items.filter(el=>el.name==itemName)[0];

     //   console.log(item);
        
        
        if (item){
            let type=item.type;
            if (type=='skill'){
                let sys=new SystemRoll(actor);
                sys.rollSkill(item.id);
            } else {
                let itemd=new ItemDialog(actor,item.id);
                itemd.showDialog()
            }
            
        } else {
            return ui.notifications.warn(`${trans('NoweaponInActor')} ${itemName}`);
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

export const getMinStr=item=>{
    return Array.from(item.system.minStr.matchAll(/d(\d+)/g), m => m[1])[0];
}

export const realInt =(variable)=>{
    return parseInt(variable) || 0;
}

export const getScale=(size)=>{
    size=realInt(size);
    if (size==-4){
        return -6
    } else if (size==-3){
        return -4
    } else if (size==-2){
        return -2
    } else if (size>-2 && size<4){
        return 0
    } else if (size>3 && size<8){
        return 2
    } else if (size>7 && size<12){
        return 4
    } else if (size>11){
        return 6
    }
}


export const getStrForMinStr=actor=>{
    let char=new Char(actor);
    return char.getStrForMinStr();
}


export const penalArmorMinStr=(actor)=>{
    let penal=0;
   
   let  actorstr=getStrForMinStr(actor);
   let minstr;
    actor.items.filter(el=>el.type=='armor' && el.system.equipped).map(item=>{
        minstr=getMinStr(item)
        if (minstr>actorstr){
            penal+=(minstr-actorstr)/2
        }
    })

    return 0-penal;
}



export const  setFlagCombatant=async (combat,combatant,scope,flag,value)=>{
    let update=[{_id:combatant.id,['flags.'+scope+'.'+flag]:value}]
   // console.log(update);
     //combat.updateCombatant(update);

    /*  log(combat.id);
     log(combatant.id);
     log(update); */
     
    await combat.updateEmbeddedDocuments('Combatant',update);
    
}

export const simpleAttRoll=(attribute,actor)=>{
    
}

export const actorCombatant=(actor)=>{
    if (game.combat){
        let combatant=false;
        if (actor?.token?.id){ /// token actor
            combatant=game.combat.combatants.find(el=>el?.tokenId===actor?.token.id)
        } else {
            combatant=game.combat.combatants.find(el=>el?.actor?.id===actor.id);
        }
     
        if (!combatant){
            return false;
        } else {
            return combatant;
        }
    } else {
        return false;
    }
}

export const actorIsJoker=(actor)=>{

   // actor.token.id==el.tokenId
  /// removed  flags.swade.hasJoker (swade bug)
    if(game.combat && game.combat.combatants.filter(el=>el.flags?.swade?.cardValue>14 && el?.actor?.id===actor.id && 
        (!actor?.isToken || actor.token.id==el.token.id)  /// check if it's the same token
        ).length>0){

       

        return true;
    } else {
     
        return false;
    }
}

export const actorIsConvicted=(actor)=>{
   // let actor=game.actors.get(actorId);
   
    if (actor.system?.details?.conviction.active===true){
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

export const systemSettingExists=(settingName)=>{
    if (game.settings.settings.get("swade."+settingName)!==undefined){
        return true;
    } else {
        return false;
    }
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
//dsnShowBennyAnimation
export const bennyAnimation=()=>{
    if (!!game.dice3d && game.user.getFlag('swade', 'dsnShowBennyAnimation')) {
        const benny = new Roll('1dB').roll({async:false});
        game.dice3d.showForRoll(benny, game.user, true, null, false);
    }
}

export const settingFieldCheckbox=(setting,title,hint)=>{

    return `<div class="form-group">
        <label>${title}</label>
        <div class="form-fields">    
            <input type="checkbox" name="${setting}" ${game.settings.get(moduleName,setting)?'checked':''}>    
        </div>    
        <p class="notes">${hint}</p>
    </div>`
    

}




export const settingFieldSelect=(setting,title,hint,options)=>{

    let ret=`<div class="form-group">
    <label>${title}</label>
    <div class="form-fields">`

    ret+=`<select name="${setting}">`

    options.map(o=>{
        ret+=`<option value="${o.value}" ${game.settings.get(moduleName,setting)==o.value?'selected':''}>${o.text}</option>`
    })
           /*  <option value="">${gb.trans('StatusIconsSettingDefault')}</option>
            <option value="system" ${game.settings.get(gb.moduleName,'defaultStatusIcons')=='system'?'selected':''}>${gb.trans('StatusIconsSettingSystem')}</option>` */
                        
        ret+=`</select>

    </div>

    <p class="notes">${hint}</p>
</div>`

return ret
    

}

export const settingTextArea=(setting,title,hint)=>{

    return `<div class="form-group">
        <label>${title}</label>
        <div class="form-fields">    
            <textarea type="checkbox" name="${setting}">${game.settings.get(moduleName,setting)}</textarea>
        </div>    
        <p class="notes">${hint}</p>
    </div>`
    

}

export const log=(...args)=>{
    if (setting('debugger')){
        console.log(args);
    }
    
}

export const trace=(...args)=>{
    if (setting('debugger')){
        console.trace(args);
    }
    
}

export const getArmorArea=(actor,area='torso')=>{
   // let armorData=actor.armorPerLocation;
   if (area=='torso'){
    return actor.system.stats.toughness.armor;
   } else {
    return actor.armorPerLocation[area.toLowerCase()];
   }
    
}

export const itemSkillMod=item=>{
    return realInt(item.system.actions.skillMod)+realInt(item.system.trademark)
}

export const rechargeWeaponXDialog=(actor,item)=>{
    new Dialog({
        title: `${item.name} ${trans('Reload','SWADE')} X`,
        content: `<div class="swadetools-formline">How many bullets? <input type="text" id="bullets" class="swadetools-bullets-field" /></div>`,
        buttons: {
            cancel: {
                label: `<i class="fas fa-times"></i> ${trans('Cancel','SWADE')}`,
                callback: ()=>{
                
                }
            },
            ok: {
                label: `<i class="fas fa-redo"></i> ${trans('Reload','SWADE')} X`,
                callback: (html)=>{
                    let xvalue=realInt(html.find('#bullets')[0].value)
                   rechargeWeapon(actor,item,false,xvalue);

                }
            }

            
        }
    }).render(true);
}

/// copy from swade system
export const statusChange=async(actor,status,active)=>{
    if (status.startsWith('is')){
        status=translateActiveEffect(status,true)
    }
    const statusConfigData = CONFIG.statusEffects.find((effect) => effect.id === status);
    if (active) {
        // Set render AE sheet to false
        const renderSheet = false;
        // See if there's a token for this actor on the scene. If there is and we toggle the AE from the sheet, it double applies because of the token.
        const tokens = game.canvas.tokens?.getDocuments();

        let token
       // console.log(actor);
        if (actor.isToken){
            token = tokens?.find((t) => t?.id === actor.id);
        } else {
            token = tokens?.find((t) => t.actor?.id === actor.id);
        }
        

      //  console.log(token);
        // So, if there is...
        if (token) {
            // Toggle the AE from the token which toggles it on the actor sheet, too
            //@ts-ignore TokenDocument.toggleActiveEffect is documented in the API: https://foundryvtt.com/api/TokenDocument.html#toggleActiveEffect
            await token.toggleActiveEffect(statusConfigData, {
                active: true,
            });
            // Otherwise
        }
        else {
            // Create the AE, passing the label, data, and renderSheet boolean
            await actor.update({
                'data.status': {
                    [translateActiveEffect(status)]: false,
                },
            });
            actor.toggleActiveEffect(statusConfigData, {
                active: true,
            });
        }
        // Otherwise...
    }
    else {
        await actor.update({
            'data.status': {
                [translateActiveEffect(status)]: false,
            },
        });
        // Find the existing effect based on label and flag and delete it.
        for (const effect of actor.effects) {
            if (effect.getFlag('core', 'statusId') === status) {
                await effect.delete();
            }
        }
    }
}


export const translateActiveEffect=(statusName,removeIs=false)=>{
    if (!statusName){
        return false;
    }

    if (removeIs){
        return statusName.substring(2).toLowerCase();///remove is and put in lowercase
    } else {
        return 'is'+statusName.charAt(0).toUpperCase() + statusName.slice(1) /// is + first letter uppercase
    }
    

    
}

export const rechargeWeapon=async (actor,item,removeShots=false,xbullets=null)=>{
    let newshots;
    let shots=realInt(item.system.shots);
    let curShots=realInt(item.system.currentShots);
    let stop=false;
    let xbulletsay='';

    if (xbullets!=null){
        xbullets=realInt(xbullets);
        xbulletsay=' ('+xbullets+' '+trans('bullets')+')';
    }

    if (shots==curShots){
        ui.notifications.info(trans('ReloadUnneeded','SWADE'));
        stop=true;
    } else {
          
        if ((systemSetting('ammoFromInventory') && actor.type=='character') || (actor.type=='npc' && systemSetting('npcAmmo'))){
            let gearname=item.system.ammo.trim();
            if (!gearname){
               ui.notifications.error(trans('NoAmmoSet','SWADE'));
               stop=true;
            } else {
                let gearitem=actor.items.filter(el=>el.type=='gear' && el.name.trim()==gearname)[0];

                let shotsToFull=shots-curShots;

                if (xbullets!=null){
                    shotsToFull=xbullets;
                } 
                
                
            

                if (!gearitem){
                    ui.notifications.warn(trans('NotEnoughAmmoToReload','SWADE'));
                    newshots=0

                } else {
                    let gearshots=realInt(gearitem.system.quantity);
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
                  
                 await gearitem.update({"data.quantity":newgearshots})
                
                }

            }
        } else {
            /// no ammo gear setting

            if (xbullets!=null){
                newshots=curShots+xbullets
            } else {
                newshots=item.system.shots;
            }
            
        }

       
        if (removeShots){
            newshots=newshots-removeShots;
           
        } 


        

        if (!stop && newshots!=curShots){
            item.update({"data.currentShots":newshots});
            if (item.system.autoReload!==true){  // nao jogar no chat para itens com autoReload
            let char=new Char(actor);
            char.say(`${item.name} ${trans('Recharged')}${xbulletsay}`);
            }
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
        charRoll.addModifier(item.system.actions.dmgMod,trans('ModItem'));
        if (argsArray[3]){
            charRoll.raiseDmg();
        }
      charRoll.rollDamage(`${item.system.damage}`);
      charRoll.display();
    },

    applyTargetDmg:(argsArray)=>{
        //args targetid,raisecount
      //  console.log(argsArray);

        let target=canvas.tokens.get(argsArray[0]).actor
        let raisecount=argsArray[1];
        let char=new Char(target);
        let isvehicle=false;

        if (target.type=='vehicle'){
            isvehicle=true;
        }

     //   console.log(target);
     //   console.log(raisecount);
    

        if (raisecount==0 && !isvehicle){
            if (char.is('isShaken')){
                char.applyWounds(1);
            } else {
                char.on('isShaken');
            }
        } else if (raisecount>0){
            if (!isvehicle){
                char.on('isShaken');
            }
            
           // console.log('isvehicle',isvehicle);
         //   console.log('gritty',setting('grittyDamage'));

            if (!isvehicle && setting('grittyDamage')){
               // console.log('tablerolll');
                game.tables.get(setting('grittyDamage')).draw();
            }

            char.applyWounds(raisecount);

           
            
           
        }


        

        if (isvehicle && raisecount>=0){

            

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