import * as gb from './../gb.js';
import Char from './Char.js';
import CharRoll from './CharRoll.js';
import ItemRoll from './ItemRoll.js';

export default class RollControl {
    
    constructor(chat,html,userId){

        this.chat=chat;
        this.html=html;
        this.roll=chat._roll;
        this.targetShow='';
        this.targetFunction;
        this.soakFunction;
        this.titleshow=false;

        this.user=game.users.get(userId);
        this.userid=userId;

        this.rolltype=this.chat.data.flags?.["swade-tools"]?.rolltype;

        //this.actor;
        this.istoken=false;

     //   console.log(this.chat.data.flags);
      //  console.log(userId);
    }


    doActions(){
        if (!this.isCritical()){
            this.addBennyButton();
            this.findTargets();
        } else {

            if (gb.settingKeyName('Dumb Luck')){
                this.addBennyButton();
            }
            this.html.append('<div class="swadetools-criticalfailure">'+gb.trans('CriticalFailure')+'</div>').ready(()=>{
                this.scrollChat();
            })
        }

       
            this.statusRolls();
        
        
    }

    statusRolls(){
        
        
        if (this.rolltype=='unshaken'){
            this.unshaken();
        } else if (this.rolltype=='unstunned'){
            this.unstunned();
        }
    }

    unstunned(){

        let actor=this.getActor(true);

        /* let actorid=this.chat.data.flags["swade-tools"].useactor;
        let actor=game.actors.get(actorid); */


        
        let raisecount=gb.raiseCount(this.roll.total);

        let content=`<div class="swadetools-chatadd-status">`;

        let result='failure';

        if (raisecount==0){
            
         //   console.log('unstun');

           result='success';
          
          


           content+=`<div>${actor.name} ${gb.trans("RemStunnedSuc")}</div>`;
            

                     

        } else if (raisecount>0){
           
            result='raise';

            content+=`<div>${actor.name} ${gb.trans("RemStunnedRaise")}</div>`;
          //  char.say(gb.trans("RemStunnedRaise"))
        } else {
            /// failure
            content+=`<div>${actor.name} ${gb.trans("StillStunned")}</div>`;
           // char.say(gb.trans('StillStunned'));
        }

        content+=`</div>`;

        let char=new Char(actor,this.istoken);

        

        this.html.append(content).ready(()=>{
            this.scrollChat();
            
            if (gb.mainGM()){
            if (result=='success'){
                char.off('isStunned')
                setTimeout(()=>{ /// silver tape to avoid bug
                    char.updateData({'status.isDistracted':true,'status.isVulnerable':true})
                   // actor.update({'data.status.isDistracted':true,'data.status.isVulnerable':true})
                },500)   
            } else if (result=='raise'){
                char.off('isStunned');
                char.updateData({'status.isDistracted':false,'status.isVulnerable':false})/// just to make sure is disabled
              //  actor.update({'data.status.isDistracted':false,'data.status.isVulnerable':false}) /// just to make sure is disabled
            }
            }
        });
    }


    unshaken(){
      //  let actorid=this.chat.data.flags["swade-tools"].useactor;
        let actor=this.getActor(true);
       // console.log(actor);
       // console.log(this.istoken);

        let char=new Char(actor,this.istoken);

        let raisecount=gb.raiseCount(this.roll.total);
        let content=`<div class="swadetools-chatadd-status">`;
        let shakenremove=false;

            if (raisecount>=0){
               shakenremove=true;
               
                content+=`<div>${actor.name} ${gb.trans("RemShaken")}</div>`;
               
            } else {
                if (char.bennyCount()){
                    
                    content+=`<div><button class="swadetools-simplebutton swadetools-unshake-button">${gb.trans('UnshakenBennyButton')}</button></div>`
               //     char.say()
    
                } else {

                    content+=`<div>${gb.trans('NoBennies')}, ${gb.trans('StillShaken')}</div>`
                   // char.say()
                } 
            }

            content+=`</div>`;

            this.html.append(content).on('click','button.swadetools-unshake-button',()=>{
             //   let actor=game.actors.get(argsArray[0]);
       
               // let char=new Char(actor);
        
                if (char.is('isShaken')){
                if (char.spendBenny()){
                    char.off('isShaken');
                    char.say(gb.trans("RemShaken"));
                }} else {
                    ui.notifications.warn(gb.trans('NotShaken'));
                }
            }).ready(()=>{
                this.scrollChat();


                if (shakenremove && gb.mainGM()){
                    char.off('isShaken');
                }
            })
    }

