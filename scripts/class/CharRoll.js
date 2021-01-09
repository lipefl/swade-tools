
import BasicRoll from './BasicRoll.js';
import * as gb from './../gb.js';
import Char from './Char.js';


export default class CharRoll extends BasicRoll{

    attrlang={
        agility: "AttrAgi",
        spirit:"AttrSpr",
        strength: "AttrStr",
        smarts:  "AttrSma",
        vigor: "AttrVig"
    }
    
    

    constructor(actor){
        super();
        this.actor=actor;
        this.flavor='';
        this.mod=0;
        this.reasons=[];
        this.flavorAdd={'start':'','end':''};
        this.dmgraise=false;
        this.incombat=false;
        this.targets=[];
        this.targetShow='';
        this.item=false;
        this.rof=1;
       // this.itemid=false;
        this.rolltype=false;
        this.shotsUsed=1;
        this.skillName=false;
       this.manageshots=false;
       this.dontDisplay=false;
       this.usetarget='';
       this.extrapp=0;
       this.flagUpdate={};
       
    }


   /*  combatRoll(itemId){
        this.incombat=true;
       
        this.itemid=itemId;
    } */

    addModifier(mod,reason){
     //   console.log(mod,reason);
        if (typeof mod == "string" && mod.includes('d')){

            mod=this.addDiceModifier(mod); // add the plus
            this.reasons.push(`${reason}: ${mod}`);
        } else {
        mod=gb.realInt(mod);
        if (mod!=0){
        this.mod+=mod;
        
        this.reasons.push(`${reason}: ${gb.stringMod(mod)}`);
        }
        }
    }

    
    baseModifiers(damage=false){

    if (!damage){
        if (this.actor.data.data.status.isDistracted){
            this.addModifier(-2,gb.trans("Distr","SWADE"));
        }

        let woundmod=this.actor.data.data.wounds.value-this.actor.data.data.wounds.ignored;
        if (woundmod>0){            
            this.addModifier(0-woundmod,gb.trans("Wounds","SWADE"));
        }

        let fatiguemod=this.actor.data.data.fatigue.value
        if (fatiguemod){
            this.addModifier(0-fatiguemod,gb.trans("Fatigue","SWADE"));
        }
    }

        if (game.combat){ /// search for joker
            if(gb.actorIsJoker(this.actor.id)){
                this.addModifier(2,gb.trans("Joker"));
            }
        }

       

       //return this.mod;
    }

 

    rollAtt(attribute){
        let dieType=this.actor.data.data.attributes[attribute].die.sides;
        
      //  let modDice=this.actor.data.data.attributes[attribute].die.modifier+modifier;
        let wildCard=this.actor.isWildcard;
        let wildDie=false;

        if (wildCard){
            wildDie=this.actor.data.data.attributes[attribute]["wild-die"].sides;
         //   console.log(wildDie);
        } 

        this.flavor+=`<div>${gb.trans(this.attrlang[attribute],"SWADE")}</div>`;

        
        this.baseModifiers();
        this.addModifier(this.actor.data.data.attributes[attribute].die.modifier,gb.trans('ModAttr'))
      //  console.log(this.mod);
    //    console.log(this.reasons);
        
       


        return this.buildRoll(dieType,wildDie,this.mod);
    }

    rollSkill(skillName,rof=1){
      //  console.log(skillName,rof)

        this.rof=rof;

        if (this.item && this.manageshots){
            this.countShots();
        }
       
        this.rolltype='skill';
        this.skillName=skillName;
        let item=this.actor.items.filter(el=>el.type=='skill' && el.name==skillName)[0];
        let wildCard=this.actor.isWildcard;
        let dieType;
        let wildDie=false;

        this.baseModifiers();

        if (item===undefined){
            skillName=`${gb.trans('Unskilled')} (${skillName})`;
            dieType=4;
            this.addModifier(-2,gb.trans('Unskilled'));

            if (wildCard){
                wildDie=6;
            } 

        } else {
            dieType=item.data.data.die.sides;

            if (wildCard){
                wildDie=item.data.data["wild-die"].sides;
            } 

            this.addModifier(item.data.data.die.modifier,gb.trans('ModSkill'))     
        }
        
       
        
        
        

        this.flavor+=`<div>${skillName}</div>`;

        
       
        

      //  console.log(this.mod);
    //    console.log(this.reasons);
        
       


        return this.buildRoll(dieType,wildDie,this.mod,rof);
       

    }

    /* getTargets(){
        if (this.incombat){
          //  console.log(this.incombat);
            this.targets=Array.from(game.user.targets);
          //  console.log(this.targets);
            if (this.targets.length>0){
                this.targets.map(target=>{
                   // let raise=false;
                    if (this.rolltype=='skill'){
                        this.attackTarget(target);
                    } else if (this.rolltype=='damage'){
                        this.damageTarget(target);
                    }
                })
            }
        }
    }

    isReroll(){
        this.manageshots=false;
    } */

    isItem(item,countshots=true){
        this.item=item;

        if (countshots && item.type=="weapon" && gb.setting('countShots')){
            this.manageshots=countshots;
        }
        
        if (countshots && item.type=="power" && gb.setting('countPP')){
            this.manageshots=countshots;
        }
        
    }

  

