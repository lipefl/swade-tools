import SystemRoll from './class/SystemRoll.js';
import ItemDialog from './class/ItemDialog.js';

export const attribute=async(actor,attribute)=>{
    let sys=new SystemRoll(actor);
    await sys.rollAtt(attribute);
}


export const skill=async(actor,skillItemId)=>{
    let sys=new SystemRoll(actor);           
    await sys.rollSkill(skillItemId);
}

export const run=async(actor)=>{
    let sys=new SystemRoll(actor);
            await sys.rollRun();
}


export const item=async(actor,itemId)=>{
    let item=actor.items.get(itemId)
    if (item.type=='weapon' || item.type=='power'){
        let itemshow=new ItemDialog(actor,itemId);
        itemshow.showDialog();
    } else {
        item.show();
    }
}
   

