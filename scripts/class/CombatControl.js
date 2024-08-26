import * as gb from './../gb.js';
import Char from './Char.js';
import CharRoll from './CharRoll.js';

export default class CombatControl {

    

    constructor(){
        // this.previousTurn=false;   //EternalRider: useless
        // this.combatid=false;  //EternalRider: useless
        // this.combatinfo={}  //EternalRider: useless
        // this.acting=false; //EternalRider: this.acting is not always the previous combatant
       
       // this.combatant=false;   
    }

    //EternalRider: useless
    /* setCombat(id){
        if (this.combatid!=id){ /// changed combat
            this.previousTurn=false;

            this.combatinfo={
                round: game.combats.get(id).current.round,
                turn: game.combats.get(id).current.turn
            }
        }
        this.combatid=id;

        
    } */


    //EternalRider: useless
    /* isNewTurn(){
        let combat= game.combats.get(this.combatid);
        gb.log('SWADETOOLS','C2',combat,this.combatinfo);
        if (this.combatinfo.round!=combat.current.round || this.combatinfo.turn!=combat.current.turn){
            this.combatinfo={
                round: combat.current.round,
                turn: combat.current.turn
            }
            return true;
        } else {
            return false;
        }
    } */
   
    /* async act(combatant){ ///not used anymore
        
     //  console.log(combatant);

       if(!combatant.defeated){ // ignore defeated ??? - let foundry control
        if (this.previousTurn){
            await this.endTurn(this.previousTurn);
          //  console.log('ending'+this.previousTurn._actor.name);
         //   console.log(this.previousTurn);
        }

      
        this.previousTurn=Object.assign({},combatant);

        //console.log('ACTING',combatant.name);
        
       await this.startTurn(combatant);
      //  console.log('starting'+combatant.name);
        }
        
        
    } */


   async getFlag(combatant,scope,flag){

        let flagret=await combatant.getFlag(scope,flag) /// revert if ok
        /* let flagret=await game.combats.get(combatant.combat.id).getFlag(scope,flag+'###'+combatant.id); /// combatant flag was causing bug

        if (flagret===undefined){
            flagret=false;
        } */
       return flagret;
    }

    async setFlag(combatant,scope,flag,value){    

       /*  console.log('setting-flag');
        socket.on('module.'+gb.moduleName,async()=>{
            if (game.user !== game.users.activeGM) return;
            console.log('isGM');
            
        }) */
    
        await gb.setFlagCombatant(combatant.combat,combatant,scope,flag,value);


    }

    hasJoker(combatant){
        if (this.getFlag(combatant,'swade','hasJoker')===true){
            return true;
        } else {
            return false;
        }
    }

    /* addJoker(combatant,rollObj){
        if (this.hasJoker(combatant)){
            rollObj.addModifier(2,gb.trans("Joker"))
        } 
    } */


    giveJokersBennies(combat,combatant){

        let gmJoker=false; ///PC - all players get a benny
            if (combatant.actor.type=='npc'){ /// NPC - GM gets a benny and each NonPC-WC
                gmJoker=true;
            } 

            if (gmJoker){
                combat.combatants.filter(el=>el.actor.type=='npc' && el.actor.isWildcard===true).map(combatant=>{
                    let char=new Char(combatant.actor);
                    char.giveBenny();
                })

                /// also give GM a benny
                let gmPlayer=gb.GMPlayer();
                let actualBennies=gmPlayer.data.flags.swade.bennies+1
                gmPlayer.update({"flags.swade.bennies":actualBennies})

            } else {

                combat.combatants.filter(el=>el.actor.type=='character' && el.actor.isWildcard===true).map(combatant=>{
                   let char=new Char(combatant.actor);
                    char.giveBenny();
                })
            }
    }

    ////not used anymore
    /* async jokersWild(combat){ 

        if (!gb.setting('disableJokersWild') && combat.getFlag(gb.moduleName,'jokersWild')!=combat.round){
            /// swade.hasJoker bug
        let jokers=combat.combatants.filter(el=>el.flags?.swade?.cardValue>14);
      //  console.log('jokers',jokers);
        await combat.setFlag(gb.moduleName,'jokersWild',combat.round);
        
        if (jokers.length>0){
            jokers.map(combatant=>{
                this.giveJokersBennies(combat,combatant);
                gb.say(gb.trans('JokersWildMsg'),gb.trans('JokersWild')) 
            })

        }

        }

        
        
    } */


    async unshaken(combatant){

     
        

        let actor=combatant.actor;
      
        
        
        if (!this.isAutoRoll(actor)){

            let char=new Char(actor);
            char.say(gb.trans('sayIsShaken'));

        } else {
            
            let charRoll=new CharRoll(actor);
            charRoll.addFlavor(`<div>${gb.trans("UnShakenAttempt")}</div>`);
        

        charRoll.addModifier(actor.system.attributes.spirit?.unShakeBonus,gb.trans('EffectCallbacks.Shaken.UnshakeModifier','SWADE'));

        if (!gb.setting('onlySystemMod')){
            charRoll.addEdgeModifier('Combat Reflexes',2)
            charRoll.addAbilityModifier('Undead',2)
            charRoll.addAbilityModifier('Construct',2)
        }
        


        
        await charRoll.rollAtt('spirit')
        charRoll.addFlag('useactor',actor.id);
        charRoll.addFlag('rolltype','unshaken');

        if (actor.isToken===true){
            charRoll.addFlag('usetoken',actor.token.id);
        }
           charRoll.display()
        }
     
          
        

           
          
        
        
    }

