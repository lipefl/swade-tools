
import BasicRoll from './BasicRoll.js';
import * as gb from './../gb.js';
import Char from './Char.js';


export default class CharRoll extends BasicRoll{

    //attrlang=gb.attrlang;
    
    

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
       this.abilityMod=0;
       this.vehicle=false;
       this.action='';

       this.canCast=true;

      
      
       
    }

    usingVehicle(vehicle){
        this.vehicle=vehicle;
       // gb.log(vehicle,'vehicle');
        this.addFlavor(' ('+vehicle.name+') ');
        this.flagUpdate['usevehicle']=vehicle.id;
        if (vehicle.isToken==true){
            this.flagUpdate['usevehicletoken']=vehicle.parent.id
        }
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
        mod=gb.realInt(eval(mod));
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

    addAbilityModifier(ability,mod){
        if (mod>this.abilityMod){
            let char=new Char(this.actor);
            if (char.hasAbilitySetting(ability)){
                this.addModifier(mod,gb.settingKeyName(ability))
                this.abilityMod=mod;
            }
        }
    }

    
    baseModifiers(damage=false){

    if (!damage){
        if (this.actor.system.status.isDistracted){
            this.addModifier(-2,gb.trans("Distr","SWADE"));
        }

       
        let woundmod=this.actor.system.wounds.value

        if (woundmod>3){
            woundmod=3;
        }
        
        woundmod=woundmod-this.actor.system.wounds.ignored;
        
       

        
        let fatiguemod=this.actor.system.fatigue.value;
        fatiguemod=fatiguemod-this.actor.system.fatigue.ignored;       
        

        

        if (this.actor.system.woundsOrFatigue.ignored){
            
            let reduceFatigue=this.actor.system.woundsOrFatigue.ignored;
            if (woundmod>0){
                woundmod=woundmod-this.actor.system.woundsOrFatigue.ignored
                console.log(woundmod);
                if (woundmod<=0){
                    reduceFatigue=Math.abs(woundmod);
                }
            }

            if (fatiguemod>0){
                fatiguemod=fatiguemod-Math.min(this.actor.system.woundsOrFatigue.ignored,reduceFatigue)
            }

        }

        if (woundmod>0){            
            this.addModifier(0-woundmod,gb.trans("Wounds","SWADE"));
        }

        if (fatiguemod>0){
            this.addModifier(0-fatiguemod,gb.trans("Fatigue","SWADE"));
        }

        if (this.flagUpdate['usecalled']){
        if (this.flagUpdate['usecalled']=='Arms' || this.flagUpdate['usecalled']=='Legs'){
            this.addModifier(-2,gb.trans('CalledShot')+ ' ('+gb.trans(this.flagUpdate['usecalled'],'SWADE')+')');
        }

        if (this.flagUpdate['usecalled']=='Head'){
            this.addModifier(-4,gb.trans('CalledShot')+ ' ('+gb.trans(this.flagUpdate['usecalled'],'SWADE')+')');
        }

        }

        
        
    } else {

        if (this.flagUpdate['usecalled']){
        /// damage to the head
        
        if (this.flagUpdate?.['usecalled']=='Head'){
            this.addModifier(4,gb.trans('CalledShot')+ ' ('+gb.trans(this.flagUpdate['usecalled'],'SWADE')+')');
        } else if (this.flagUpdate?.['usecalled']!='Torso') {
            this.addFlavor('<div>'+gb.trans('CalledShot')+ ' ('+gb.trans(this.flagUpdate['usecalled'],'SWADE')+')</div>',true);
        }

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

 
    async rollRun(){
        this.flavor+=`<div>${gb.trans('Running','SWADE')}</div>`;

        let ferinfo=''
         if (gb.systemSetting('enableWoundPace')){
            let woundMod=0-gb.realInt(this.actor.system.wounds.value);
            if (woundMod<-3){
                woundMod=-3
            }
            this.flavor+=`<div>${gb.trans('Wounds','SWADE')}: ${woundMod}</div>`;
        } 
        
        /// wounds
       // this.addModifier(-2,gb.trans('Wounds','SWADE'))
        this.addModifier(this.actor.system.stats.speed.adjusted,gb.trans('Pace','SWADE'))
     //   this.baseModifiers();
     this.isRunDie();
       return await this.buildRoll(this.actor.system.stats.speed.runningDie,false,this.mod);
    }

    async rollAtt(attribute,rof=1){
        let dieType=this.actor.system.attributes[attribute].die.sides;
        
      //  let modDice=this.actor.data.data.attributes[attribute].die.modifier+modifier;
        let wildCard=this.actor.isWildcard;
        let wildDie=false;

        if (wildCard){
            wildDie=this.actor.system.attributes[attribute]["wild-die"].sides;
         //   console.log(wildDie);
        } 

        this.flavor+=`<div>${gb.trans(gb.attrlang[attribute],"SWADE")}</div>`;

        
        this.baseModifiers();
       // this.addModifier(this.actor.system.attributes[attribute].die.modifier,gb.trans('ModAttr'))
       this.addModifier(gb.attModifier(this.actor,attribute),gb.trans('ModAttr'))
      //  console.log(this.mod);
    //    console.log(this.reasons);
        
        if (attribute=='agility'){
            
            this.agilityMods();
        }



        this.addFlag('rolltype','attribute');

        return await this.buildRoll(dieType,wildDie,this.mod,rof);
    }


    agilityMods(){
        if (this.actor.isEncumbered){
            this.addModifier(-2,gb.trans('CarryWeight','SWADE'))
        }

        /// check equipped armor
        let armorMod=gb.penalArmorMinStr(this.actor)
        if (armorMod){
            this.addModifier(armorMod,`${gb.trans('UnderMinStr')} (${gb.trans('Armor','SWADE')})`)
        }
    }


    async rollArcaneDevice(){

        this.manageshots=true;
        this.countShots();
        this.flavor+=`<div>${gb.trans('ActivateArcaneDevice','SWADE')}</div>`;
        this.rolltype='skill';
        this.addFlag('arcanedevice',1);
        this.baseModifiers();

        this.addModifier(this.item.system.arcaneSkillDie.modifier,gb.trans('ModSkill'))  
        
        let dieType=this.item.system.arcaneSkillDie.sides // change in the future for Skill wild die

        let wildDie=false;
        if (this.actor.isWildcard){
            wildDie=6; // change in the future for Skill wild die
        }

       

        return await this.buildRoll(dieType,wildDie,this.mod,1);
    }
    

   async rollSkill(skillName,rof=1){
      //  console.log(skillName,rof)

        this.rof=rof;
       

        if (this.item && this.manageshots){
           
            this.countShots();
        }

        
        if (this.item && this.item.system?.innate){ ///innate power -> no roll

            if (this.canCast){
                this.powerCount();
                gb.say(`${this.getItemCard(this.item)}${gb.trans('InnatePower')}`,this.actor.name);
            }
            this.dontDisplay=true;            
            return 
        }

        if (this.item && this.item.type=='weapon' && skillName==gb.setting('shootingSkill')){
            let minstr=gb.getMinStr(this.item)
            let actorstr=gb.getStrForMinStr(this.actor)
            //console.log(minstr);
            if (minstr>actorstr){
                let penal=0-((minstr-actorstr)/2)
                this.addModifier(penal,gb.trans('UnderMinStr'));
            }
        }
      
        this.rolltype='skill';
        this.skillName=skillName;
       
        let item=this.actor.items.filter(el=>el.type=='skill' && el.name==skillName)[0];
        let wildCard=this.actor.isWildcard;
        let dieType;
        let wildDie=false;

        
        this.baseModifiers();
        
        this.addFlag('skill',skillName);
        this.addFlag('rolltype','skill');

        if (item===undefined){
            skillName=`${gb.trans('Unskilled')} (${skillName})`;
            dieType=4;
            this.addModifier(-2,gb.trans('Unskilled'));

            if (wildCard){
                wildDie=6;
            } 

        } else {
            dieType=item.system.die.sides;

            if (wildCard){
                wildDie=item.system["wild-die"].sides;
            } 

            this.addModifier(gb.skillModifier(item),gb.trans('ModSkill'))     

            if (item.system.attribute=='agility'){
                this.agilityMods();
            }
        }
        
        
        
        
        
        
      

        this.flavor+=`<div>${skillName}</div>`;

        
        
        

      //  console.log(this.mod);
    //    console.log(this.reasons);
        
       


        return await this.buildRoll(dieType,wildDie,this.mod,rof);
       

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

    getItemCard(item){

        const description=TextEditor.enrichHTML(item.system.description,{async:false}) /// async false will be removed

        return `<div class="swade chat-card swadetools-pseudocard"><header class="card-header flexrow">
        <img src="${item.img}" title="${item.name}" width="36" height="36">
        <h3 class="item-name"><a>${item.name}</a></h3>
      </header>
    
    <div class="card-content" style="display:none">
        ${description}
      </div></div>`;

    }

    isItem(item,countshots=true){
        this.item=item;

     //   console.log(item);
     const description=TextEditor.enrichHTML(item.system.description,{async:false}) /// async false will be removed

     this.flavorAdd.start=this.getItemCard(item);

     /*    this.flavorAdd.start=`<div class="swade chat-card swadetools-pseudocard"><header class="card-header flexrow">
        <img src="${item.img}" title="${item.name}" width="36" height="36">
        <h3 class="item-name"><a>${item.name}</a></h3>
      </header>
    
    <div class="card-content" style="display:none">
        ${description}
      </div></div>`; */

        if (gb.systemSetting('ammoManagement') && countshots && item.type=="weapon"){
            this.manageshots=countshots;
        }
        
        if (countshots && ((item.type=="power" && !gb.systemSetting('noPowerPoints')) || item.isArcaneDevice)){
            this.manageshots=countshots;
        }
        
    }


   /*  getActualPP(){
       
       

        return gb.getActualPP(this.item);

    } */
  

    powerCount(){

       // console.log(this.rolltype);

        if (this.item && 
            (this.item.system?.innate || this.rolltype=='skill') && 
            (this.item.isArcaneDevice || (!gb.systemSetting('noPowerPoints') &&  this.item.type=='power'))){
            let ppspent=1;

           // let arcane=this.item.system.arcane

            if (this.item.system?.innate || this.raiseCount()>=0){
                ppspent=this.shotsUsed;
            } else {
                this.flavorAdd.end+=`<div>${gb.trans('FailedPP')}</div>`
                this.addFlag('arcanefail',{pp:this.shotsUsed-1,arcaneItem:this.item._id});
              //  this.addFlag('failedarcane',arcane);
            }

            let char=new Char(this.actor);
            char.spendPP(ppspent,this.item._id)

            /* let actualPP=this.getActualPP();
           // let updateKey='data.powerPoints.general.value';
           

            if (!arcane){
               // actualPP=this.actor.data.data.powerPoints[arcane].value;
                arcane='general';
            }

            let updateKey='data.powerPoints.'+arcane+'.value'

            let newpp=gb.realInt(actualPP)-ppspent;
           
            this.actor.update({[updateKey]:newpp}) */
           
        }
        
    }

    async countShots(){
        
        if (this.manageshots){
       //let item=this.actor.items.get(this.itemid);
     
        let maxshots;
        let currentShots;
        let update;
       // let entity;
       if (this.item.isArcaneDevice){

        maxshots=gb.realInt(this.item.system.powerPoints.value)
        currentShots=maxshots;

        
        if (!maxshots){
            this.noPowerPointsMsg(this.item);
        }
    }else 
        if (this.item.type=='weapon'){


            maxshots=gb.realInt(this.item.system.shots);

            if (this.item.system.reloadType=="none" && maxshots){  /// autoReload

                maxshots=false;

                let reload=await gb.noneReloadType(this.actor,this.item,this.shotsUsed);
                //console.log(reload);

               if (!reload){

                    this.dontDisplay=true;
               }

            } else {

               
            currentShots=gb.realInt(this.item.system.currentShots)
         //   entity=this.item
            update='system.currentShots';
            }
            
        } else if (this.item.type=='power'){
            let char=new Char(this.actor);
            maxshots=gb.realInt(char.getActualPP(this.item.system.arcane))
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
                        /* if (this.item.system.reloadType=="none"){  /// autoReload

                           // decrease ammo from inventory
                           
                           if (!gb.noneReloadType(this.actor,this.item,this.shotsUsed)){

                            this.noShotsMsg(this.item);
                        }
                           

                           // gb.rechargeWeapon(this.actor,this.item,this.shotsUsed) /// removed SWADE system 2.3
                            
                            //this.item.reload();
                            
                            
                           
                        } else { */
                            this.noShotsMsg(this.item);
                       /*  } */
                        
                    } else if (this.item.type=='power' || this.item.isArcaneDevice){
                        this.noPowerPointsMsg(this.item);
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

       let buttons = {
        cancel: {
            label: `<i class="fas fa-times"></i> ${gb.trans('Cancel','SWADE')}`,
            callback: ()=>{
               
            }
        },
        ok: {
            label: `<i class="fas fa-redo"></i> ${gb.trans('Reload','SWADE')}`,
            callback: ()=>{
              //  gb.rechargeWeapon(this.actor,this.item); /// removed swade system 2.3

              this.item.reload();

            }
        }

        
    }

    /* SWADE SYSTEM now handles reload
     if (gb.setting('reloadX')){ 
        buttons.x={
            label: `<i class="fas fa-spinner"></i> ${gb.trans('Reload','SWADE')} X`,
            callback: ()=>{
                gb.rechargeWeaponXDialog(this.actor,this.item);

            }
        }
    } */

        new Dialog({
            title: item.name,
            content: `<p>${item.name} ${gb.trans('NotEnoughShots')}</p>`,
            buttons: buttons
        }).render(true);

      //  char.say(`${item.name} ${gb.trans('NotEnoughShots')} <button  class="swadetools-simplebutton" data-swade-tools-action="rechargeWeapon:${this.actor._id},${item._id}">${gb.trans('RechargeQuestion')}</button>`);
       this.dontDisplay=true;
      //  return false;
    }


    noPowerPointsMsg(item=false){

        let sayBefore='';
        if (item && item.isArcaneDevice){
            sayBefore=`${item.name} `
        }
        let char=new Char(this.actor);
        char.say(sayBefore+gb.trans('NotEnoughPP'));
        this.dontDisplay=true;
        this.canCast=false;
      //  return false;
    }

    

    useShots(shots){
        this.shotsUsed=gb.realInt(shots);
        
    }

    async wildAttack(){
        
        this.addFlag('wildattack',1);
        let char=new Char(this.actor);
        char.on('isVulnerable');
        ///remove combat flag -> force Vulnerable
      //  console.log(this.actor);
        let combatant=gb.actorCombatant(this.actor)
      //  console.log(this.actor,combatant.id,'wild');
        if (combatant){
            await gb.setFlagCombatant(game.combat,combatant,gb.moduleName,'removeVulnerable',0);
        }
    }


    raiseDmg(){
        this.dmgraise=true;
    }


    changeStr(weaponDamage){


        if (this.item.type=='weapon' && weaponDamage.includes(`@str`)){
           // let minStr=gb.getMinStr(this.item)
           // gb.log(minStr,'minstr');
            let actorStr=gb.getStrForMinStr(this.actor);
           // gb.log(actorStr,'actorstr');
            if (actorStr<gb.getMinStr(this.item)){
                weaponDamage=weaponDamage.replaceAll(/d\d+/g,`d${actorStr}`)
               // console.log(weaponDamage);
            }
        }


        gb.attributesShort.map(data=>{

            if (weaponDamage.includes(`@${data.short}`)){        
               // let regexStr = /[@]str/g;
                    weaponDamage = weaponDamage.replaceAll(`@${data.short}`, "1d" + this.actor.system.attributes[data.name].die.sides);
                    if (this.actor.system.attributes[data.name].die.modifier){
                        this.addModifier(this.actor.system.attributes[data.name].die.modifier,gb.trans(`Attr${data.short.charAt(0).toUpperCase()}${data.short.slice(1)}`,'SWADE'));
                    }
                    
           }
        })



        ///min str
        
        
        return weaponDamage;
               
    
    }




    async rollDamage(damage,extraflavor='',raisedie=6){
        this.rolltype='damage';

        let raisetext=``;

        if (this.dmgraise){
            raisetext=`(+${gb.trans('Targetraise')})`;
        }


        if (this.item.type=='weapon' && gb.getMinStr(this.item)>gb.getStrForMinStr(this.actor)){
            this.addFlavor(`<div>${gb.trans('UnderMinStr')}</div>`,true);
        }

        
        this.flavor+=`<div>${gb.trans('Dmg','SWADE')}: ${damage} ${raisetext} ${extraflavor}</div>`;
        this.baseModifiers(true);
      //  console.log(raisedie);
        await this.buildDamageRoll(this.changeStr(damage),this.mod,this.dmgraise,raisedie);
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
            this.addFlag('itemroll',this.item.id); /// removed _id
            this.addFlag('useactor',this.actor.id);
            this.addFlag('rolltype',this.rolltype);
            this.addFlag('userof',this.rof);
            this.addFlag('usetarget',this.usetarget);

           // gb.log(this.actor,'actor');

            if (this.actor.isToken===true){
               // console.log(this.actor);
              //  console.log(this.actor.parent._object.id);
              this.addFlag('usetoken',this.actor.parent.id);
            }
        }
    }

    defineAction(action){
        this.addFlag('useaction',action);
        this.action=action;
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
        
        if (this.item){
            
            Hooks.call('swadeAction', this.actor, this.item,this.action,this.roll, game.user.id);  /// all item rolls -> can be used for hit/damage (itemDialog) => search for "new itemRoll"
        }

       

        this.autoItemFlags();

        let updateFlags={}

        if (this.flagUpdate){
            updateFlags={'swade-tools':this.flagUpdate}

         //  console.log(updateFlags);
        }

        

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
         //content: 'this is plus',
         flags: updateFlags,
        flavor: this.flavorAdd.start+this.flavor+this.flavorAdd.end+dataformodules
        };

       // let total=this.roll.total;

     

       // this.roll.setFlag('swade-tools',)

      // console.log(this.roll);

       this.roll.toMessage(chatData,{rollMode:game.settings.get("core","rollMode")})
       /* .then((chat)=>{ => already in chatData
       
        
        if (this.flagUpdate){ 
           


           // chat.update({'flags.swade-tools':this.flagUpdate});


           
        }
        
      

            
            
       }); */

       
        }
    }
}