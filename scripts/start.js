import StatusIcon from './class/StatusIcon.js';
import CombatControl from './class/CombatControl.js';
import * as gb from './gb.js';
import * as st from './st.js';
import ItemRoll from './class/ItemRoll.js';
import ItemDialog from './class/ItemDialog.js';
import SheetControl from './class/SheetControl.js';
import RollControl from './class/RollControl.js';
import { registerSettings } from './settings.js';
import TokenHud from './class/TokenHud.js';
//import Char from './class/Char.js';
import CharRoll from './class/CharRoll.js';
import CharUp from './class/CharUp.js';


//// NEXT TODO -> Scale and Size (see about Swat and Stomp - ignore scale)
/// auto-check (and ask to include) CDT actions for weapons 
/// fix melee in ranged (vehicles)

// TODO - compat with better rolls
// TODO - reload only X -> Deadlands ?

/*
 const ENTITY_PERMISSIONS = {
    "NONE": 0,
    "LIMITED": 1,
    "OBSERVER": 2,
    "OWNER": 3
  }; 


  const DICE_ROLL_MODES = {
  PUBLIC: "roll",
  PRIVATE: "gmroll",
  BLIND: "blindroll",
  SELF: "selfroll"
};


ui.notifications.error =>red
ui.notifications.info => blue
ui.notifications.warn =>yellow
  
*/

var foundryIsReady=false;


Hooks.on('ready',async()=>{


    /// only socket to fix permission for gb.setFlagCombatant (remove it => or rework)
    /* game.socket.on('module.'+gb.moduleName,async(data)=>{
        if (game.user.id != gb.GMPlayer().id) return;
        gb.log(data);
       await game.combats.get(data.combat._id).setFlag(data.scope,data.flag+'###'+data.combatant._id,data.value);       
        
    }) */

   
    game.swadetools={};
    game.swadetools=st;

    /* game.swadetools.attribute=async(actor,attribute)=>{
        await st.attribute(actor,attribute)
    } */
   


    game.swade.rollItemMacro=(itemName)=>{
        gb.macroRoll(itemName);
    }


    
  game.swade.swadetoolsAttack=async (actor,item,dialog=false)=>{
      if (dialog){
        let itemRoll=new ItemDialog(actor,item.id)
        //    console.log(this.item);
            
            itemRoll.showDialog();
           
      } else {
        if (actor.type=='vehicle'){
            actor=gb.getDriver(actor);
        }
        let itemRoll=new ItemRoll(actor,item)
        //  console.log(this.item);
            
            await itemRoll.rollBaseSkill();
            
            itemRoll.display();
      }
    
  };

 
  game.swade.swadetoolsRollTrait= async (actor,name,mod,attr=false)=>{
    

    let char=new CharRoll(actor);
    char.addModifier(mod,gb.trans('Additional'))

                        if (attr){
                            
                            await char.rollAtt(name);
                            
                        } else {
                           // char.addFlag('rolltype','skill');
                            await char.rollSkill(name);
                        } 

                        
                        
                        

                        char.display();
    
    

  }

     
  await registerSettings();
    foundryIsReady=true;


    // check version
    /* let swadeversion=game.system.data.version.split('.');
    if (gb.realInt(swadeversion[0])==0 && gb.realInt(swadeversion[1])<17){
        ui.notifications.error(gb.trans('UpdateSWADE'));
    } */

   // console.log(gb.realInt(swadeversion[1]));

   
   
   CONFIG.statusEffects.map(data=>{
      // console.log(data);
       if (gb.statusDefault.includes(data.id)){

        if (!gb.setting('defaultStatusIcons')){
           data.icon=gb.stIcons.filter(el=>el.stat==gb.statusDefaultToIs(data.id))[0]?.icon;
           data.img=gb.stIcons.filter(el=>el.stat==gb.statusDefaultToIs(data.id))[0]?.icon;
        }

           if (data?.flags?.swade?.expiration){ /// disable dialog -> enable for no-autoRoll in the future ????
            data.flags.swade.expiration=undefined;
           }
           
       }
   })

   CONFIG.statusEffects.push({
    img: 'modules/swade-tools/icons/w1.png',
    id: 'woundst',
    _id: gb.wounds_id,
    name: 'SWADE.Wound',
    })

    CONFIG.statusEffects.push({
        img: 'modules/swade-tools/icons/f1.png',
        id: 'fatiguest',
        _id: gb.fatigues_id,
        name: 'SWADE.Fatigue',
        })

   /// remove swade dialogs
   if (gb.setting('noStatusAutoRoll')!='all'){
    const effectCallbacks = game.swade.effectCallbacks;
    effectCallbacks.set('shaken', ()=>{});
    effectCallbacks.set('vulnerable', ()=>{});
    effectCallbacks.set('stunned', ()=>{});
    
   }
   



  

   /// build attr names
   gb.attributesShort.forEach(attr=>{
       attr.trans=gb.trans(gb.attrlang[attr.name],'SWADE')
   })

  
    
})

