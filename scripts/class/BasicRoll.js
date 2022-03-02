import * as gb from './../gb.js';
export default class BasicRoll {

    constructor(){
       // this.rsCount=[];
        this.critical=null;
        this.raise=null;
        this.targetNumber=4;
        this.roll;
        this.diceModifier='';
    }

    prepareModifier(modifier){
        modifier=parseInt(modifier) || 0;
        
        if (modifier>0){
            modifier=`+${modifier}`;
        } else if (modifier==0) {
            modifier='';
        }

        if (this.diceModifier){
            this.diceModifier=this.explodeAllDice(this.diceModifier);
        }

        return this.diceModifier+modifier;
    }


    addDiceModifier(dieMod){  
        
        dieMod=gb.stringDiceMod(dieMod);
        this.diceModifier+=dieMod;
        return dieMod;

    }


  buildRoll(dieType,wildDie,modifier=0,rof){

    if (!parseInt(rof)){
        rof=1;
    }
    
   
    
    let rollExp;
    if (rof>1){

        let rofExp='';
        let wildExp='';
        let mod=this.prepareModifier(modifier);

        if (typeof mod == "string" && mod.includes('d')){
         //   console.log(mod);
            mod=new Roll(mod).roll({async:false}).total;
            if (mod>0){
                mod='+'+mod;
            }

            this.addFlavor(`<div>${gb.trans('RoFFinalMod')}: ${mod}</div>`,true);
          //  console.log(mod);
        }
        
        
        
        for (let i=1;i<rof;i++){
            rofExp+=`,1d${dieType}x${mod}`
           
        }

        if (wildDie){
            wildExp=`,1d${wildDie}x${mod}`
        }
        

        rollExp=`{1d${dieType}x${mod}${rofExp}${wildExp}}`

    } else {

    
    if (!wildDie){
        rollExp=`1d${dieType}x${this.prepareModifier(modifier)}`;
    } else {
        rollExp=`{1d${dieType}x,1d${wildDie}x}kh${this.prepareModifier(modifier)}`
    }

}

//console.log(rollExp);


    this.roll=new Roll(rollExp).roll({async:false});

    
    this.addDiceFlavor(rof,wildDie);
   
    //this.roll.terms[0].dice[0].options.flavor='Skill';
    
  // console.log(this.roll);
    return this.roll;

   }


   addDiceFlavor(rof,wildDie){

        let wildkey;
     //   console.log(this.roll);

    

       if (rof>1){

        let i=0;
        if (this.skillName){
            while (i<rof){
            this.roll.terms[0].dice[i].options.flavor=this.skillName;
            i++;
            }
        }

        if (wildDie){
        this.roll.terms[0].dice[i].options.flavor=gb.trans('WildDie','SWADE');
        wildkey=i;
        }

       } else {
        if (this.skillName && wildDie){
            this.roll.terms[0].dice[0].options.flavor=this.skillName;
        } else {
            this.roll.terms[0].options.flavor=this.skillName;
        }
       
        if (wildDie){
        this.roll.terms[0].dice[1].options.flavor=gb.trans('WildDie','SWADE');
        wildkey=1;
        }

       }


       if (wildDie){
        this.colorWild(wildkey);
       }
       

       
   }

   colorWild(wildKey){
    if (!!game.dice3d){
      //  let colorPreset='none';
        const colorPreset = game.user.getFlag('swade', 'dsnWildDie') || 'none';
        if (colorPreset !== 'none') {
            this.roll.terms[0].dice[wildKey].options.colorset = colorPreset;
        }
            
    }
   }

   buildDamageRoll(damage,modifier,raise){

    damage=this.explodeAllDice(damage);
  //  console.log(damage);
    let raiseAdd=''
    if (raise){
        raiseAdd='+1d6x'
    }
    
    this.roll=new Roll(`${damage}${raiseAdd}${this.prepareModifier(modifier)}`).roll({async:false});
   // console.log(this.roll);
   // console.log(this.roll._total);
    return this.roll;
   }

   explodeAllDice(weaponDamage){
    return gb.explodeAllDice(weaponDamage);
   }

   raiseCount(targetNumber=4){ ///totalbonus => for vulnerable
    /* 
    <0=>Failure;
    0=>success
    1+=>raises (return number of raises) 
    */

    return gb.raiseCount(this.roll.total,targetNumber);

    /* let key=`${targetNumber}x${totalbonus}`

    if (this.rsCount[key]===undefined){

        let total=this.roll.total+totalbonus;
       
        this.rsCount[key]=Math.floor((total-targetNumber)/4)

        
    }

    return this.rsCount[key]; */


   }

   isSuccess(){
       
       if (this.raiseCount()>=0){
           return true;
       } else {
           return false;
       }
   }

   /* isCritical(){

   } */



}