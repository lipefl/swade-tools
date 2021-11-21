import * as gb from './../gb.js';

export default class SystemRoll {
    constructor(actor){
        this.actor=actor;
    }


   async rollDamage(itemId){
      //  this.addJokerModifier(); 
      await   Hooks.once("renderChatMessage", (chat, html,data) => { 
        if (data.user.id==game.user.id){
        chat.update({'flags.swade-tools.rolltype':'damage'});
        }
       
    })        
        this.actor.items.get(itemId).rollDamage()
        
    }

    async rollSkill(skillId){
       
         //   this.addJokerModifier();  
         await Hooks.once("renderChatMessage", (chat, html,data) => { 
            console.log(data);
            if (data.user.id==game.user.id){
            chat.update({'flags.swade-tools.rolltype':'skill'});
            }
        })
           this.actor.rollSkill(skillId)/* .then(()=>{ */
                
            /* }).catch(()=>{console.log('catch')}); */
        
    }

    /* addJokerModifier(){ /// removed, now in system
        if (gb.actorIsJoker(this.actor)){
            Hooks.once('renderDialog',(dialog,html,data)=>{
                html.find('input#bonus').val('+2');
            });
        }
    } */

    async rollAtt(attribute){
    
           // this.addJokerModifier();   
           await Hooks.once("renderChatMessage", (chat, html,data) => { 
            if (data.user.id==game.user.id){
            chat.update({'flags.swade-tools.rolltype':'attribute'});
            }
           
        })        
            this.actor.rollAttribute(attribute)
        
    }
}