import StatusIcon from './class/StatusIcon.js';
import CombatControl from './class/CombatControl.js';
import * as gb from './gb.js';
import ItemRoll from './class/ItemRoll.js';
import ItemDialog from './class/ItemDialog.js';
import SheetControl from './class/SheetControl.js';
import RollControl from './class/RollControl.js';
import { registerSettings } from './settings.js';
import TokenHud from './class/TokenHud.js';
import Char from './class/Char.js';

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


Hooks.on('ready',()=>{

   
   
    /* game.swade.rollSkillMacro=(skillName)=>{
        gb.macroRoll('skill',skillName);
    }

    game.swade.rollWeaponMacro=(weaponName)=>{
        gb.macroRoll('weapon',weaponName);
    }

    game.swade.rollPowerMacro=(powerName)=>{
        gb.macroRoll('power',powerName);
    } */

    game.swade.rollItemMacro=(itemName)=>{
        gb.macroRoll(itemName);
    }


    
  game.swade.swadetoolsAttack=(actor,item,dialog=false)=>{
      if (dialog){
        let itemRoll=new ItemDialog(actor,item.id)
        //    console.log(this.item);
            
            itemRoll.showDialog();
           
      } else {
        if (actor.data.type=='vehicle'){
            actor=gb.getDriver(actor);
        }
        let itemRoll=new ItemRoll(actor,item)
        //  console.log(this.item);
            
            itemRoll.rollBaseSkill();
            
            itemRoll.display();
      }
    
  };

     
  registerSettings();
    foundryIsReady=true;


    // check version
    let swadeversion=game.system.data.version.split('.');
    if (gb.realInt(swadeversion[0])==0 && gb.realInt(swadeversion[1])<17){
        ui.notifications.error(gb.trans('UpdateSWADE'));
    }

   // console.log(gb.realInt(swadeversion[1]));

   
   if (!gb.setting('defaultStatusIcons')){
   CONFIG.statusEffects.map(data=>{
      // console.log(data);
       if (gb.statusDefault.includes(data.id)){
           data.icon=gb.stIcons.filter(el=>el.stat==gb.statusDefaultToIs(data.id))[0]?.icon;
           if (!gb.setting('noStatusAutoRoll') && data?.flags?.swade?.expiration){
            data.flags.swade.expiration=undefined;
           }
           
       }
   })

}


//gb.statusChange(game.actors.getName('Purple'),'shaken',false);

//console.log(CONFIG.statusEffects)

   /* CONFIG.statusEffects.unshift({
    icon: 'modules/swade-tools/icons/shaken.png',
    id: 'st-shaken',
    label: 'SWADE.Shaken',
}) */

   // console.log(gb.getActorData(game.actors.get("WO2pFlDeowqDMNQc"),'data.stats.parry.value')+'actor-data');
    
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

    if (gb.setting('gangUp')){
        if (actor.data.type=='character'){
            actor.update({'token.disposition':1})
        } else if (actor.data.type=='npc'){
            actor.update({'token.disposition':-1})
        }
    }
})


Hooks.on("createActiveEffect", (effect, diff) => { 
    
    
   // console.log(effect);
   
    if (effect.data.flags?.core?.statusId){
        let actor=effect.parent; 
        let upActor=new StatusIcon(actor,'actor');
        upActor.chainedStatus(effect.data.flags.core.statusId,true)

       /*  let act=new SwadeActiveEffect();
        act.apply(actor,'shaken'); */
      //  char.activeEffect(effect.data.flags.core.statusId,false);
    }
    

    

   
})

Hooks.on("deleteActiveEffect", (effect,diff)=>{

    if (effect.data.flags?.core?.statusId){
        let actor=effect.parent; 
        let upActor=new StatusIcon(actor,'actor');
        upActor.chainedStatus(effect.data.flags.core.statusId,false)
      //  char.activeEffect(effect.data.flags.core.statusId,false);
    }
})



///data-swade-tools-action='func:arg1,arg2'

Hooks.on("renderChatMessage", (chatItem, html) => { 

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

    

        let roll=new RollControl(chatItem,html,chatItem.data.user);
       
        roll.doActions();

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
    
    
    if (game.user.id==userId){ 
        let upActor=new StatusIcon(actor,'actor',data);
        upActor.checkAllStatus();
    }
   
   
});

Hooks.on("createToken",(token,diff,userId)=>{
   // console.log(token,diff,userId);
    if (game.user.id==userId){
    let upToken=new StatusIcon(token,'token',false);
    upToken.createTokenCheck();
    }
   
})

Hooks.on('updateToken', (scene, token, data, options, userId) => {
    if (game.user.id==userId){
      //  console.log(token);
   let upToken=new StatusIcon(token,'token',data)
    upToken.checkAllStatus();
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

    if (gb.systemSettingExists('parryBaseSkill')){
        if (gb.systemSetting('parryBaseSkill')!=gb.setting('fightingSkill')){
            game.settings.set('swade','parryBaseSkill',gb.setting('fightingSkill')) /// auto-translate
            ui.notifications.info(gb.trans('ParryBase','SWADE')+' '+gb.trans('FightingWarn')+' '+gb.setting('fightingSkill'))
        }
        
    }


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

Hooks.on('updateCombat',async (entity,data,options,userid)=>{
  //  console.log(JSON.parse(JSON.stringify(entity)))
  //console.log(entity);
    if (foundryIsReady && gb.mainGM()){
    let combatdata=entity;
    let combatid=combatdata.id;
    cbt.setCombat(combatid);  
    
   
   
    /// COMBAT SYNC ERROR 
    /* if (combatdata.current.round!=combatdata.previous.round){
      

       await cbt.endTurn(combatdata.combatants.find(el=>el.id==combatdata.previous.combatantId));
       let init=0;
       let first=false;
       let csize=combatdata.combatants.size;
       let i=0;
       let combatantsids=new Array;
       let suit=0;
    

       let firstPlayer=Hooks.on('updateCombatant',async(combatant,initdata)=>{
       
           
            if (initdata.initiative!==null){
                if (!combatantsids.includes(combatant.id)){
                    combatantsids.push(combatant.id);
                    i++;

                    if (initdata.flags.swade.cardValue>init ||
                        initdata.flags.swade.cardValue==init && initdata.flags.swade.suitValue>suit
                        ){                   
                        first=combatant.id;
                        init=initdata.flags.swade.cardValue;
                        suit=initdata.flags.swade.suitValue;
                    }
    
                    if (i==csize){
                        Hooks.off('updateCombatant',firstPlayer);
                        await cbt.startTurn(combatdata.combatants.find(el=>el.id==first));
                    }
                }
                
                
             
              
            }

           
       })

       
        
    } else { */
        await cbt.endTurn(combatdata.combatants.find(el=>el.id==combatdata.previous.combatantId));
        await cbt.startTurn(combatdata.combatants.find(el=>el.id==combatdata.current.combatantId));
    /* } */
   
    
    }
});



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






