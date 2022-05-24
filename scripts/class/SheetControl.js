import * as gb from './../gb.js';
import CharRoll from './CharRoll.js';
import ItemDialog from './ItemDialog.js';
import ItemRoll from './ItemRoll.js';
import SystemRoll from './SystemRoll.js';

export default class SheetControl {

    constructor(sheet,html){
        this.sheet=sheet;
        this.rollWithouDialog=false;  /// allow disable/enable dialog in the user configuration

        /* let divid=this.sheet.actor.id;
        if (this.sheet.actor.isToken){
            divid+='-'+this.sheet.actor.token.id
        }
        this.html=$('div#actor-'+divid); */

        this.html=html;

      //  console.log(sheet,html);
    }

    bindAttributes(){
        gb.attributes.map(attribute=>{
            this.html.find('.attribute[data-attribute="'+attribute+'"] button.attribute-label,.attributes-list .attribute[data-attribute="'+attribute+'"] .attribute-label a').unbind('click').bind('click',()=>{   
                if (gb.setting('simpleRolls')){
                   // let item=this.sheet.actor.items.get(skillId);
                  //  let skillName=item.name;
                    let content=`<div class="swadetools-itemfulldata">
                    <strong>${gb.trans(gb.attrlang[attribute],'SWADE')}</strong>: d${this.sheet.actor.data.data.attributes[attribute].die.sides}${gb.realInt(this.sheet.actor.data.data.attributes[attribute].die.modifier)?'+'+this.sheet.actor.data.data.attributes[attribute].die.modifier:''}
                    </div>
                    <div class="swadetools-formpart"><div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" value=""></div></div>`
                    new Dialog({
                        title: gb.trans(gb.attrlang[attribute],'SWADE'),
                        content: content,
                        default: 'ok',
                        buttons: {
                           
                            ok: {
                                label: `<i class="fas fa-dice"></i> ${gb.trans('Roll','SWADE')}`,
                                callback: (html)=>{
                                
                                    
                                    let cr=new CharRoll(this.sheet.actor)
                                    cr.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
                                    cr.rollAtt(attribute)
                                    cr.addFlag('rolltype','attribute')
                                    cr.display();
                                    
                                }
                            }
            
                            
                        }
                    }).render(true);
                   
    
                } else {             
                let sys=new SystemRoll(this.sheet.actor);
                sys.rollAtt(attribute);
                }
            })
        })
    }

    bindSkills(){

        /* let skillList=this.html.find('.skill-list-main ol.skill-list li.item.skill')
        
        for (let skill of skillList) {
            let skillId=$(skill).attr('data-item-id');
            $(skill).find('button.skill-name').unbind('click').bind('click',()=>{
                this.rollSkill(skillId);
            })
        } */

        let addel=''
        if(!gb.setting('itemNameClick')){
            addel='ol.skill-list li.item.skill button.skill-name,';
        }

        // ol.skill-list ....
        this.html.find(addel+'ol.skill-list li.item.skill button.skill-die,ol.skill-list li.item.skill img.skill-icon,.skill-list-main ol.skill-list li.item.skill button.skill-name, .skills-list .skill.item a:not(.item-edit)').unbind('click').bind('click',(ev)=>{
            //let skillId=ev.currentTarget.parentElement.dataset.itemId;
           
            let skillId=$(ev.currentTarget).closest('[data-item-id]').attr('data-item-id');

            if (gb.setting('simpleRolls')){
                let item=this.sheet.actor.items.get(skillId);
                let skillName=item.name;
                let content=`<div class="swadetools-itemfulldata">
                <strong>${skillName}</strong>: d${item.data.data.die.sides}${gb.realInt(item.data.data.die.modifier)?'+'+item.data.data.die.modifier:''}
                </div>
                <div class="swadetools-formpart"><div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" value=""></div></div>`
                new Dialog({
                    title: skillName,
                    content: content,
                    default: 'ok',
                    buttons: {
                       
                        ok: {
                            label: `<i class="fas fa-dice"></i> ${gb.trans('Roll','SWADE')}`,
                            callback: (html)=>{
                            
                                
                                let cr=new CharRoll(this.sheet.actor)
                                cr.addModifier(html.find("#mod")[0].value,gb.trans('Additional'))
                                cr.rollSkill(skillName)
                                cr.addFlag('rolltype','skill')
                                cr.display();
                                
                            }
                        }
        
                        
                    }
                }).render(true);
               

            } else {

                
            let sys=new SystemRoll(this.sheet.actor);

           
            sys.rollSkill(skillId);
            }
        })

        /* ;
            let item =  */
        /* .map(skill=>{
          //  console.log($(skill).attr('data-item-id'));
        })
      //  console.log(data); */
        /* .map(el=>{
        //    console.log(el);
            let skillId=el.attr('data-item-id');
         //   console.log(skillId);
        }) */
        
        
        
       /*  .each(()=>{
            let skillId=$(this).attr('data-item-id');
          //  console.log(obj);
            $(this).find('button.skill-name').unbind('click').bind('click',()=>{

                this.rollSkill(skillId)
            })
        }) */
       
    }


