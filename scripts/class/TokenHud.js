import ItemDialog from './ItemDialog.js';
import SystemRoll from './SystemRoll.js';

export default class TokenHud {

    bindItem(){
        
        $('#token-action-hud #tah-category-powerPoints .tah-action').each((ev,el)=>{
            this.doItem(el)
        })

        $('#token-action-hud #tah-category-gear .tah-action').each((ev,el)=>{

            this.doItem(el)
            /* let data=$(el).val().split('|');
            if (data[0]=='item'){
                let actor=canvas.tokens.get(data[1]).actor;
                let itemId=data[2];
                let item=actor.items.get(itemId);
                if (item.type=='weapon' || item.type=='power'){
                    $(el).unbind('click').bind('click',()=>{
                        let item=new ItemDialog(actor,itemId);
                        item.showDialog();
                    })
                }
            } */

        })
        
        
    }

    bindAttributes(){ /// and RUNNING
        $('#token-action-hud #tah-category-attributes .tah-action').unbind('click').unbind('mousedown').bind('click', async (ev)=>{
            let data=$(ev.currentTarget).find('button').val().split('|');
            let actor=canvas.tokens.get(data[1]).actor;
            let attribute=data[2];

            let sys=new SystemRoll(actor);
            if (attribute=='runningDie'){
                await sys.rollRun();
            } else {
                await sys.rollAtt(attribute);
            }
            
            

        })
    }

   

    bindSkills(){
        $('#token-action-hud #tah-category-skills .tah-action').unbind('click').unbind('mousedown').bind('click', async (ev)=>{
            let data=$(ev.currentTarget).find('button').val().split('|');
            let actor=canvas.tokens.get(data[1]).actor;
            let skillId=data[2];
            let sys=new SystemRoll(actor);           
            await sys.rollSkill(skillId);

        })
    }




    doItem(el){
        let data=$(el).find('button').val().split('|');
        if (data[0]=='item'){
            let actor=canvas.tokens.get(data[1]).actor;
            let itemId=data[2];
            let item=actor.items.get(itemId);
            if (item.type=='weapon' || item.type=='power'){
                $(el).unbind('click').unbind('mousedown').bind('click',()=>{
                    let item=new ItemDialog(actor,itemId);
                    item.showDialog();
                })
            }
        }
    }

    rebindAll(){
        this.bindItem();
        this.bindAttributes();
        this.bindSkills();
    }
}