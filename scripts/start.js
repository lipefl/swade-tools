import StatusIcon from './class/StatusIcon.js';
import CombatControl from './class/CombatControl.js';
import * as gb from './gb.js';
import ItemRoll from './class/ItemRoll.js';
import ItemDialog from './class/ItemDialog.js';
import SheetControl from './class/SheetControl.js';
import RollControl from './class/RollControl.js';


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
  
*/

var chatUpdate=false;


Hooks.on('ready',()=>{
   // game.settings.set('swade','autoInit',false); ///disable auto init in swade to fix bug
    game.swade.rollSkillMacro=(skillName)=>{
        gb.macroRoll('skill',skillName);
    }

    game.swade.rollWeaponMacro=(weaponName)=>{
        gb.macroRoll('weapon',weaponName);
    }

    game.swade.rollPowerMacro=(powerName)=>{
        gb.macroRoll('power',powerName);
    }

    
  game.swade.swadetoolsAttack=(actor,item,dialog=false)=>{
      if (dialog){
        let itemRoll=new ItemDialog(actor,item.id)
        //    console.log(this.item);
            
            itemRoll.showDialog();
           
      } else {
        let itemRoll=new ItemRoll(actor,item)
        //    console.log(this.item);
            
            itemRoll.rollBaseSkill();
            itemRoll.display();
      }
    
  };

     game.settings.register('swade-tools', 'fightingSkill', {
		name: gb.trans('SettingFighting'),
		hint: gb.trans('SettingFightingHint'),
		default: gb.trans('Fighting'),
		scope: "world",
		type: String,
		config: true
    }); 
    
    game.settings.register('swade-tools', 'countShots', {
		name: gb.trans('SettingUseShots'),
		hint: gb.trans('SettingUseShotsHint'),
		default: true,
		scope: "world",
		type: Boolean,
		config: true
    }); 
    
    game.settings.register('swade-tools', 'countPP', {
		name: gb.trans('SettingUsePP'),
		hint: gb.trans('SettingUsePPHint'),
		default: true,
		scope: "world",
		type: Boolean,
		config: true
    });


    chatUpdate=true;

   // console.log(gb.getActorData(game.actors.get("WO2pFlDeowqDMNQc"),'data.stats.parry.value')+'actor-data');
    
})

Hooks.on('deleteOwnedItem',(actor,item,diff,userId)=>{
    if (game.user.id==userId){
    gb.updateParry(actor,item,false,true);
    }
})

Hooks.on('createOwnedItem',(actor,item,diff,userId)=>{
    if (game.user.id==userId){
   gb.updateParry(actor,item);
    }
    
})

Hooks.on('updateOwnedItem',(actor,item,data,diff,userId)=>{
    if (game.user.id==userId){
    gb.updateParry(actor,item);
    }
})

Hooks.on('updateToken',(scene, token, data, options, userId)=>{
   // console.log(gb.getActorData(token,'data.stats.parry.value',true));
   if (game.user.id==userId){
    gb.updateParry(token,data,true);
   }
})




///data-swade-tools-action='func:arg1,arg2'

Hooks.on("renderChatMessage", (chatItem, html) => { 
    
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

  //  console.log(chatItem)

  //  console.log();

    if (chatUpdate && chatItem.isRoll){


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


Hooks.on("updateActor", (actor,data,diff,userId) => {       
   
    if (game.user.id==userId){ /// TODO define this or... only gm?
        let upActor=new StatusIcon(actor,'actor',data);
        upActor.checkAllStatus();
    }
   
   
});

Hooks.on("createToken",(scene,token,diff,userId)=>{
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

    
    if (sheet.actor.data.type!='vehicle'){ /// not available for vehicle yet
      //  console.log(sheet);
        let sct=new SheetControl(sheet,html);
        sct.rebindAll();
    }
    
    

})






Hooks.on('ready',()=>{ /// disable autoInit
    if (gb.mainGM()){
       // console.log('initializing');

    game.settings.set('swade','autoInit',false);
    }
        
        

});

Hooks.on('renderSettingsConfig',(obj,html,data)=>{ /// warn that autoInit is disabled
    if (gb.mainGM()){
      //  console.log('render settings');
    html.find('input[name="swade.autoInit"]').attr('disabled','disabled').closest('.form-group').attr('style','border:1px solid red;padding:0 3px').append(`<p class="notes" style="color:red">${gb.trans('AutoInitWarn')}</p>`);
    }
})

var dontStart=false;
let cbt=new CombatControl;


Hooks.on('updateCombat',combat=>{
    if (gb.mainGM()){
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
});



var jokerIsGiving=false;

Hooks.on('renderCombatTracker',(obj,html,data)=>{
    if (gb.mainGM()){

    if (data.hasCombat){
        
       // if (!jokerIsGiving){
           if (cbt.jokersWild(data.combat) && !jokerIsGiving){
               jokerIsGiving=true;
           } else {
               jokerIsGiving=false;
           }

       // }
        
    }
}
})






