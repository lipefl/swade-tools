import * as gb from './../gb.js';
import Char from './Char.js';
import CharRoll from './CharRoll.js';

export default class CombatControl {

    

    constructor(){
        this.previousTurn=false;   
        this.combatid=false;  
       
       // this.combatant=false;   
    }

    setCombat(id){
        if (this.combatid!=id){
            this.previousTurn=false;
        }
        this.combatid=id;
    }
   
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
        if (combatant.data.flags?.[scope]?.[flag]!==undefined){
            return combatant.data.flags[scope][flag]
        } else {
            return false;
        }
    }

    async setFlag(combatant,scope,flag,value){
        /* game.combat.updateEmbeddedEntity('Combatant', {
            _id: combatant.id,
          //  initiative: suitValue + cardValue,
            'flags.swadetools': {
                [flag]:value
            }
        });

        game.combat.updateEmbeddedEntity('Combatant', {
        combatant.flags.push({{flags:{[scope]:{[flag]:value}}}); */
      //  combatant.flags[scope][flag]=value;

      //  let update={_id:combatant.id,['flags.'+scope+'.'+flag]:value}
      //  console.log(update);
      gb.setFlagCombatant(game.combats.get(this.combatid),combatant,scope,flag,value);
      //  game.combats.get(this.combatid).updateCombatant(update);
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
            if (combatant.actor.data.type=='npc'){ /// NPC - GM gets a benny and each NonPC-WC
                gmJoker=true;
            } 

            if (gmJoker){
                combat.combatants.filter(el=>el.actor.data.type=='npc' && el.actor.isWildcard===true).map(combatant=>{
                    let char=new Char(combatant.actor);
                    char.giveBenny();
                })

                /// also give GM a benny
                let gmPlayer=gb.GMPlayer();
                let actualBennies=gmPlayer.data.flags.swade.bennies+1
                gmPlayer.update({"flags.swade.bennies":actualBennies})

            } else {

                combat.combatants.filter(el=>el.actor.data.type=='character' && el.actor.isWildcard===true).map(combatant=>{
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


    unshaken(combatant){

     
        

        let actor=combatant.actor;
      
        
        
        if (!this.isAutoRoll(actor)){

            let char=new Char(actor);
            char.say(gb.trans('sayIsShaken'));

        } else {
            
            let charRoll=new CharRoll(actor);
            charRoll.addFlavor(`<div>${gb.trans("UnShakenAttempt")}</div>`);
        

        charRoll.addEdgeModifier('Combat Reflexes',2)
        charRoll.addAbilityModifier('Undead',2)
        charRoll.addAbilityModifier('Construct',2)


        
        charRoll.rollAtt('spirit')
        charRoll.addFlag('useactor',actor.id);
        charRoll.addFlag('rolltype','unshaken');

        if (actor.isToken===true){
            charRoll.addFlag('usetoken',actor.token.id);
        }
           charRoll.display()
        }
     
          
        

           
          
        
        
    }

    unstunned(combatant){
        let actor=combatant.actor;


        if (!this.isAutoRoll(actor)){

            let char=new Char(actor);
            char.say(gb.trans('sayIsStunned'));

        } else {
        let charRoll=new CharRoll(actor);        
     //   this.addJoker(combatant,charRoll);    
        charRoll.addFlavor(`<div>${gb.trans("UnStunnedAttempt")}</div>`);
        charRoll.rollAtt('vigor');

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
        let actor=combatant.actor;
        
    gb.log('start: '+actor.name); 
        let char=new Char(actor);
        let checkDistracted=true;
        let checkVulnerable=true;

        /// Shaken
        if (char.is('isShaken')){
            this.unshaken(combatant);
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
            this.unstunned(combatant);
        }
        
        /// Distracted
        if (checkDistracted && char.is('isDistracted')){
            this.setFlag(combatant,gb.moduleName,'removeDistracted',1)
           // combatant.setFlag(gb.moduleName,'removeDistracted',1);
        }

        /// Vulnerable
        if (checkVulnerable && char.is('isVulnerable')){
            this.setFlag(combatant,gb.moduleName,'removeVulnerable',1)
            //combatant.setFlag(gb.moduleName,'removeVulnerable',1);
        }

        /// Stunned


        /// Bound

        /// Entangled
    }
    
    async endTurn(combatant){
      //  console.log(combatant);
        let actor=combatant.actor;
    gb.log('end: '+actor.name); 
        let char=new Char(actor);
     //   console.log(combatant);
    ///   console.log(combatant.flags.swade);
     //   console.log(combatant.flags?.['swade-tools']?.removeVulnerable);
     //   console.log(await this.getFlag(combatant,gb.moduleName,'removeVulnerable'));
      let removeVul=await this.getFlag(combatant,gb.moduleName,'removeVulnerable')
     // console.log(combatant);
    //  console.log(removeVul);
        if (removeVul){
         //   console.log('removing Vulnerable');
            char.off('isVulnerable')
            char.say(gb.trans("RemVuln"))
            this.setFlag(combatant,gb.moduleName,'removeVulnerable',0)
        }

        let removeDist=await this.getFlag(combatant,gb.moduleName,'removeDistracted');
        if (removeDist){
            char.off('isDistracted');
            char.say(gb.trans("RemDistr"))
            this.setFlag(combatant,gb.moduleName,'removeDistracted',0)
        }

        if (gb.actorIsConvicted(actor.id)){
            char.say(`${gb.trans('ConvEnd')}<button class="swadetools-simplebutton swadetools-unshake-button" data-swade-tools-action="keepConviction:${actor.id}">${gb.trans('ConvKepp')}</button>`)
            char.update('details.conviction.active',false);
        }
    }
}