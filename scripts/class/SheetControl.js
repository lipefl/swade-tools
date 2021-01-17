import * as gb from './../gb.js';
//import CharRoll from './CharRoll.js';
import ItemDialog from './ItemDialog.js';
import SystemRoll from './SystemRoll.js';

export default class SheetControl {

    constructor(sheet,html){
        this.sheet=sheet;
        this.rollWithouDialog=false;  /// allow disable/enable dialog in the user configuration
        this.html=html;
    }

    bindAttributes(){
        gb.attributes.map(attribute=>{
            this.html.find('.attribute[data-attribute="'+attribute+'"] button.attribute-label,.attributes-list .attribute[data-attribute="'+attribute+'"] .attribute-label a').unbind('click').bind('click',()=>{                
                let sys=new SystemRoll(this.sheet.actor);
                sys.rollAtt(attribute);
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

        this.html.find('.skill-list-main ol.skill-list li.item.skill button.skill-name,.skills-list .skill.item a:not(.item-edit)').unbind('click').bind('click',(ev)=>{
            //let skillId=ev.currentTarget.parentElement.dataset.itemId;
            let skillId=$(ev.currentTarget).closest('[data-item-id]').attr('data-item-id');
          
            let sys=new SystemRoll(this.sheet.actor);

           // this.addJokerModifier(this.sheet.actor.id);  
            sys.rollSkill(skillId);
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
        
        // .swade-official
        let findEl='.quick-main .quick-list:nth-of-type(-n+2) .item-image,.quick-main .quick-list:nth-of-type(-n+2) .item-show,.inventory .item.weapon .item-img, .inventory .item.weapon .item-show, .item.power .item-image,.item.power .item-show'

        

        /// .npc and .community
        findEl+=',.gear-list.weapon-list .item.weapon .item-image,  .gear-list.weapon-list .item.weapon .item-show, .powers-list .item-image, .powers-list .item-show, .powers-list h4.item-name, .item-list .item.weapon h4, .item-list .item.weapon .item-image';
        

        if(!gb.setting('itemNameClick')){
            findEl+=',.quick-main .quick-list:nth-of-type(-n+2) .item-name,.gear-list.weapon-list .item.weapon .item-name'  /// swade-official, npc
        }
       
           // console.log(findEl);
            this.html.find(findEl).unbind('click').bind('click',ev=>{
                let itemId=$(ev.currentTarget).parents('.item').data('itemId');
               
                let item=new ItemDialog(this.sheet.actor,itemId);
                item.showDialog();
            })
        
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
            //TODO
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