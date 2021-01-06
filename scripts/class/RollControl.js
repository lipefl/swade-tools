import * as gb from './../gb.js';
import Char from './Char.js';
//import CharRoll from './CharRoll.js';
import ItemRoll from './ItemRoll.js';

export default class RollControl {
    
    constructor(chat,html,userId){

        this.chat=chat;
        this.html=html;
        this.roll=chat._roll;
        this.targetShow='';
        this.targetFunction;
        this.titleshow=false;

        this.user=game.users.get(userId);
        this.userid=userId;

      //  console.log(userId);
    }


    doActions(){
        if (!this.isCritical()){
            this.addBennyButton();
            this.findTargets();
        } else {
            this.html.append('<div class="swadetools-criticalfailure">'+gb.trans('CriticalFailure')+'</div>').ready(()=>{
                this.scrollChat();
            })
        }
    }

    scrollChat(){
        new ChatLog().scrollBottom() /// force scroll
    }

    findTargets(){
        if (this.chat.data.flags["swade-tools"]?.itemroll){ /// show only for items (weapons, powers)

            let rolltype=this.chat.data.flags["swade-tools"].rolltype;

            if (this.chat.data.flags["swade-tools"].usetarget){

                this.targets=[canvas.tokens.get(this.chat.data.flags["swade-tools"].usetarget)];
              //  console.log(this.targets);
              //  console.log(rolltype)
            } else {
                this.targets=Array.from(this.user.targets);
            }
            
          //  console.log(this.targets);
            if (this.targets && this.targets.length>0){
                this.targets.map(target=>{
                // let raise=false;
                    if (rolltype=='skill'){
                        this.attackTarget(target);
                        

                    } else if (rolltype=='damage'){
                        this.damageTarget(target);
                        

                        
                    }

                   
                   // this.addTargetInfo();
                })


                if (rolltype=='skill'){
                    this.html.append(this.targetShow).on('click','a.swadetools-rolldamage',(event)=>{
                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));
                        
                        this.targetFunction(targetid,raise);
            
                    }).ready(()=>{
                        this.scrollChat();/// force scroll
                    })
                } else if (rolltype=='damage'){
                    this.html.append(this.targetShow).one('click','a.swadetools-applydamage',(event)=>{
                        this.targetFunction();
                        let el=event.currentTarget;
                        $(el).attr('disabled','disabled');

                       
            
                    }).ready(()=>{
                        this.scrollChat();
                     })
                }

            }
        }
    }


   /*  addTargetInfo(){
        let rolltype=this.chat.data.flags["swade-tools"].rolltype;
        if (rolltype)
        
    } */

    attackTarget(target){
        let actorid=this.chat.data.flags["swade-tools"].useactor;
        let itemid=this.chat.data.flags["swade-tools"].itemroll;
        
        let addTarget='miss';
        let raise=0;
        let rollDmg=false;
        let item=game.actors.get(actorid).items.get(itemid);
        let skill=item.data.data.actions.skill;

        

       // let vulBonus=0;
       let vulIcon='';
        let char=new Char(target.actor);
        if (char.is('isVulnerable')){
           
            vulIcon=`<span class="swadetools-vulnerable-icon" title="${gb.trans('Vuln','SWADE')}"></span>`
        }


        let rof=this.chat.data.flags["swade-tools"].userof;


       
        let targetNumber=4;

       
        if (skill==gb.setting('fightingSkill')){
            targetNumber=gb.realInt(target.actor.data.data.stats.parry.value)+gb.realInt(target.actor.data.data.stats.parry.modifier)
        }


        let raisecount;
        if (item.type=='power' && rof<2 && gb.raiseCount(this.roll.total,targetNumber)<0) { /// failed power
            raisecount=-1 /// force failure
        } else {

            if (vulIcon){
                targetNumber-=2;
            }
    
            
            if (rof<2){
                raisecount=gb.raiseCount(this.roll.total,targetNumber);
            }
            
        }

        

     //   console.log(raisecount);
        if (rof<2 && raisecount>=0){
            rollDmg=true;
            addTarget='hit';
            if (raisecount>0){
                addTarget='raise';
                raise=1;
            }
        } 

        


        if (!this.titleshow){
            
            this.targetShow+=`<div class="swadetools-target-title">${gb.trans('TargetsTitleSkill')}. `

            if (rof>1){
                this.targetShow+=`${gb.trans('TipRofRoll')}. `;
                if (game.user.isGM){
                    this.targetShow+=`${gb.trans('TipTargetNumber')}.`;
                }

            }

            this.targetShow+=`</div>`
            this.titleshow=true;
        }

       
        if (rof>1){
           
            addTarget='rof';
        }

        this.targetShow+=`<div class="swadetools-targetwrap  swadetools-term-${addTarget}">`

       
        //data-swade-tools-action="rollTargetDmg:${this.actor._id},${this.itemid},${target.id},${raise}"

        if (rof>1){
            let showTargetNumber='';
            let showRaiseTargetNumber='';
            if (game.user.isGM){
                showTargetNumber=` (${targetNumber})`
                showRaiseTargetNumber=` (${targetNumber+4})`
            }
            this.targetShow+=`<i class="fas fa-bullseye"></i><div class="swadetools-targetname">${target.name}${vulIcon}: <a class="swadetools-rolldamage swadetools-rof-hit" data-swadetools-raise=0 data-swadetools-targetid="${target.id}">${gb.trans('Targethit')}${showTargetNumber}</a> <span class="swadetools-bar">|</span> <a class="swadetools-rolldamage swadetools-rof-raise" data-swadetools-raise=1 data-swadetools-targetid="${target.id}">${gb.trans('Targetraise')}${showRaiseTargetNumber}</a></div>`

        } else {
        if (rollDmg){
            let raiseInt=0;
            if (raise){
                raiseInt=1;
            }
            this.targetShow+=`<a class="swadetools-rolldamage" data-swadetools-raise=${raiseInt} data-swadetools-targetid="${target.id}" title="${gb.trans('RollDamage')}"><i class="fas fa-bullseye"></i>`
        } else {
            this.targetShow+=`<i class="fas fa-times-circle"></i>`;
        }

        this.targetShow+=`<div class="swadetools-targetname">${target.name}${vulIcon}: ${gb.trans('Target'+addTarget)}</div>`
        
        if (rollDmg){
            this.targetShow+=`</a>`
        }
    }
        this.targetShow+=`</div>`;


        this.targetFunction=(targetid,raiseDmg)=>{

          //  console.log(target);

            let actor=game.actors.get(actorid);
          //  let target=target;
           // let item=actor.items.get(argsArray[1]);

           if (actor.permission!=3){
            ui.notifications.error(gb.trans('PermissionActor'))
            return false;
           }
      
           
            let charRoll=new ItemRoll(actor,item);
            charRoll.useTarget(targetid);
            if (raiseDmg){
                charRoll.raiseDmg();
            }
            charRoll.rollBaseDamage();
          //  charRoll.combatRoll(argsArray[1]);
          //  charRoll.damageTarget(target);
           //   charRoll.addFlavor(item.name);
           /*    charRoll.addModifier(item.data.data.actions.dmgMod,gb.trans('ModItem'));
              
            charRoll.rollDamage(`${item.data.data.damage}`); */
            charRoll.display();
        }
        
    }

    damageTarget(target){

        let actorid=this.chat.data.flags["swade-tools"].useactor;
        let itemid=this.chat.data.flags["swade-tools"].itemroll;

        let toughness=gb.realInt(target.actor.data.data.stats.toughness.value);
        
        let item=game.actors.get(actorid).items.get(itemid);

        let applyDmg=false;

       // console.log(item);
     /// adds AP
        let apextra=0;
        if (item.data.data.ap){
            let armor=gb.realInt(target.actor.data.data.stats.toughness.armor) 
            apextra=gb.realInt(item.data.data.ap);
            if (apextra>armor){
                apextra=armor;
            }
        }
        let raisecount=gb.raiseCount(this.roll.total,toughness-apextra);
     //   console.log(toughness+armor);
     //   console.log(raisecount);
        let addTarget='none';

        if (raisecount>=0){
            applyDmg=true;
            addTarget='shaken';
            if (raisecount>0){

                addTarget='wounds';
            }
        } 

        let addTargetTxt=addTarget
        if (addTarget=='wounds'){
            let s='';
            if (raisecount>1){
                s='s';
            }

            addTargetTxt=`${raisecount} ${gb.trans('Targetwound'+s)} + ${gb.trans('Targetshaken')}`

        } else {
            addTargetTxt=gb.trans('Target'+addTarget);
        }


        if (!this.titleshow){
            this.targetShow+=`<div class="swadetools-target-title">${gb.trans('TargetsTitleDamage')}</div>`
            this.titleshow=true;
        }

        this.targetShow+=`<div class="swadetools-targetwrap swadetools-term-${addTarget}">`

       

        if (applyDmg){
            ///data-swade-tools-action-once=1 data-swade-tools-action="applyTargetDmg:${target.id},${raisecount}"
            this.targetShow+=`<a class="swadetools-applydamage" title="${gb.trans('ApplyDamage')}" ><i class="fas fa-tint"></i>`
        } else {
            this.targetShow+=`<i class="fas fa-times-circle"></i>`;
        }



        this.targetShow+=`<div class="swadetools-targetname">${target.name}: ${addTargetTxt}</div>`
        
        if (applyDmg){
            this.targetShow+=`</a>`;
        }
        
        this.targetShow+=`</div>`;

        this.targetFunction=()=>{
           // let target=canvas.tokens.get(argsArray[0]).actor
      //  let raisecount=argsArray[1];

            if (!game.user.isGM){
                ui.notifications.error(gb.trans('OnlyGM'))
                return false;  ///only gm can apply damage
            }


            let char=new Char(target.actor);

          //  console.log(target);
          //  console.log(raisecount);
        

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
        }
    }


    addBennyButton(){
        this.html.append('<div class="swadetools-relative"><button class="swadetools-bennyrerroll" title="'+gb.trans('RerollBtn')+'"></button></div>').on('click','button.swadetools-bennyrerroll',()=>{
            

            let actor=this.findActor();

            if (actor){
            let char=new Char(actor);
            
         //   console.log(actor);

            if (char.spendBenny()){

                this.rerollBasic();
               
                
            
            }
            }
        });
    }

    rerollItem(){

    }

    findActor(){

        let actor;
        if (this.chat.data.flags["swade-tools"]?.useactor){
            actor=game.actors.get(this.chat.data.flags["swade-tools"].useactor)
        } else {
            actor=game.actors.filter(el=>el.name==this.chat.alias)[0];
        }

         
        if (!actor || actor.length>1){
             ui.notifications.warn('NoActorFoundReroll');
             return false;
        } else {
            return actor;
        }
    }

    rerollBasic(){
        let roll=new Roll(this.chat._roll.formula).roll();

            

        let chatData = {
            user: game.user._id,
            speaker: {alias:this.chat.alias},
         //content: 'this is plus',
        flavor: this.chat.data.flavor
        };


       roll.toMessage(chatData).then((chat)=>{
        if (this.chat.data.flags["swade-tools"]?.itemroll){
            let flags=this.chat.data.flags["swade-tools"];

            chat.update({"flags.swade-tools":flags});
            /// repeat flags for roll
            /// TODO find a better way to repeat all the swade-tools flags
          //  chat.update({"flags.swade-tools.itemroll":flags.itemroll,"flags.swade-tools.useactor":flags.useactor,"flags.swade-tools.rolltype":flags.rolltype,"flags.swade-tools.userof":flags.userof,"flags.swade-tools.usetarget":flags.usetarget});

            /* chatlog=new ChatLog();
            chatlog.updateMessage(chat); */
        }
       });
    }

    isCritical(){
        let rolltype=this.chat.data.flags?.["swade-tools"]?.rolltype;

        if (rolltype!==undefined && rolltype!='damage'){

        let dices=this.roll.dice;
        let ones=dices.filter(el=>el.total==1);
        if (ones.length>1 && ones.length>(dices.length/2)){
            return true;
        } 

        }
            return false;
        
    }
}