Hooks.on("renderSidebarTab", async (object, html) => {
    if (object instanceof Settings) {
      const details = html.find("#game-details");
      const fxDetails = document.createElement("li");
      fxDetails.classList.add("swadetools-donation-link");
      fxDetails.innerHTML = "SWADE Tools <a title='Donate' href='https://ko-fi.com/lipefl'><img src='https://storage.ko-fi.com/cdn/cup-border.png'></a> <span><a href='https://github.com/lipefl/swade-tools/issues'>Report issue</a></span>";
      details.append(fxDetails);
    }
  })

Hooks.on("createActor",(actor,options,userid)=>{

  //  gb.log(game.user.id,userid);
    if (game.user.id==userid){
    if (gb.setting('gangUp')){
        if (actor.type=='character'){
            actor.update({'token.disposition':1})
        } else if (actor.type=='npc'){
            actor.update({'token.disposition':-1})
        }
    }

   // gb.log(actor);

   if (actor.system.wildcard===true){
       actor.update({'token.actorLink':true})
     //  gb.log('actorLink');
   }
    

}
})


/* Hooks.on("createActiveEffect", (effect, diff,userid) => { 
    
   // console.log(plus,'ae-data-create');
    
   // console.log(effect);
   
    if (game.user.id==userid && effect.flags?.core?.statusId){
        let actor=effect.parent; 
        let upActor=new StatusIcon(actor,'actor');
        upActor.chainedStatus(effect.flags.core.statusId,true)

       //  let act=new SwadeActiveEffect();
      //  act.apply(actor,'shaken'); 
      //  char.activeEffect(effect.data.flags.core.statusId,false);
    }
    

    

   
})

Hooks.on("deleteActiveEffect", (effect,diff,userid)=>{

    

    if (game.user.id==userid && effect.flags?.core?.statusId){
        let actor=effect.parent; 
        let upActor=new StatusIcon(actor,'actor');
        upActor.chainedStatus(effect.flags.core.statusId,false)
      //  char.activeEffect(effect.data.flags.core.statusId,false);
    }
})
 */


///data-swade-tools-action='func:arg1,arg2'

Hooks.on("renderChatMessage", async (chatItem, html) => { 

   // console.log(chatItem);
    
    html.on('click','a[data-swade-tools-action],button[data-swade-tools-action]',(event)=>{ /// remove and change for Hooks.once ?
        let el=event.currentTarget;
        let data=el.getAttribute('data-swade-tools-action').split(':');
            let func=data[0];
            let args=data[1].split(',')

            //  console.log(func);
             // el.addEventListener('click',()=>{
                  gb.btnAction[func](args);

                 /*  if (el.getAttribute('data-swade-tools-action-once')){
                      $(el).unbind('click').attr('disabled','disabled').removeAttr('data-swade-tools-action');

                  } */
            //  })

    })

    html.on('click','.swadetools-pseudocard header.card-header a',(event)=>{
        let el=$(event.currentTarget);
        el.closest('.swadetools-pseudocard').find('.card-content').toggle();
    })
   //console.log(chatItem)

  //  console.log();

    if (foundryIsReady && chatItem.isRoll){

     //   console.log(chatItem.data.user);

    
     //console.log(chatItem);

        let roll=new RollControl(chatItem,html,chatItem.author);
       
        await roll.doActions();

     /*    let dices=chatItem._roll.dice;


        if (chatItem.data.flags["swade-tools"]?.itemroll){
            html.append('Here it is');
        }


        if (dices!==undefined){
        let ones=dices.filter(el=>el.total==1);

     //   console.log(ones);
        
        if (ones.length>1 && ones.length>(dices.length/2)){
            html.append('<div class="swadetools-criticalfailure">'+gb.trans('CriticalFailure')+'</div>')
        } else {
        html.append('<a class="swadetools-bennyrerroll" title="'+gb.trans('RerollBtn')+'"><i class="fas fa-sync"></i></a>').on('click','a',()=>{
            let actor=game.actors.filter(el=>el.name==chatItem.alias)[0];
            if (!actor || actor.length>1){
                return ui.notifications.warn('NoActorFoundRerroll')
            }

            let char=new Char(actor);
            
         //   console.log(actor);

            if (char.spendBenny()){

            let roll=new Roll(chatItem._roll.formula).roll();

            

            let chatData = {
                user: game.user._id,
                speaker: {alias:chatItem.alias},
             //content: 'this is plus',
            flavor: chatItem.data.flavor
            };
    
    
           roll.toMessage(chatData);
            }
        
        });
    }
    } */

    }
   
});