    scrollChat(){
        new ChatLog().scrollBottom() /// force scroll
    }

    findTargets(){
        if (this.chat.data.flags["swade-tools"]?.itemroll || this.rolltype=='soak'){ /// show only for items (weapons, powers) and soak

            let rolltype=this.rolltype;

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
                        

                        
                    } else if (rolltype=='soak'){

                        let prevWounds=this.chat.data.flags["swade-tools"].wounds;
                        this.damageTarget(target,this.soak(prevWounds));
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
                } else if (rolltype=='damage' || rolltype=='soak'){
                    this.html.append(this.targetShow).on('click','a.swadetools-applydamage',(event)=>{
                        
                        let el=event.currentTarget;
                        $(el).attr('disabled','disabled');
                        this.html.off('click','a.swadetools-applydamage');
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));
                        this.targetFunction(targetid,raise);
                       

                       
            
                    }).on('click','a.swadetools-soakdamage',(event)=>{
                        let el=event.currentTarget;
                        $(el).attr('disabled','disabled');
                        this.html.off('click','a.swadetools-soakdamage');
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));
                        this.soakFunction(targetid,raise);
                    }).ready(()=>{
                        this.scrollChat();
                     })
                }

            }
        }
    }


    soak(wounds){

        let raises=gb.raiseCount(this.roll.total);
                if (raises>=0){
                    wounds=wounds-(raises+1);

                }

                return wounds;

              //  this.damageTarget(target,wounds);
    }

   /*  addTargetInfo(){
        let rolltype=this.chat.data.flags["swade-tools"].rolltype;
        if (rolltype)
        
    } */

    getItemOwner(){
        if (this.chat.data.flags["swade-tools"]?.usevehicle){
            return game.actors.get(this.chat.data.flags["swade-tools"].usevehicle);
        } else {
            return this.getActor();
        }
    }
    

    getActor(orToken=false){
        
            if (this.chat.data.flags["swade-tools"]?.usetoken){
                let tokenid=this.chat.data.flags["swade-tools"].usetoken

                this.istoken=true;
                if (orToken){
                    
                    return canvas.tokens.get(tokenid)
                } else {
                    return canvas.tokens.get(tokenid).actor
                }

                
                
            } else {
                let actorid=this.chat.data.flags["swade-tools"].useactor
                return game.actors.get(actorid);
            }
        

       
    }

    attackTarget(target){
        
        let itemid=this.chat.data.flags["swade-tools"].itemroll;
        let item=this.getItemOwner().items.get(itemid);

        /* if (this.chat.data.flags["swade-tools"]?.usetoken){
            let tokenid=this.chat.data.flags["swade-tools"].usetoken
            item=canvas.tokens.get(tokenid).actor.items.filter(el=>el.id==itemid)[0];
        } else {
            let actorid=this.chat.data.flags["swade-tools"].useactor
            item=game.actors.get(actorid).items.get(itemid);
        } */

     //   let actorid=this.chat.data.flags["swade-tools"].useactor;
        
        
        let addTarget='miss';
        let raise=0;
        let rollDmg=false;
       // let item=game.actors.get(actorid).items.get(itemid);

       //  console.log(game.actors.get(actorid));
        /*
        if (!item) { /// check for synthetic actor
             item=game.actors.get(actorid).actorData.items.filter(el=>el.id==itemid)[0];
        } */


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
            this.targetShow+=`</a>` /// TODO add soak <a></a>
        }
    }
        this.targetShow+=`</div>`;


        this.targetFunction=(targetid,raiseDmg)=>{

          //  console.log(target);

         //   let actor=game.actors.get(actorid);
          //  let target=target;
           // let item=actor.items.get(argsArray[1]);



           if (this.getActor().permission!=3 || this.getItemOwner().permission!=3){
            ui.notifications.error(gb.trans('PermissionActor'))
            return false;
           }
      
           
            let charRoll=new ItemRoll(this.getItemOwner(),item);

            if (this.chat.data.flags["swade-tools"]?.usevehicle){
                charRoll.usingVehicle(this.getItemOwner());
            }


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

   

    damageTarget(target,newWounds=null){
        let applyDmg=false;
        let raisecount;
        let soakClass='';

        if (newWounds===null){
       // let actorid=this.chat.data.flags["swade-tools"].useactor;
        let itemid=this.chat.data.flags["swade-tools"].itemroll;

        let toughness=gb.realInt(target.actor.data.data.stats.toughness.value);

      //  console.log(toughness);
        
        let item=this.getItemOwner().items.get(itemid);

       

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
         raisecount=gb.raiseCount(this.roll.total,toughness-apextra);
        } else {
            raisecount=newWounds; 

            if (raisecount==0){ //0 wounds
                raisecount=-1  ///not even shaken
            } 
        }
     //   console.log(toughness+armor);
     //   console.log(raisecount);
        let addTarget='none';

        if (raisecount>=0){
            applyDmg=true;
            addTarget='shaken';
            if (raisecount>0){

                if(gb.settingKeyName('Wound Cap') && raisecount>4){
                    raisecount=4;
                }
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

        if (applyDmg && addTarget=='wounds' && newWounds===null){
            soakClass=' swadetools-damage-with-soak';
        }


        if (!this.titleshow){
            this.targetShow+=`<div class="swadetools-target-title">${gb.trans('TargetsTitleDamage')}</div>`
            this.titleshow=true;
        }

        this.targetShow+=`<div class="swadetools-targetwrap swadetools-term-${addTarget}${soakClass}">`

       

        if (applyDmg){
            ///data-swade-tools-action-once=1 data-swade-tools-action="applyTargetDmg:${target.id},${raisecount}"
            this.targetShow+=`<a class="swadetools-applydamage" title="${gb.trans('ApplyDamage')}" data-swadetools-raise=${raisecount} data-swadetools-targetid="${target.id}"><i class="fas fa-tint"></i>`
        } else {
            this.targetShow+=`<i class="fas fa-times-circle"></i>`;
        }



        this.targetShow+=`<div class="swadetools-targetname">${target.name}: ${addTargetTxt}</div>`
        
        if (applyDmg){
            this.targetShow+=`</a>`
            if (soakClass){ 
                this.targetShow+=`<a class="swadetools-soakdamage" data-swadetools-raise=${raisecount} data-swadetools-targetid="${target.id}" title="${gb.trans('SoakDmg')}"><i class="fas fa-tint-slash"></i></a>`;
            }
        }
        
        this.targetShow+=`</div>`;


        this.soakFunction=(targetid)=>{
            let target=canvas.tokens.get(targetid);
            let charRoll=new CharRoll(target.actor);
            let char=new Char(target.actor);
          //  let wounds=raisecount;

            if (char.spendBenny()){
                charRoll.addEdgeModifier('Iron Jaw',2)
               
                

                if(gb.settingKeyName('Unarmored Hero') && gb.realInt(target.actor.data.data.stats.toughness.armor)==0){
                    charRoll.addModifier(2,gb.trans(gb.settingKey('Unarmored Hero')));
                }
               
                
                charRoll.addFlavor(gb.trans('DoSoak'))
                charRoll.addFlag('rolltype','soak');
                charRoll.addFlag('usetarget',target.id);
                charRoll.addFlag('wounds',raisecount);
                charRoll.rollAtt('vigor');
                charRoll.display();
                
            }
           
           
        }

        this.targetFunction=(targetid,raisecount)=>{
            let target=canvas.tokens.get(targetid);
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
                    if (!char.hasEdgeSetting('Hardy')){
                        char.applyWounds(1);
                    } else {
                        ui.notifications.info(`${target.actor.name} ${gb.trans('HardyWarn')}`)
                    }
                    
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

        if (this.rolltype!==undefined && this.rolltype!='unshaken'){ /// dont show benny button for unshaken roll
        this.html.append('<div class="swadetools-relative"><button class="swadetools-bennyrerroll" title="'+gb.trans('RerollBtn')+'"></button></div>').on('click','button.swadetools-bennyrerroll',()=>{
            

            let actor=this.findActor();

            if (actor){
            let char=new Char(actor);
            
         //   console.log(actor);

            if (char.spendBenny()){

               


                this.rerollBasic(actor);
               
                
            
            }
            }
        });
    }
    }

   

    findActor(){

        let actor;
        if (this.chat.data.flags["swade-tools"]?.useactor){
            actor=game.actors.get(this.chat.data.flags["swade-tools"].useactor)
        } else {
            actor=game.actors.filter(el=>el.name==this.chat.alias)[0];
        }

         
        if (!actor || actor.length>1){
             ui.notifications.warn(gb.trans('NoActorFoundReroll'));
             return false;
        } else {
            return actor;
        }
    }

    rerollBasic(actor){

        let char=new Char(actor);
        let mod=0;
        let reason='';
        let edgebonus=false;
        let oldroll=this.chat._roll


      //  console.log(this.chat.data.flags);

        if (this.rolltype=='damage'){

            if (this.chat.data.flags['swade-tools']?.edgebonus!="nomercy" && char.hasEdgeSetting('No Mercy')){
                mod=2
                reason=gb.settingKeyName('No Mercy');
                edgebonus='nomercy'
            }

        } else {
            if (this.chat.data.flags['swade-tools']?.edgebonus!="elan" && char.hasEdgeSetting('Elan')){
                mod=2
                reason=gb.settingKeyName('Elan');    
                edgebonus='elan'
            }
        }

       

       let modStr='';
       let extraflavor='';
       if (mod){
           modStr=gb.stringMod(mod);
            extraflavor=`<div>${reason}: ${modStr}</div>`;
       }

        let roll=new Roll(oldroll.formula+modStr).roll();

        if (oldroll.terms[0]?.dice!==undefined){

            for (let i=0;i<oldroll.terms[0].dice.length;i++){
                roll.terms[0].dice[i].options=oldroll.terms[0].dice[i].options
            }

        } else {

            /// 1 die
            roll.terms[0].options=oldroll.terms[0].options
        }

         ////
   //  console.log(this.chat._roll.terms[0].dice); /// if undefined its 1 die, use this.chat._roll.terms[0].options
     /// else
 // console.log(this.chat._roll.terms[0].dice); /// defined, use this.chat._roll.terms[0].dice[i].options

        /// also copy roll.options addDiceFlavor TODO
            

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
         //content: 'this is plus',
        flavor: this.chat.data.flavor+extraflavor
        };

        

       roll.toMessage(chatData).then((chat)=>{
        if (this.chat.data.flags["swade-tools"]){
            let flags=this.chat.data.flags["swade-tools"];

           
            
            chat.update({"flags.swade-tools":flags,"flags.swade-tools.edgebonus":edgebonus});
            /// repeat flags for roll
           
        }
       });
    }

    isCritical(){
       // let rolltype=this.chat.data.flags?.["swade-tools"]?.rolltype;

        if (this.rolltype!='damage' && this.roll){

        let dices=this.roll.dice;
        let ones=dices.filter(el=>el.total==1);
        if (ones.length>1 && ones.length>(dices.length/2)){
            return true;
        } 

        }
            return false;
        
    }
}