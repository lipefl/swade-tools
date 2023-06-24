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
    let item=new ItemDialog(actor,itemId);
    item.showDialog();
}