Hooks.on("updateActor", async (actor,data,diff,userId) => {         
    
 // console.log(actor,data,diff,userId);
    if (game.user.id==userId){ 
        let upActor=new StatusIcon(actor,'actor',data);
        await upActor.checkAllStatus();

        
        let charup=new CharUp(actor,data);
        charup.checkAll();
       
    }
   
   
});


Hooks.on("updateActiveEffect", async (effect,info,diff,userId) => { 

   // console.log(effect);

    if (game.user.id==userId){ 
    let actor=effect.parent;


    let data = effect.changes.reduce(function (r, o) {
        var path = o.key.split('.'),
            last = path.pop();

        path.reduce(function (p, k) {
            return p[k] = p[k] || {};
        }, r)[last] = o.value;
        return r;
    }, {});

    let upActor=new StatusIcon(actor,'actor',data);
    await upActor.checkAllStatus();

    let charup=new CharUp(actor,data);
    charup.checkAll();

  

    

    }

})

/* Hooks.on("createToken",(token,diff,userId)=>{
   // console.log(token,diff,userId);
    if (game.user.id==userId){
    let upToken=new StatusIcon(token,'token',false);
    upToken.createTokenCheck();
    }
   
}) */

Hooks.on('updateToken', async (scene, token, data, options, userId) => {
    if (game.user.id==userId){
      //  console.log(token);
   let upToken=new StatusIcon(token,'token',data)
    await upToken.checkAllStatus();
    }
   
});



Hooks.on('renderActorSheet',(sheet,html)=>{

    
   // if (sheet.actor.data.type!='vehicle'){ /// not available for vehicle yet
      //  console.log(sheet);
        let sct=new SheetControl(sheet,html);
        sct.rebindAll();
  //  }
    
    

})

Hooks.on('renderTokenActionHUD',()=>{
    let tah=new TokenHud();
    tah.rebindAll();
})




Hooks.on('ready',()=>{ /// disable autoInit
    if (gb.mainGM()){
       // console.log('initializing');
       //// already done in swade system
    /* if (!gb.systemSetting('autoInit') && !gb.setting('disableAutoInitStart')){
        game.settings.set('swade','autoInit',true);
        ui.notifications.info(gb.trans('AutoInit','SWADE')+' '+gb.trans('ConfigEnabled'));
    }  */
    

    /* if (gb.systemSettingExists("jokersWild")){

        if (gb.systemSetting('jokersWild') && !gb.setting('disableJokersWild')){
        game.settings.set('swade','jokersWild',false); /// disable system joker's wild for now
        ui.notifications.info(gb.trans('JokersWild','SWADE')+' '+gb.trans('ConfigDisabled'));
        }

       

    }  */

    /* if (gb.systemSettingExists('parryBaseSwid')){
        if (gb.systemSetting('parryBaseSwid')!=gb.trans('fightingSkillSWID')){
            game.settings.set('swade','parryBaseSwid',gb.setting('fightingSkillSWID')) /// auto-translate
            ui.notifications.info(gb.trans('ParryBase.Name','SWADE')+' '+gb.trans('FightingWarn')+' '+gb.setting('fightingSkillSWID'))
        }
        
    } */


    /// disabled -> swade already doing it.
    /* if (!gb.setting('disableAutoInitStart')){
        $(document).on('click','a[data-control="startCombat"]',()=>{
          //  console.log('clicked');
            if (!game.combat.started && game.combat.combatants.filter(el=>el.flags===undefined || el.flags.swade===undefined || el.flags.swade.cardValue===null).length>0){
                game.combat.rollAll();    
            }
        })
    } */
}
        

});

