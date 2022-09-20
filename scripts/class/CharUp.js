
import * as gb from './../gb.js';

export default class CharUp {

    constructor(actor,data){

        this.actor=actor;
        this.data=data;
     //   console.log(data);
       // gb.log(this.data);
        this.updates={}

       

        
    }

    checkAll(){
        this.resizeToken();
        this.wildOrExtra();
    //   this.calcPace();

        this.doUpdates();
    }

    checkSizeUp(){
        let wh=0;
        let size=this.actor.system.stats.size;
        if (size>3 && size<8){
            wh=1
        } else if (size>7 && size<12){
            wh=2
        } else if (size>11){
            wh=3
        }

        return wh;
    }

    /*  calcPace(){ /// from swade system
        let pace = this.actor.data.data.stats.speed.value;
        //subtract encumbrance, if necessary
        if (this.actor.isEncumbered)
            pace -= 2;
        //modify pace with wounds
        if (game.settings.get('swade', 'enableWoundPace')) {
            //bound maximum wound penalty to -3
            const wounds = Math.min(this.actor.data.data.wounds.value, 3);
            //subtract wounds
            pace -= wounds;
        }

        pace+= gb.penalArmorMinStr(this.actor)

        this.lateupdates['data.stats.speed.adjusted']=Math.max(pace, 1)
        //make sure the pace doesn't go below 1
       // this.data.data.stats.speed.adjusted = Math.max(pace, 1);
    } 
 */
    resizeToken(){
       // gb.log(this.data.data.stats.size);
        if (this.data?.system?.stats?.size!==undefined){
            let wh=this.checkSizeUp()+1;           
            
            this.updates['token.width']=wh;
            this.updates['token.height']=wh;

            
            
        }
    }

    wildOrExtra() {
        if (this.data?.system?.wildcard!==undefined || this.data?.system?.stats?.size!==undefined){
            let wild=this.actor.system.wildcard;
            let maxw=0;
            if (wild===true){
                maxw=3

                this.updates['token.actorLink']=true; /// link token
            } else {
                this.updates['token.actorLink']=false; /// link token
            }

            maxw+=this.checkSizeUp()

            this.updates['data.wounds.max']=maxw
            
        }
    }

    doUpdates(){
       
        this.actor.update(this.updates);

        
    }

}