    bindDamage(){
       
            this.html.find('.quick-list a.damage-roll, .inventory button.damage-roll').unbind('click').bind('click',(ev)=>{
                let itemId=$(ev.currentTarget).parents('.item').data('itemId');
                let sys=new SystemRoll(this.sheet.actor);
               // this.addJokerModifier(this.sheet.actor.id);  
                sys.rollDamage(itemId);
                //console.log(itemId);
            });

         //   this.html.find('')
         //   game.actors.get("WO2pFlDeowqDMNQc").items.get("7UFVVJxrE1JF7YNO").rollDamage()
        
    }


    bindItem(){

        /// v0.0.4
       /*  this.html.find('.item-show, .item-image, .card-header .item-name,.item.weapon .item-img').unbind('click').bind('click',ev=>{
            let itemId=$(ev.currentTarget).parents('.item').data('itemId');
            let item=new ItemDialog(this.sheet.actor,itemId);
            item.showDialog();
        }) */

        /// v0.0.5

        let nthkey='2';
        if (this.sheet.actor.items.find(el=>el.type=='edge' && el.data.data.isArcaneBackground===true)){
       // if (Object.keys(this.sheet.actor.data.data.powerPoints).length !== 0){
         //  console.log(this.sheet.actor.items.find(el=>el.type=='edge' && el.data.data.isArcaneBackground===true));
       //   console.log('has powers');
            nthkey='-n+3';
        }

       // nthkey=2;
        
        // .swade-official
        let findEl='.quick-main .quick-list:nth-of-type('+nthkey+') .item-image,.quick-main .quick-list:nth-of-type('+nthkey+') .item-show,.inventory .item.weapon .item-img, .inventory .item.weapon .item-show, .item.power .item-image,.item.power .item-show,.item.power .item-name, .inventory .item.weapon .item-name,.inventory .item.weapon .damage-roll,'

       //

        /// .npc and .community
        findEl+='.gear-list.weapon-list .item.weapon .item-image,  .gear-list.weapon-list .item.weapon .item-show, .powers-list .item-image, .powers-list .item-show, .powers-list h4.item-name, .item-list .item.weapon h4, .item-list .item.weapon .item-image,';


        ///v0.17
        findEl+='.quickaccess .quick-list:nth-of-type('+nthkey+') .item-image,.quickaccess .quick-list:nth-of-type('+nthkey+') .item-show'


       
        

        if(!gb.setting('itemNameClick')){
            findEl+=',.quick-main .quick-list:nth-of-type('+nthkey+') .item-name,.gear-list.weapon-list .item.weapon .item-name'  /// swade-official, npc
            //v0.17
            findEl+=',.quickaccess .quick-list:nth-of-type('+nthkey+') .item-name';
        }

    
       this.html.find(findEl).css('background','yellow');
       gb.log(this.html);
       gb.log(findEl);
           // console.log(findEl);
            this.html.find(findEl).unbind('click').bind('click',ev=>{
                this.doItem(ev.currentTarget)

                
            })
        
    }

    doItem(target){
        let itemId=$(target).parents('.item').data('itemId');
               
        let item=new ItemDialog(this.sheet.actor,itemId);
        item.showDialog();
    }


    rebindAll(){
        this.bindAttributes();
        this.bindSkills();
        this.bindDamage();
        this.bindItem();
    }

    /* showItem(itemId){
        
        
    }

    rollDamage(itemId){
       // console.log(this.sheet.actor.items.get(itemId));
        this.sheet.actor.items.get(itemId).rollDamage();
    }

    rollSkill(skillId){
        if (this.rollWithouDialog){
          
        } else {
            this.addJokerModifier(this.sheet.actor.id);  
            this.sheet.actor.rollSkill(skillId);
        }
    }

    addJokerModifier(actorId){
        if (gb.actorIsJoker(actorId)){
            Hooks.once('renderDialog',(dialog,html,data)=>{
                html.find('input#bonus').val('+2');
            });
        }
    }

    rollAtt(attribute){
         
        if (this.rollWithouDialog){
            let charRoll=new CharRoll(this.sheet.actor);
            charRoll.rollAtt(attribute);
            charRoll.display();
        } else {


            this.addJokerModifier(this.sheet.actor.id);           
            this.sheet.actor.rollAttribute(attribute);
        }
    } */
}