import * as gb from './../gb.js';

export default class SystemRoll {
    constructor(actor){
        this.actor=actor;
    }


    rollDamage(itemId){
        this.addJokerModifier();          
        this.actor.items.get(itemId).rollDamage().then(()=>{
            Hooks.once("renderChatMessage", (chat, html) => { 
                chat.update({'flags.swade-tools.rolltype':'damage'});
               
            })
        });
        
    }

    rollSkill(skillId){
       
            this.addJokerModifier();  
            this.actor.rollSkill(skillId).then(()=>{
                Hooks.once("renderChatMessage", (chat, html) => { 
                    chat.update({'flags.swade-tools.rolltype':'skill'});
                   
                })
            });
        
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
            this.actor.rollAttribute(attribute).then(()=>{
                Hooks.once("renderChatMessage", (chat, html) => { 
                    chat.update({'flags.swade-tools.rolltype':'attribute'});
                   
                })
            });
        
    }
}