/* Hooks.on('renderSettingsConfig',(obj,html,data)=>{ /// warn that autoInit is disabled
    if (gb.mainGM()){
      //  console.log('render settings');
    html.find('input[name="swade.autoInit"]').attr('disabled','disabled').closest('.form-group').attr('style','border:1px solid red;padding:0 3px').append(`<p class="notes" style="color:red">${gb.trans('AutoInitWarn')}</p>`);
    }
}) */



//var dontStart=false;
let cbt=new CombatControl;

/* Hooks.on('combatTurn'),  (combat,data,data2)=>{
    console.log(combat,data,data2);
    return true;
} */



Hooks.on('combatTurn', async (combat,data,options) => 
{
    if (options.direction == -1) return;  //EternalRider: Do not retrigger
   // console.log(JSON.parse(JSON.stringify(data.turn)));
    
    // cbt.setCombat(combat.id); //EternalRider: useless
   // const currentCombatant=await combat.current.combatantId;
    await cbt.endTurn(combat.turns[data.turn - 1]);  //EternalRider: with no backforward, just use minus 1

    await cbt.startTurn(combat.turns[data.turn]);

    
   
   // 
   //  console.log(combat,data);
})

Hooks.on('combatRound',async (combat,data,options) => {
    if (options.direction == -1) return;  //EternalRider: Do not retrigger
    // cbt.setCombat(combat.id); //EternalRider: useless
    // const currentCombatant=await combat.current.combatantId;

    /* EternalRider: hooks will not be called in right times, so we need to wait for all combatants to have their initiative set
    let helpHook=Hooks.on('updateCombat', async(combatdata)=>{

        let itgo=true;
        combatdata.turns.map(turner=>{
            if (turner.initiative===null){
                itgo=false;
            }
        })

        if (itgo){
            await cbt.endTurn();
            await cbt.startTurn(combat.turns[0]);
            Hooks.off('updateCombat',helpHook)
        }
   
    })*/
    
    //EternalRider: store this before it has been changed
    let previous = combat.combatants.get(combat?.previous?.combatantId);
    //EternalRider: clean up retrigger tag when new round starts
    for (let turner of combat.turns) {
        await cbt.setFlag(turner, gb.moduleName, 'hasStarted', false);
        await cbt.setFlag(turner, gb.moduleName, 'hasEnded', false);
       //await turner.setFlag(gb.moduleName,'hasStarted',false);
      // await turner.setFlag(gb.moduleName,'hasEnded',false);
    }
    //EternalRider: wait for all combatants to have their initiative set
    await gb.waitFor(() => {
        return combat.turns.every(turner => turner.initiative !== null);
    }, -1);
    //EternalRider: then trigger the end and start turn
    await cbt.endTurn(previous);
    await cbt.startTurn(combat.turns[0]);
})

//EternalRider: don't forget to start the first turn
Hooks.on("combatStart", async (combat, data) => {
    await cbt.startTurn(combat.turns[data.turn]);
});

// Hooks.on('updateCombat',async (entity,data,options,userid)=>{
//   //  console.log(JSON.parse(JSON.stringify(entity)))
//   //console.log(entity);

//     gb.log('SWADETOOLS','A',gb.mainGM(),foundryIsReady);
//     if (foundryIsReady && gb.mainGM()){
    
//     let combatdata=entity;
//     let combatid=combatdata.id;
//     cbt.setCombat(combatid);  
    
//     gb.log('SWADETOOLS','B',combatid,combatdata);
    
//     /// COMBAT SYNC ERROR 
//     /* if (combatdata.current.round!=combatdata.previous.round){
      

//        await cbt.endTurn(combatdata.combatants.find(el=>el.id==combatdata.previous.combatantId));
//        let init=0;
//        let first=false;
//        let csize=combatdata.combatants.size;
//        let i=0;
//        let combatantsids=new Array;
//        let suit=0;
    

//        let firstPlayer=Hooks.on('updateCombatant',async(combatant,initdata)=>{
       
           
//             if (initdata.initiative!==null){
//                 if (!combatantsids.includes(combatant.id)){
//                     combatantsids.push(combatant.id);
//                     i++;

//                     if (initdata.flags.swade.cardValue>init ||
//                         initdata.flags.swade.cardValue==init && initdata.flags.swade.suitValue>suit
//                         ){                   
//                         first=combatant.id;
//                         init=initdata.flags.swade.cardValue;
//                         suit=initdata.flags.swade.suitValue;
//                     }
    
//                     if (i==csize){
//                         Hooks.off('updateCombatant',firstPlayer);
//                         await cbt.startTurn(combatdata.combatants.find(el=>el.id==first));
//                     }
//                 }
                
                
             
              
//             }

           
//        })

       
        
