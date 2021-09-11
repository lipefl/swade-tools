
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

       this.edgemod=0;
       this.vehicle=false;

      
      
       
    }

    usingVehicle(vehicle){
        this.vehicle=vehicle;
        this.addFlavor(' ('+vehicle.name+') ');
        this.flagUpdate['usevehicle']=vehicle.id;
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


    useDamageAction(actionid){
        this.addFlag('damageaction',actionid);
    }


    addEdgeModifier(edge,mod){
        if (mod>this.edgemod){ /// dont stack
            let char=new Char(this.actor);
            if (char.hasEdgeSetting(edge)){
                this.addModifier(mod,gb.settingKeyName(edge))
                this.edgemod=mod;
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
            if(gb.actorIsJoker(this.actor)){
                this.addModifier(2,gb.trans("Joker"));
            }
        }

       if (gb.actorIsConvicted(this.actor)){
           this.addModifier('1d6',gb.trans('Conv','SWADE'))
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
        
       
        
        this.addFlag('skill',skillName);
        

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

     //   console.log(item);

        this.flavorAdd.start=`<div class="swade chat-card swadetools-pseudocard"><header class="card-header flexrow">
        <img src="${item.img}" title="${item.name}" width="36" height="36">
        <h3 class="item-name"><a>${item.name}</a></h3>
      </header>
    
    <div class="card-content" style="display:none">
        ${item.data.data.description}
      </div></div>`;

        if (gb.systemSetting('ammoManagement') && countshots && item.type=="weapon"){
            this.manageshots=countshots;
        }
        
        if (countshots && item.type=="power" && gb.setting('countPP')){
            this.manageshots=countshots;
        }
        
    }


    getActualPP(){
       
        let actualPP=this.actor.data.data.powerPoints.value;
       
        let arcane=this.item.data.data.arcane
        

        if (arcane){
            actualPP=this.actor.data.data.powerPoints[arcane].value;
            
        }

        return actualPP;

    }
  

    powerCount(){

        if (gb.setting('countPP') && this.item && this.rolltype=='skill' && this.item.type=='power'){
            let ppspent=1;

            if (this.raiseCount()>=0){
                ppspent=this.shotsUsed;
            } else {
                this.flavorAdd.end+=`<div>${gb.trans('FailedPP')}</div>`
            }

            let actualPP=this.getActualPP();
            let updateKey='data.powerPoints.value';
            let arcane=this.item.data.data.arcane

            if (arcane){
               // actualPP=this.actor.data.data.powerPoints[arcane].value;
                updateKey='data.powerPoints.'+arcane+'.value'
            }

            

            let newpp=gb.realInt(actualPP)-ppspent;
           
            this.actor.update({[updateKey]:newpp})
           
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
            maxshots=gb.realInt(this.getActualPP())
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
                        if (this.item.data.data.autoReload===true && maxshots>=this.shotsUsed){

                            gb.rechargeWeapon(this.actor,this.item,this.shotsUsed)
                            
                            
                            
                            /* gb.rechargeWeapon(this.actor,this.item).then(()=>{
                                return this.countShots();
                            }) */
                            
                           
                        } else {
                            this.noShotsMsg(this.item);
                        }
                        
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
       // let char=new Char(this.actor);

        new Dialog({
            title: item.name,
            content: `<p>${item.name} ${gb.trans('NotEnoughShots')}</p>`,
            buttons: {
                cancel: {
                    label: `<i class="fas fa-times"></i> ${gb.trans('Cancel','SWADE')}`,
                    callback: ()=>{
                       
                    }
                },
                ok: {
                    label: `<i class="fas fa-redo"></i> ${gb.trans('Reload','SWADE')}`,
                    callback: ()=>{
                        gb.rechargeWeapon(this.actor,this.item);

                    }
                }

                
            }
        }).render(true);

      //  char.say(`${item.name} ${gb.trans('NotEnoughShots')} <button  class="swadetools-simplebutton" data-swade-tools-action="rechargeWeapon:${this.actor._id},${item._id}">${gb.trans('RechargeQuestion')}</button>`);
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

    wildAttack(){
        
        this.addFlag('wildattack',1);
        let char=new Char(this.actor);
        char.on('isVulnerable');
        ///remove combat flag -> force Vulnerable
        let combatant=gb.actorCombatant(this.actor)
        if (combatant){
            gb.setFlagCombatant(game.combat,combatant,gb.moduleName,'removeVulnerable',0);
        }
    }


    raiseDmg(){
        this.dmgraise=true;
    }


    changeStr(weaponDamage){
        if (weaponDamage.includes('@str')){        
            let regexStr = /[@]str/g;
                weaponDamage = weaponDamage.replace(regexStr, "1d" + this.actor.data.data.attributes.strength.die.sides);
                if (this.actor.data.data.attributes.strength.die.modifier){
                    this.addModifier(this.actor.data.data.attributes.strength.die.modifier,gb.trans('AttrStr','SWADE'));
                }
                
       }
        return weaponDamage;
               
    
    }

    rollDamage(damage,extraflavor=''){
        this.rolltype='damage';

        let raisetext=``;

        if (this.dmgraise){
            raisetext=`(+${gb.trans('Targetraise')})`;
        }
        
        this.flavor+=`<div>${gb.trans('Dmg','SWADE')}: ${damage} ${raisetext} ${extraflavor}</div>`;
        this.baseModifiers(true);
      //  console.log(this.dmgraise);
        this.buildDamageRoll(this.changeStr(damage),this.mod,this.dmgraise);
    }

    addFlavor(flavorText,atend=false){
        if (atend){
            this.flavorAdd.end+=flavorText;
        } else {
            this.flavorAdd.start+=flavorText;
        }
        
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

            if (this.actor.isToken===true){
               // console.log(this.actor);
              //  console.log(this.actor.parent._object.id);
              this.addFlag('usetoken',this.actor.parent._object.id);
            }
        }
    }

   display(flags=false){

       
        
        
       

        if (!this.dontDisplay){
      //  this.getTargets();
        if (this.reasons!=[]){
            this.flavor+=`<div>${this.reasons.join(', ')}</div>`
        }

        this.powerCount(); /// check for power failure/success and spend pp
        
      let  dataformodules='';
        if (this.rolltype=='skill'){
            let actorid=this.actor.id;
            if (this.vehicle){
                actorid=this.vehicle.id;
            }

            let datatoken='';
            if (this.actor.token){
                datatoken=' data-token-id="${this.actor.token.scene.id}.${this.actor.token.id}" ';
            }

           // console.log(this.actor.token.scene.id+'.'+this.actor.token.id);
            dataformodules=`<div style="display:none" data-item-id="${this.item.id}" data-actor-id="${actorid}" ${datatoken}></div>` //maestro etc
        }
        

        this.autoItemFlags();

        let updateFlags={}

        if (this.flagUpdate){
            updateFlags={'swade-tools':this.flagUpdate}

         //   console.log(updateFlags);
        }

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
         //content: 'this is plus',
         flags: updateFlags,
        flavor: this.flavorAdd.start+this.flavor+this.flavorAdd.end+dataformodules
        };

       // let total=this.roll.total;

     

       // this.roll.setFlag('swade-tools',)

       

       this.roll.toMessage(chatData)
       /* .then((chat)=>{ => already in chatData
       
        
        if (this.flagUpdate){ 
           


           // chat.update({'flags.swade-tools':this.flagUpdate});


           
        }
        
      

            
            
       }); */

       
        }
    }
}