    async unstunned(combatant){
        let actor=combatant.actor;


        if (!this.isAutoRoll(actor)){

            let char=new Char(actor);
            char.say(gb.trans('sayIsStunned'));

        } else {
        let charRoll=new CharRoll(actor);        
     //   this.addJoker(combatant,charRoll);    
        charRoll.addFlavor(`<div>${gb.trans("UnStunnedAttempt")}</div>`);
        charRoll.addModifier(actor.system.attributes.vigor?.unStunBonus,gb.trans('EffectCallbacks.Stunned.UnStunModifier','SWADE'));
        await charRoll.rollAtt('vigor');

        charRoll.addFlag('useactor',actor.id);
        charRoll.addFlag('rolltype','unstunned');
     //   console.log(actor);
        if (actor.isToken===true){
            charRoll.addFlag('usetoken',actor.token.id);
        }

        charRoll.addFlag('usecombat',this.combatid);
        charRoll.addFlag('usecombatant',combatant.id);

        charRoll.display();

    }

       
    }

    isAutoRoll(actor){
        let autoroll=gb.setting('noStatusAutoRoll')
        if (autoroll){
            if (autoroll===true || autoroll=='all'){
                return false;
            } else 
            if (autoroll=='npconly'){
               if (actor.type=='npc'){
                    return true
               } else {
                   return false;
               }
            }

        } else {
            return true;
        }
    }

   async startTurn(combatant){      

    
   // console.log(combatant);
      if (combatant){

        if (combatant.defeated){ //do nothing if it's defeated
            return
        }

        //EternalRider: Do not retrigger
        let hasStarted = await this.getFlag(combatant, gb.moduleName, 'hasStarted');
        if (hasStarted) return;

        gb.log('starting',combatant);

        await this.setFlag(combatant, gb.moduleName, 'hasStarted', true);
        let actor=combatant.actor;
        
    gb.log('start: '+actor.name); 

        // this.acting=combatant; //EternalRider: this.acting is not always the previous combatant
        let char=new Char(actor);
        let checkDistracted=true;
        let checkVulnerable=true;

        /// Shaken
        if (char.is('isShaken')){
            await this.unshaken(combatant);
        }

        if (char.is('isBound')){
            checkDistracted=false;
            checkVulnerable=false;
          
            char.say(gb.trans('ItsBound')) // add buttons str-2 or athletics - warn on token move -> same for entangled
        }

        if (char.is('isEntangled')){
            checkDistracted=false;            
           
            char.say(gb.trans('ItsEntangled')) 
        }

        if (char.is('isStunned')){
          //  checkDistracted=false; => new rule
            checkVulnerable=false;
            await this.unstunned(combatant);
        }
        
        /// Distracted
        if (checkDistracted && char.is('isDistracted')){
            this.setFlag(combatant,gb.moduleName,'removeDistracted',true)  //EternalRider: I don't know why the 0 in my test will not work
           // combatant.setFlag(gb.moduleName,'removeDistracted',1);
        }

        /// Vulnerable
        if (checkVulnerable && char.is('isVulnerable')){
            this.setFlag(combatant,gb.moduleName,'removeVulnerable',true)  //EternalRider: I don't know why the 0 in my test will not work
            //combatant.setFlag(gb.moduleName,'removeVulnerable',1);
        }

        /// Stunned


        /// Bound

        /// Entangled
    }
    }
    
    async endTurn(combatant){  //EternalRider: same as startTurn is better

        
      //  console.log(combatant);
    //   let combatant=this.acting; //EternalRider: this.acting is not always the previous combatant

    

      if (combatant){

        if (combatant.defeated){ //do nothing if it's defeated
            return
        }




        //EternalRider: Do not retrigger
        let hasEnded = await this.getFlag(combatant, gb.moduleName, 'hasEnded');
        if (hasEnded) return;

        gb.log('ending',combatant);
        await this.setFlag(combatant, gb.moduleName, 'hasEnded', true);

        let actor=combatant.actor;
    gb.log('end: '+actor.name); 
        let char=new Char(actor);

      let removeVul=await this.getFlag(combatant,gb.moduleName,'removeVulnerable')
      gb.log(actor.name,'removeVul',removeVul);
        if (removeVul){        
            char.off('isVulnerable')
            char.say(gb.trans("RemVuln"))
            this.setFlag(combatant,gb.moduleName,'removeVulnerable',false)  //EternalRider: I don't know why the 0 in my test will not work
        }

        let removeDist=await this.getFlag(combatant,gb.moduleName,'removeDistracted');
        gb.log(actor.name,'removeDist',removeDist);
        if (removeDist){
            char.off('isDistracted');
            char.say(gb.trans("RemDistr"))
            this.setFlag(combatant,gb.moduleName,'removeDistracted',false)  //EternalRider: I don't know why the 0 in my test will not work
        }

        if (gb.actorIsConvicted(actor.id)){
            char.say(`${gb.trans('ConvEnd')}<button class="swadetools-simplebutton swadetools-unshake-button" data-swade-tools-action="keepConviction:${actor.id}">${gb.trans('ConvKepp')}</button>`)
            char.update('details.conviction.active',false);
        }

        }
    }
}