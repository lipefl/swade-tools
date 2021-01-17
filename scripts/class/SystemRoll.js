import * as gb from './../gb.js';

export default class SystemRoll {
    constructor(actor){
        this.actor=actor;
    }


    rollDamage(itemId){
        this.addJokerModifier();  
        this.actor.items.get(itemId).rollDamage();
    }

    rollSkill(skillId){
       
            this.addJokerModifier();  
            this.actor.rollSkill(skillId);
        
    }

    addJokerModifier(){ 
        if (gb.actorIsJoker(this.actor)){
            Hooks.once('renderDialog',(dialog,html,data)=>{
                html.find('input#bonus').val('+2');
            });
        }
    }

    rollAtt(attribute){
    
            this.addJokerModifier();           
            this.actor.rollAttribute(attribute);
        
    }
}