    powerCount(){

        if (this.item && this.item.type=='power'){
            let ppspent=1;

            if (this.raiseCount()>=0){
                ppspent=this.shotsUsed;
            } else {
                this.flavorAdd.end+=`<div>${gb.trans('FailedPP')}</div>`
            }

            

            let newpp=gb.realInt(this.actor.data.data.powerPoints.value)-ppspent;
            this.actor.update({'data.powerPoints.value':newpp})
        }
        
    }

    countShots(){
     //   console.log('counting shots');
        if (this.manageshots){
       //let item=this.actor.items.get(this.itemid);
     //  console.log(item);
        let maxshots;
        let currentShots;
        let update;
       // let entity;
        if (this.item.type=='weapon'){
            maxshots=gb.realInt(this.item.data.data.shots);
            currentShots=gb.realInt(this.item.data.data.currentShots)
         //   entity=this.item
            update='data.currentShots';
        } else if (this.item.type=='power'){
            maxshots=gb.realInt(this.actor.data.data.powerPoints.value)
            currentShots=maxshots;
            if (!maxshots){
                this.noPowerPointsMsg();
            }
           // entity=this.actor;
            update=false;
        }
       
        
        
        

            if (maxshots){ /// check again for weapon and count
                currentShots-=this.shotsUsed;

                if (currentShots<0){
                    if (this.item.type=='weapon'){
                        this.noShotsMsg(this.item);
                    } else if (this.item.type=='power'){
                        this.noPowerPointsMsg();
                    }
                   
                    return false;
                } else {
                    if (update){ /// only for shots
                        this.item.update({[update]:currentShots});
                    }
                   
                  //  console.log(entity);
                    return true;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }


    noShotsMsg(item){
        let char=new Char(this.actor);
        char.say(`${item.name} ${gb.trans('NotEnoughShots')} <button  class="swadetools-simplebutton" data-swade-tools-action="rechargeWeapon:${this.actor._id},${item._id}">${gb.trans('RechargeQuestion')}</button>`);
        this.dontDisplay=true;
      //  return false;
    }


    noPowerPointsMsg(){
        let char=new Char(this.actor);
        char.say(gb.trans('NotEnoughPP'));
        this.dontDisplay=true;
      //  return false;
    }

    useShots(shots){
        this.shotsUsed=gb.realInt(shots);
    }




    raiseDmg(){
        this.dmgraise=true;
    }


    changeStr(weaponDamage){
        if (weaponDamage.includes('@str')){        
            let regexStr = /[@]str/g;
                weaponDamage = weaponDamage.replace(regexStr, "1d" + this.actor.data.data.attributes.strength.die.sides);
    
                
       }
        return weaponDamage;
               
    
    }

    rollDamage(damage,extraflavor=''){
        this.rolltype='damage';
        
        this.flavor+=`<div>${gb.trans('Dmg','SWADE')}: ${damage}${extraflavor}</div>`;
        this.baseModifiers(true);
      //  console.log(this.dmgraise);
        this.buildDamageRoll(this.changeStr(damage),this.mod,this.dmgraise);
    }

    addFlavor(flavorText){
        this.flavorAdd.start+=flavorText;
    }

  
    addFlag(key,value){
        this.flagUpdate[key]=value;
    }

    autoItemFlags(){
        if (this.item){
            this.addFlag('itemroll',this.item._id);
            this.addFlag('useactor',this.actor.id);
            this.addFlag('rolltype',this.rolltype);
            this.addFlag('userof',this.rof);
            this.addFlag('usetarget',this.usetarget);
        }
    }

   display(flags=false){

       
        
        
       

        if (!this.dontDisplay){
      //  this.getTargets();
        if (this.reasons!=[]){
            this.flavor+=`<div>${this.reasons.join(', ')}</div>`
        }

        this.powerCount(); /// check for power failure/success and spend pp
        

        let chatData = {
            user: game.user._id,
            speaker: {alias:this.actor.name},
         //content: 'this is plus',
        flavor: this.flavorAdd.start+this.flavor+this.flavorAdd.end
        };

       // let total=this.roll.total;

      this.autoItemFlags();

       // this.roll.setFlag('swade-tools',)

       this.roll.toMessage(chatData).then((chat)=>{
       
        
        if (this.flagUpdate){ /// auto add item flags
           // console.log(this.item);
          //  console.log(this.rof);

           /*  let updateFlags={
                itemroll: this.item._id,
                useactor: this.actor.id,
                rolltype: this.rolltype,
                userof: this.rof,
                usetarget: this.usetarget
            } */

            chat.update({'flags.swade-tools':this.flagUpdate});

            
          //  chat.update({"flags.swade-tools.itemroll":this.item._id,"flags.swade-tools.useactor":this.actor.id,"flags.swade-tools.rolltype":this.rolltype,"flags.swade-tools.userof":this.rof,"flags.swade-tools.usetarget":this.usetarget});
        }
        

            //    console.log(chat);
               /*  Hooks.once('renderChatMessage',(chatItem,html)=>{
                    html.append(this.targetShow);
                }) */
             //   $('ol#chat-log li[data-message-id="'+chat.id+'"]').append(this.targetShow);
               // chat.html.append(this.targetShow);
              //  gb.say(this.targetShow,this.actor.name,gb.trans('TargetsFlavor')+total);
               
            
       });

       
        }
    }
}