import * as gb from './../gb.js';
import CharRoll from './CharRoll.js';

export default class SystemRoll {
    constructor(actor){
        this.actor=actor;
        this.vehicle=false;
        this.modifiers=[]
    }


   async rollDamage(itemId){
      //  this.addJokerModifier(); 
      await   Hooks.once("renderChatMessage", (chat, html,data) => { 
        if (data.user.id==game.user.id){
        chat.update({'flags.swade-tools.rolltype':'damage'});
        }
       
    })        
        await this.actor.items.get(itemId).rollDamage()
        
    }

    useManeuver(vehicle){
        this.vehicle=vehicle
        this.modifiers.push({reason:gb.trans('Handling','SWADE'),mod:vehicle.system.handling})
    }

    addExtraModifiers(charRoll){
        this.modifiers.map(obj=>{
            charRoll.addModifier(obj.mod,obj.reason);
        })
    }

    async rollSkill(skillId){
       
        if (gb.setting('simpleRolls')){
            let item=this.actor.items.get(skillId);

            

            let skillName;
            let exp;
            if (!item){
                skillName=skillId;                
                exp=`d4-2`
            } else {
                skillName=item.name;
                let skillModifier=item.system.die.modifier;
                exp=`d${item.system.die.sides}${skillModifier?'+'+skillModifier:''}`
            }
            
            let content=`<div class="swadetools-itemfulldata">
            <strong>${skillName}</strong>: ${exp}
            </div>
            <div class="swadetools-formpart"><div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" class="swadetools-input-number" id="mod" value=""></div>`
            if (!this.actor.isWildcard && gb.setting('useGroupRolls')){
                content+=`<div class="swadetools-formpart"><label><input type="checkbox" id="grouproll" value="1"><strong>${gb.trans('GroupRoll','SWADE')}</strong></label></div>`;
            }
            content+=`</div>`
            new Dialog({
                title: skillName,
                content: content,
                default: 'ok',
                render: html => {
                    gb.modButtons(html)
                },
                buttons: {
                   
                    ok: {
                        label: `<i class="fas fa-dice"></i> ${gb.trans('Roll','SWADE')}`,
                        callback: async (html)=>{
                        
                            
                            let cr=new CharRoll(this.actor);
                            if (this.vehicle){
                                let penalty=0-this.vehicle.system.wounds.value;
                                if (penalty<-4){
                                    penalty=-4
                                }
                                cr.addModifier(penalty,gb.trans('Handling','SWADE'))
                            }
                            cr.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
                            this.addExtraModifiers(cr);

                            if (html.find("#grouproll")[0]?.checked){
                                cr.rollGroup();
                            }

                            await cr.rollSkill(skillName)
                            cr.addFlag('rolltype','skill')
                            cr.display();
                            
                        }
                    }
    
                    
                }
            }).render(true);
           

        } else {
         //   this.addJokerModifier();  
         await Hooks.once("renderChatMessage", (chat, html,data) => { 
           // console.log(data);
            if (data.user.id==game.user.id){
            chat.update({'flags.swade-tools.rolltype':'skill'});
            }
        })


        let opts={};
        if (this.vehicle){

            let penalty=0-this.vehicle.system.wounds.value;
            if (penalty<-4){
                penalty=-4
            }

            if (penalty){
                opts={
                    additionalMods: [
                        {
                            label: game.i18n.localize('SWADE.Handling'),
                            value: penalty,
                        },
                    ],
                }
            }
        }


           await this.actor.rollSkill(skillId,opts);
    }
        
    }

    async rollRun(){
        if (gb.setting('simpleRolls')){
            let content=`<div class="swadetools-itemfulldata">
                    <strong>${gb.trans('Running','SWADE')}</strong>: ${this.actor.system.pace.ground}+d${this.actor.system.pace.running.die}${gb.stringMod(this.actor.system.pace.running.mod)}
                    </div>
                    <div class="swadetools-formpart"><div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" class="swadetools-input-number" id="mod" value=""></div></div>`
                    new Dialog({
                        title: gb.trans('Running','SWADE'),
                        content: content,
                        default: 'ok',
                        render: html => {
                            gb.modButtons(html)
                        },
                        buttons: {
                           
                            ok: {
                                label: `<i class="fas fa-dice"></i> ${gb.trans('Roll','SWADE')}`,
                                callback: async (html)=>{
                                
                                   
                                    
                                    let cr=new CharRoll(this.actor)
                                    cr.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
                                    await cr.rollRun()
                                   // cr.addFlag('rolltype','attribute')
                                    cr.display();
                                    
                                }
                            }
            
                            
                        }
                    }).render(true);
        } else {
            await this.actor.rollRunningDie();
        }
        
    }

    /* addJokerModifier(){ /// removed, now in system
        if (gb.actorIsJoker(this.actor)){
            Hooks.once('renderDialog',(dialog,html,data)=>{
                html.find('input#bonus').val('+2');
            });
        }
    } */

    async rollAtt(attribute){

        if (gb.setting('simpleRolls')){

            let attModifier=gb.realInt(this.actor.system.attributes[attribute].die.modifier);

            let content=`<div class="swadetools-itemfulldata">
                    <strong>${gb.trans(gb.attrlang[attribute],'SWADE')}</strong>: d${this.actor.system.attributes[attribute].die.sides}${attModifier?'+'+attModifier:''}
                    </div>
                    <div class="swadetools-formpart"><div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" class="swadetools-input-number" value=""></div>`

                    if (!this.actor.isWildcard && gb.setting('useGroupRolls')){
                        content+=`<div class="swadetools-formpart"><label><input type="checkbox" id="grouproll" value="1"><strong>${gb.trans('GroupRoll','SWADE')}</strong></label></div>`;
                    }
            

                    content+=`</div>`
                    new Dialog({
                        title: gb.trans(gb.attrlang[attribute],'SWADE'),
                        content: content,
                        default: 'ok',
                        render: html => {
                            gb.modButtons(html)
                        },
                        buttons: {
                           
                            ok: {
                                label: `<i class="fas fa-dice"></i> ${gb.trans('Roll','SWADE')}`,
                                callback: async (html)=>{
                                
                                    
                                    let cr=new CharRoll(this.actor)
                                    cr.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
                                    if (html.find("#grouproll")[0]?.checked){
                                        cr.rollGroup();
                                    }
                                    await cr.rollAtt(attribute)
                                    cr.addFlag('rolltype','attribute')
                                    cr.display();
                                    
                                }
                            }
            
                            
                        }
                    }).render(true);

        } else {
    
         //   console.log('called');
           // this.addJokerModifier();   
           await Hooks.once("renderChatMessage", (chat, html,data) => { 
            if (data.user.id==game.user.id){
            chat.update({'flags.swade-tools.rolltype':'attribute'});
            }
           
        })        
            await this.actor.rollAttribute(attribute)
        }
    }
}