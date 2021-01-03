import * as gb from './../gb.js';
export default class BasicRoll {

    constructor(){
       // this.rsCount=[];
        this.critical=null;
        this.raise=null;
        this.targetNumber=4;
        this.roll;
    }

    prepareModifier(modifier){
        modifier=parseInt(modifier) || 0;
        
        if (modifier>0){
            modifier=`+${modifier}`;
        } else if (modifier==0) {
            modifier='';
        }

        return modifier;
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
        rollExp=`{1d${dieType}x,1d${wildDie}}kh${this.prepareModifier(modifier)}`
    }

}

//console.log(rollExp);

    this.roll=new Roll(rollExp).roll();
  // console.log(this.roll);
    return this.roll;

   }

   buildDamageRoll(damage,modifier,raise){

    damage=this.explodeAllDice(damage);
  //  console.log(damage);
    let raiseAdd=''
    if (raise){
        raiseAdd='+1d6x'
    }
    
    this.roll=new Roll(`${damage}${raiseAdd}${this.prepareModifier(modifier)}`).roll();
   // console.log(this.roll);
   // console.log(this.roll._total);
    return this.roll;
   }

   explodeAllDice(weaponDamage){
    let regexDiceExplode = /d[0-9]{1,2}/g;
    weaponDamage = weaponDamage.replace(/x|=/g,'') /// remove x and = if it already has
    weaponDamage = weaponDamage.replace(regexDiceExplode, "$&x");
    return weaponDamage;
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

   isCritical(){

   }



}