
import * as gb from './../gb.js';

export default class CharUp {

    constructor(actor,data){

        this.actor=actor;
        this.data=data;
       // gb.log(this.data);
        this.updates={}

        
    }

    checkAll(){
        this.resizeToken();
        this.wildOrExtra();

        this.doUpdates();
    }

    checkSizeUp(){
        let wh=0;
        let size=this.actor.data.data.stats.size;
        if (size>3 && size<8){
            wh=1
        } else if (size>7 && size<12){
            wh=2
        } else if (size>11){
            wh=3
        }

        return wh;
    }

    resizeToken(){
       // gb.log(this.data.data.stats.size);
        if (this.data?.data?.stats?.size!==undefined){
            let wh=this.checkSizeUp()+1;           
            
            this.updates['token.width']=wh;
            this.updates['token.height']=wh;

            
            
        }
    }

    wildOrExtra() {
        if (this.data?.data?.wildcard!==undefined || this.data?.data?.stats?.size!==undefined){
            let wild=this.actor.data.data.wildcard;
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
      //  gb.log(this.updates,'updates');
        this.actor.update(this.updates);
    }

}