//     } else { */

//         if (cbt.isNewTurn()){
//             gb.log('SWADETOOLS','C');
//         await cbt.endTurn();
//         await cbt.startTurn(combatdata.combatants.find(el=>el.id==combatdata.current.combatantId));

//         gb.log('SWADETOOLS','D');
//         } /* else {
//           //  await cbt.endPrevious();
//             gb.log('not a new turn')
//         } */
//     /* } */
   
    
//     }
// });



/* Hooks.on("renderCombatTracker", async (combatTracker, update) => {
    let combat=combatTracker.viewed;




    
  //  console.log(combat);
  //  console.log(update);
    if (combat.combatant) {
        cbt.setCombat(combat.id);
      //  let nextTurn = getNextTurn(combat);
        if (update && lastTurn != combat.combatant._id && foundryIsReady  && gb.mainGM()) {
            lastTurn = combat.combatant._id;
         // console.log(update);
      //   console.log(combat,combat.combatant,combat.started);
            if (combat && combat.combatant && combat.started) {
          //      console.log(combat.combatant.name);
                await cbt.act(combat.combatant);
                

            }
        }
    }
}); */


/* Hooks.on('renderCombatTracker',async (data)=>{
    if (gb.mainGM() && foundryIsReady){
       // console.log(data,args);
    //   console.log('dontStart',dontStart);
       let combat=data.combat;

      // console.log(combat);
       
       if (!combat || !combat.started){
           return false;
       }

      
       

       if (combat.getFlag(gb.moduleName,'roundAct')!=combat.round){ ///once per round
            let combatorder='';
            combat.setupTurns().map(el=>{
               combatorder+=el.initiative+'-'+el._id+'-';
            })

           
            if (!dontStart && combat.getFlag(gb.moduleName,'roundOrder')!=combatorder){
                dontStart=true;
                await combat.setFlag(gb.moduleName,'roundOrder',combatorder);
                await combat.setFlag(gb.moduleName,'roundAct',combat.round);
                
                dontStart=false;
               // console.log('new combat order',combatorder);
            //    console.log('new combat round',combat.round,combatorder);
                
            } 
            
       }
       
      // console.log(data.combat.setupTurns());
       // console.log('renderCombatTracker',data.combat.combatant.name,data.combat.round,data.combat.combatant.flags.swade.cardValue);
       
        cbt.setCombat(combat.id);

        let combatantdata=combat.combatant.initiative+'-'+combat.combatant._id+'-'+combat.round;

        if (!dontStart && combat.combatant.flags?.swade?.cardValue && combat.getFlag(gb.moduleName,'lastActed')!=combatantdata){
            dontStart=true           
            await cbt.jokersWild(combat);
            await cbt.act(combat.combatant);
            await combat.setFlag(gb.moduleName,'lastActed',combatantdata);
            dontStart=false;
        }
        
    }
 
})
 */
/* Hooks.on('updateCombat',combat=>{

    //   console.log('combatout');
       if (gb.mainGM()){
           
      //     console.log('combat');
       /// check if no card flags (combatant.flags.swade) and run initiative automatically => combat.rollAll();
       //console.log('combat update');
      // console.log(combat);
       cbt.setCombat(combat.id);
       if (combat.getFlag(gb.moduleName,'initRolled')!=combat.round){
           dontStart=true;
           if (combat.combatants.filter(el=>el.flags.swade===undefined || el.flags.swade.cardValue===null).length>0){
              
               combat.rollAll().then(()=>{
                   dontStart=false;
                   cbt.act(combat.combatant); /// first in this round
                   
               });       
           }
          
   
           combat.setFlag(gb.moduleName,'initRolled',combat.round);
           
       } 
   
       if (!dontStart){
           cbt.act(combat.combatant);
   
       }
      
   }
   }); */



/* var jokerIsGiving=false;

Hooks.on('renderCombatTracker',(obj,html,data)=>{

    if (foundryIsReady && !gb.setting('disableJokersWild') && gb.mainGM()){

    if (data.hasCombat){
        
      //  console.log('jokeris',jokerIsGiving)
       // if (!jokerIsGiving){
           if (!jokerIsGiving){
                jokerIsGiving=true;
                cbt.jokersWild(data.combat).then(()=>{
                    jokerIsGiving=false;
                //    console.log('jokeris',jokerIsGiving)
                })
            }
          
           
       // }
        
    }
}
}) */






