import * as gb from './../gb.js';
import Char from './Char.js';
import CharRoll from './CharRoll.js';
import ItemRoll from './ItemRoll.js';

export default class RollControl {
    
    constructor(chat,html,user){

        this.chat=chat;
        this.html=html;
        this.roll=chat.rolls[0];
      //  console.log(chat);
        this.targetShow='';
        this.targetPrint=[];
        this.targetFunction=false;
        this.soakFunction;
        this.titleshow=false;
        this.gmmod=0;
        this.usegmtarget=false;

        this.user=user;
       // console.log(userId);
       // this.userid=userId;

      // console.log(this.chat);

        this.rolltype=this.chat.flags?.["swade-tools"]?.rolltype;

        

        //gb.log(this.chat.flags?.["swade-tools"],'flags');
    

        //this.actor;
        this.istoken=false;

        this.powerfail=null;

        
     
    }

   

    addEditButton(){
        if (game.user.isGM){

    
                this.html.find('.swadetools-relative .swadetools-rollbuttonwrap').append('<button class="swadetools-editroll swadetools-rollbutton" title="'+gb.trans('EditBtn')+'"><i class="fa fa-plus"></i></button> <button class="swadetools-raisecalc swadetools-rollbutton" title="'+gb.trans('RaiseCalcBtn')+'"><i class="fa fa-calculator"></i></button>').on('click','button.swadetools-editroll',()=>{
                    
                   
                    let htmltotal=this.getResults().join(',');
                    


                    let content=`<div class="swadetools-itemfulldata">
                    
                    <div><strong>${gb.trans('Total')}:</strong> ${htmltotal}</div> 
                   
                    
                    </div>
                    <div class="swadetools-formpart">
                    <div class="swadetools-mod-add"><label><strong>${gb.trans('Modifier')}</strong> <i class="far fa-question-circle swadetools-hint" title="${gb.trans('ModHint')}"></i></label></label><input type="text" id="mod" value=""></div>
                    </div>
                   `
        
                    new Dialog({
                        title: gb.trans('EditBtn'),
                        content: content,
                        default: 'ok',
                        buttons: {
                           
                            ok: {
                                label: `<i class="fas fa-plus"></i> ${gb.trans('EditBtn')}`,
                                callback: async (html)=>{
                                
                                    let gmmod=html.find("#mod")[0].value;
                                   // let gmtarget=html.find("#retarget")[0]?.checked;

                                    if (typeof gmmod == "string" && gmmod.includes('d')){
                                        let mod= await new Roll(gb.explodeAllDice(gmmod)).roll();
                                        gmmod=mod.total;
                                    }

                            

                                    if (gmmod!=''){
                          
                                    let update={};

                              
                                        
                                        update['flags.swade-tools.gmmod']=gmmod;
                                


                                  
                                    
                                    await this.chat.update(update);

                                
                                    }
                                    
                                    
                                }
                            }
            
                            
                        }
                    }).render(true);
                }).on('click','button.swadetools-raisecalc',()=>{
                    this.raiseCalcDialog();
                    
                 
                })
                
                if (this.chat.flags?.["swade-tools"]?.itemroll){
                this.html.find('.swadetools-relative .swadetools-rollbuttonwrap').append('<button class="swadetools-retarget swadetools-rollbutton" title="'+gb.trans('RetargetBtn')+'"><i class="fa fa-crosshairs"></i></button>').on('click','button.swadetools-retarget',async ()=>{

                    let targets=Array.from(game.user.targets);

                    if (targets.length<=0){

                        ui.notifications.warn(gb.trans('NoTarget'));

                    } else {
                    let update={}
                    
                                        let targetsave=new Array;
                                        targets.map(target=>{
                                            targetsave.push(target.id);
                                        })
                                        update['flags.swade-tools.usetarget']=targetsave.join(',');

                                        await this.chat.update(update);
                    }

                });
            }
            }
      //  }
    }

    raiseCalcDialog(targetNumber=4){

        let total=this.roll.total+this.gmmod;
        let raiseStr;
        let raises=gb.raiseCount(total,targetNumber);
        if (raises==0){
            raiseStr=gb.trans('Success');
        } else
        if (raises<0){
            raiseStr=gb.trans('Failure')
        } else {
            raiseStr=gb.trans('Raises')+': '+raises;
        }
       let content=`<div class="swadetools-itemfulldata">
       <div class="swadetools-2grid">
       <div><strong>${gb.trans('Total')}:</strong> ${total}</div> <div><strong>${raiseStr} (${gb.trans('TN')}: ${targetNumber})</strong></div>
       </div>
       <div class="swadetools-formpart">
       <div class="swadetools-mod-add"><label><strong>${gb.trans('TargetNumber')}:</strong></label> <input type="text" id="targetNumber" value=""></div></div>`

        new Dialog({
            title: gb.trans('RaiseCalcBtn'),
            content: content,
            default: 'ok',
            buttons: {
                ok : {
                    label: gb.trans('RaiseCalcBtn'),
                    callback: (html) => {
                        this.raiseCalcDialog(html.find("#targetNumber")[0].value)
                    }
                }
            }

                
          
        }).render(true);
        
    }

    addButtons(){
        if (this.rolltype!==undefined){ ///roll comes from swade tools
            this.html.append('<div class="swadetools-relative"><div class="swadetools-rollbuttonwrap"></div></div>');
            if (!this.isCritical() || gb.settingKeyName('Dumb Luck') || gb.systemSetting('dumbLuck')){
                this.addBennyButton();
                this.addFreeRerollButton();
            }

            if (!this.isCritical()){
                this.addEditButton();
            }
            

        }
    }

   
    getResults(){
        let rof=1;
           if (this.chat.flags?.["swade-tools"]?.userof){
            rof=this.chat.flags?.["swade-tools"]?.userof
            }

            let totaldice=[];

            if (rof>1){
                let results=this.roll.terms[0].results;
                
                results.map(r=>{
                    totaldice.push(r.result)
                })
               }  else {
                   totaldice.push(this.roll.total)
               }

               return totaldice;
    }

    async doActions(){

     //   console.log('calling do actions');

        
     

        if (this.chat.flags?.["swade-tools"]?.gmmod){
            this.gmmod=gb.realInt(this.chat.flags["swade-tools"].gmmod)

           // let total=this.gmmod+this.roll.total;

          //  console.log(this.chat.content,this.chat.data.content);

           // $($0).html('11')
           
           this.html.find('.flavor-text').append('<div>'+gb.trans('GMMod')+': '+gb.stringMod(this.gmmod)+'</div>').ready(()=>{
            this.scrollChat();
        })

           let modstr='+';
           if (this.gmmod<0){
               modstr='-';
           }

           let totaldice=this.getResults();

           setTimeout(()=>{ /// silver tape roll prints after

            
          //  
        let totalhtml='';
          totaldice.forEach(t=>{
              t+=this.gmmod;
              totalhtml+=`<div class="dice">${t}</div>`
          })

          this.html.find('.message-content .dice-total').html(totalhtml);

           // this.html.find('.dice-formula').append('<div class="modifier"><label style="color:black">'+modstr+'</label></div><div class="modifier"><label style="color:black">'+Math.abs(this.gmmod)+'</label></div>')  /// removed due to swade system 2.3


            this.html.find('.formula-list').append('<li>'+modstr+'</li><li>'+Math.abs(this.gmmod)+'</li>') 
           
        },500)  
           
         //  this.html.find('.message-content').append('<div class="swadetools-gmmodtotal dice-roll"><span class="swadetools-gmmodtotalnumber dice-total">'+total+'</span></div>');
         //  console.log(this.html.html());
           // this.html.append('<div class="rolltotal">10</div>');
           // this.html.css('background','yellow');
        }

       
        this.addButtons();
        
        
        
        if (!this.isCritical()){
           // this.addBennyButton();
            this.findTargets();
        } else {

            

           /*  if (gb.settingKeyName('Dumb Luck')){
                this.addBennyButton();
            } */
            this.html.append('<div class="swadetools-criticalfailure">'+gb.trans('CriticalFailure')+'</div>').ready(()=>{
                this.scrollChat();
            })
        }

      //  console.log(this.chat.data.flags['swade-tools']);
     
         if (this.rolltype=='skill' && this.chat.flags['swade-tools'].userof>1){ ///hide total for rof  
            this.html.find('.dice-total').css('color','transparent');
        } 
       
            await this.statusRolls();
        
        
    }

    async statusRolls(){
        
        
        if (this.rolltype=='unshaken'){
            await this.unshaken();
        } else if (this.rolltype=='unstunned'){
            await this.unstunned();
        }
    }

    async unstunned(){

        let actor=this.getActor(true);

        /* let actorid=this.chat.data.flags["swade-tools"].useactor;
        let actor=game.actors.get(actorid); */


        
        let raisecount=gb.raiseCount(this.roll.total+this.gmmod);

        let content=`<div class="swadetools-chatadd-status">`;

        let result='failure';

        if (raisecount==0){
            
         //   console.log('unstun');

           result='success';
          
          


           content+=`<div>${actor.name} ${gb.trans("RemStunnedSuc")}</div>`;
            

                     

        } else if (raisecount>0){
           
            result='raise';

            content+=`<div>${actor.name} ${gb.trans("RemStunnedRaise")}</div>`;
          //  char.say(gb.trans("RemStunnedRaise"))
        } else {
            /// failure
            content+=`<div>${actor.name} ${gb.trans("StillStunned")}</div>`;
           // char.say(gb.trans('StillStunned'));
        }

        content+=`</div>`;

        let char=new Char(actor,this.istoken);

        

        this.html.append(content).ready(()=>{
            this.scrollChat();
            
            if (gb.mainGM()){
            if (result=='success'){
                char.off('isStunned')
                setTimeout(()=>{ /// silver tape to avoid bug
                    char.updateData({'status.isVulnerable':true})
                   // actor.update({'data.status.isDistracted':true,'data.status.isVulnerable':true})
                },500)   
            } else if (result=='raise'){
                char.off('isStunned');
                setTimeout(()=>{ /// silver tape to avoid bug
                    char.updateData({'status.isVulnerable':true})
                   // actor.update({'data.status.isDistracted':true,'data.status.isVulnerable':true})
                },500)
              //  char.updateData({'status.isDistracted':false,'status.isVulnerable':true})/// just to make sure is disabled
              gb.setFlagCombatant(game.combats.get(this.chat.flags?.["swade-tools"]?.usecombat),{id:this.chat.flags?.["swade-tools"]?.usecombatant},'swade-tools','removeVulnerable',true)   //EternalRider: I don't know why the 0 in my test will not work
            //    game.combats.get(this.chat.data.flags?.["swade-tools"]?.usecombat).updateCombatant({_id:this.chat.data.flags?.["swade-tools"]?.usecombatant,['flags.swade-tools.removeVulnerable']:1});
              //  actor.update({'data.status.isDistracted':false,'data.status.isVulnerable':false}) /// just to make sure is disabled
            }
            }
        });
    }


    async unshaken(){
      //  let actorid=this.chat.data.flags["swade-tools"].useactor;
        let actor=this.getActor(true);
       // console.log(actor);
       // console.log(this.istoken);

        let char=new Char(actor,this.istoken);

        let total=this.roll.total+this.gmmod;

        let raisecount=gb.raiseCount(total);
        let content=`<div class="swadetools-chatadd-status">`;
        let shakenremove=false;

            if (raisecount>=0){
               shakenremove=true;
               
                content+=`<div>${actor.name} ${gb.trans("RemShaken")}</div>`;
               
            } else {
                if (char.bennyCount()){
                    
                    content+=`<div><button class="swadetools-simplebutton swadetools-unshake-button">${gb.trans('UnshakenBennyButton')}</button></div>`
               //     char.say()
    
                } else {

                    content+=`<div>${gb.trans('NoBennies')}, ${gb.trans('StillShaken')}</div>`
                   // char.say()
                } 
            }

            content+=`</div>`;

            this.html.append(content).on('click','button.swadetools-unshake-button',()=>{
             //   let actor=game.actors.get(argsArray[0]);
       
               // let char=new Char(actor);
        
                if (char.is('isShaken')){
                if (char.spendBenny()){
                    char.off('isShaken');
                    char.say(gb.trans("RemShaken"));
                }} else {
                    ui.notifications.warn(gb.trans('NotShaken'));
                }
            }).ready(()=>{
                this.scrollChat();


                if (shakenremove && gb.mainGM()){
                    char.off('isShaken');
                }
            })
    }

    scrollChat(){
        ui.chat.scrollBottom()/// force scroll
    }

   async findTargets(){
        if (this.chat.flags["swade-tools"]?.itemroll || this.rolltype=='soak'){ /// show only for items (weapons, powers) and soak

            let rolltype=this.rolltype;
            let rof=this.chat.flags["swade-tools"].userof;



            if (this.chat.flags["swade-tools"].usetarget){

                let usetargets=this.chat.flags["swade-tools"].usetarget.split(',');
                this.targets=new Array;

                usetargets.map(target=>{
                    this.targets.push(canvas.tokens.get(target))
                })
               // this.targets=[canvas.tokens.get(this.chat.flags["swade-tools"].usetarget)];
              //  console.log(this.targets);
              //  console.log(rolltype)
            } else {
              // console.log(this.user);
                this.targets=Array.from(this.user.targets);
                let targetsave=new Array;
                this.targets.map(target=>{
                    targetsave.push(target.id);
                })

                if (gb.mainGM()){ // only main GM update chat
                await this.chat.update({'flags.swade-tools.usetarget':targetsave.join(',')})
                }
            }
            

          //  console.log(this.targets);
            if (this.targets && this.targets.length>0){
                this.targets.map(target=>{
                // let raise=false;
                    if (rolltype=='skill'){

                        

                        if (rof<2){
                            this.attackTarget(target,this.roll.total,1);
                        } else {

                            let results=this.roll.terms[0].results;

                           // results.sort((a, b) => (a.result < b.result) ? 1 : -1)
                            let i=0;
                            results.map(result=>{
                                i++
                                this.attackTarget(target,result.result,i);
                            })
                           
                            
                        }
                        
                        
                        

                    } else if (rolltype=='damage'){
                        this.damageTarget(target);
                        

                        
                    } else if (rolltype=='soak'){

                        let unstoppable=false;
                        let prevWounds=this.chat.flags["swade-tools"].wounds;

                        if (this.chat.flags["swade-tools"]?.unstoppable_wounds){
                            prevWounds=this.chat.flags["swade-tools"].unstoppable_wounds
                            unstoppable=true;
                        } 
                     
                        this.damageTarget(target,this.soak(prevWounds),unstoppable);
                    }

                   
                   // this.addTargetInfo();
                })


                if (rolltype=='skill'){

                    this.targetShow+=`<div class="swadetools-target-title">${gb.trans('TargetsTitleSkill')}. `

                    if (rof>1){
                        this.targetShow+=gb.trans('TipRoFLower')
                    }
                    /* if (rof>1){
                        print+=`${gb.trans('TipRofRoll')}. `;
                        if (game.user.isGM){
                            print+=`${gb.trans('TipTargetNumber')}.`;
                        }
        
                    } */
        
                   
        
                    this.targetShow+=`</div>`

                    if (rof>1){

                        this.targetPrint.sort((a, b) => (a.total < b.total) ? 1 : (a.total === b.total) ? ((a.rof > b.rof) ? 1 : -1) : -1 )
                       // this.targetPrint.sort((a, b) => (a.total < b.total) ? 1 : -1);

                       // console.log(this.targetPrint);
                        let rofnumb=null;
                        let i=0;
                        this.targetPrint.forEach((item)=>{
                           
                            let stop=false;
                            
                            if (item.rof!=rofnumb){
                                if (rofnumb!==null){
                                    this.targetShow+='</div></div>' /// close previous swadetools-rof-wrap div
                                }                                
                                i++;

                                if (i>rof){ /// dont show lower result -> num result = num rof
                                    stop=true;
                                }

                                if (!stop){
                                this.targetShow+=`<div class="swadetools-rof-wrap"><div class="swadetools-rof-total"><span class="swadetools-rof-totalwrap">${item.total}</span></div><div class="swadetools-rof-results">`;
                                rofnumb=item.rof;
                                }
                            }

                            if (!stop){
                                this.targetShow+=item.print;
                            }
                            
                           

                        })

                        this.targetShow+='</div></div>' ///close swadetools-rof-wrap

                    } else {
                        this.targetPrint.forEach((item)=>{
                            this.targetShow+=item.print;
                        });
                    }
                   
                    this.targetShow=`<div class="swadetools-wrapper">`+this.targetShow+'</div>';
                    
                    this.html.append(this.targetShow).on('click','a.swadetools-rolldamage',(event)=>{
                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));

                        if ($(el).parents('.swadetools-rof-wrap').length>0){
                            $(el).parents('.swadetools-rof-wrap').first().addClass('swadetools-rof-disable').find('a').removeClass('swadetools-rolldamage');
                            //this.html.find('.swadetools-rof-wrap').off('click','a.swadetools-rolldamage');
                        }

                        
                        this.targetFunction(targetid,raise);


            
                    }).on('click','a.swadetools-situational-link',(event)=>{
                        let el=event.currentTarget;
                        $(el).closest('.swadetools-targetwrap').find('.swadetools-situational-info').slideToggle();

                        


                    }).on('mouseenter','a.swadetools-rolldamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid);

                    }).on('mouseleave','a.swadetools-rolldamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid,false);

                    }).ready(()=>{
                          
                        this.scrollChat();/// force scroll                  
                        
                    })
                } else if (rolltype=='damage' || rolltype=='soak'){
                    this.html.append(this.targetShow).on('click','a.swadetools-applydamage',(event)=>{
                        
                        let el=event.currentTarget;

                        /// testing -> ALLOW SAME DAMAGE ROLL TO MULTIPLE TARGETS
                        
                        $(el).removeClass('swadetools-applydamage').attr('disabled','disabled');
                       // $(el).parent().find('.swadetools-soakdamage').removeClass('swadetools-soakdamage').attr('disabled','disabled');
                       // this.html.find(el).off('click');

                        // this.html.find('a.swadetools-applydamage').attr('disabled','disabled');                     
                      ///  this.html.off('click','a.swadetools-applydamage');  
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));
                        this.targetFunction(targetid,raise);
                       

                       
            
                    }).on('mouseenter','a.swadetools-applydamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid);

                    }).on('mouseleave','a.swadetools-applydamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid,false);

                    }).on('click','a.swadetools-soakdamage',(event)=>{
                        let el=event.currentTarget;

                        $(el).attr('disabled','disabled').removeClass('swadetools-soakdamage');
                      /*   $(el).attr('disabled','disabled');
                        this.html.off('click','a.swadetools-soakdamage'); */
                        let targetid=$(el).attr('data-swadetools-targetid');
                        let raise=gb.realInt($(el).attr('data-swadetools-raise'));
                       // let unstoppable_wounds=gb.realInt($(el).attr('data-swadetools-unstoppable'));
                        this.soakFunction(targetid,raise);
                    }).on('mouseenter','a.swadetools-soakdamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid);

                    }).on('mouseleave','a.swadetools-soakdamage',(event)=>{

                        let el=event.currentTarget;
                        let targetid=$(el).attr('data-swadetools-targetid');
                        gb.hoverToken(targetid,false);

                    }).on('click','a.swadetools-situational-link',(event)=>{
                        let el=event.currentTarget;
                        $(el).closest('.swadetools-targetwrap').find('.swadetools-situational-info').slideToggle();

                        


                    }).ready(()=>{
                        this.scrollChat();
                     })
                }

            }
        }
    }


    soak(wounds){

        let raises=gb.raiseCount(this.roll.total+this.gmmod);
                if (raises>=0){
                    wounds=wounds-(raises+1);

                }

                return wounds;

              //  this.damageTarget(target,wounds);
    }

   /*  addTargetInfo(){
        let rolltype=this.chat.data.flags["swade-tools"].rolltype;
        if (rolltype)
        
    } */

    getItemOwner(){
        if (this.chat.flags["swade-tools"]?.usevehicle){
            if (this.chat.flags["swade-tools"]?.usevehicletoken){
                return canvas.tokens.get(this.chat.flags["swade-tools"].usevehicletoken).actor;
            } else {
                return game.actors.get(this.chat.flags["swade-tools"].usevehicle);
            }
            
        } else {
            return this.getActor();
        }
    }
    

    getActor(orToken=false,useVehicle=false){
        
            if (this.chat.flags["swade-tools"]?.usetoken){
                let tokenid=this.chat.flags["swade-tools"].usetoken
              //  console.log('token',tokenid);
                this.istoken=true;
                if (orToken){
                    
                    return canvas.tokens.get(tokenid)
                } else {
                    return canvas.tokens.get(tokenid).actor
                }

                
                
            } else {
                let actorid=this.chat.flags["swade-tools"].useactor
                if (useVehicle && this.chat.flags["swade-tools"]?.usevehicle){
                    actorid=this.chat.flags["swade-tools"].usevehicle
                }
              //  console.log('actor',actorid);
                if (orToken){
                    return canvas.tokens.placeables.filter(el=>el?.actor?.id==actorid)[0]
                } else {
                    return game.actors.get(actorid);
                }
                
            }
        

       
    }


    failedPower(item){
       // gb.log(item);
        if (this.powerfail===null && item.type=='power'){
            let rof=this.chat.flags["swade-tools"].userof;
            this.powerfail=true;
            
            if (rof<2){
                if (gb.raiseCount(this.roll.total,4)>=0){
                    this.powerfail=false;
                } 
            } else {

                let results=this.roll.terms[0].results;
                //console.log(results);
               // results.sort((a, b) => (a.result < b.result) ? 1 : -1)
               
                results.map(result=>{
                    if (gb.raiseCount(result.result,4)>=0){
                        this.powerfail=false;
                    }
                })
               
                
            }
        }

        return this.powerfail;
    }


    getParry(actor){
        if (actor.type=='vehicle'){
           let skill=gb.getDriverSkill(actor);        
         //  console.log(skill);   
           let item=gb.getDriver(actor).items.filter(el=>el.type=='skill' && el.name==skill)[0];
           let skillValue;
           if (!item){
            skillValue=0;
           } else {
            skillValue=gb.realInt(item.system.die.sides)+gb.realInt(item.system.die.modifier)
           }
           
           return Math.floor(skillValue/2)+gb.realInt(actor.system.handling)+2;
        } else {
            return gb.realInt(actor.system.stats.parry.value)+gb.realInt(actor.system.stats.parry.modifier)
        }
    }


    getSize(actor){
        if (actor.type=='vehicle'){
            return actor.system.size;
        } else {
            return actor.system.stats.size
        }
    }

    attackTarget(target,total,rofnumb){
        
        
        total+=this.gmmod;
        
        let itemid=this.chat.flags["swade-tools"].itemroll;
        let item=this.getItemOwner().items.get(itemid);

      //  gb.log(item,'item');

        let rof=1;

        let print='';
        
        let targetInfo='';
        
       // let rof=this.chat.data.flags["swade-tools"].userof;

        

        /* if (this.chat.data.flags["swade-tools"]?.usetoken){
            let tokenid=this.chat.data.flags["swade-tools"].usetoken
            item=canvas.tokens.get(tokenid).actor.items.filter(el=>el.id==itemid)[0];
        } else {
            let actorid=this.chat.data.flags["swade-tools"].useactor
            item=game.actors.get(actorid).items.get(itemid);
        } */

     //   let actorid=this.chat.data.flags["swade-tools"].useactor;
        
        
        let addTarget='miss';
        let raise=0;
        let rollDmg=false;
       // let item=game.actors.get(actorid).items.get(itemid);

       //  console.log(game.actors.get(actorid));
        /*
        if (!item) { /// check for synthetic actor
             item=game.actors.get(actorid).actorData.items.filter(el=>el.id==itemid)[0];
        } */


        let skill=this.chat.flags["swade-tools"].skill;

        

       // let vulBonus=0;
      // let vulIcon='';
       
        let powertype=false;

        if (item.type=='power') {

            if ((!item.system.damage)){ /// damaging powers
                powertype='nodamage';
            } else if (item.system?.templates?.cone || item.system?.templates.large || item.system?.templates?.medium || item.system?.templates?.small || item.system?.templates?.stream){  /// template powers
                powertype='template'
            } 
           
        }

       
       
      let raisecount;

       
        let targetNumber=4;
        let gangup=0;


   
        let char=new Char(target.actor);
        /// range, gangup

        if (!powertype){
        let targetRange=gb.getRange(this.getActor(true,true),target)*canvas.dimensions.distance; /// use Grid Scale for distance (but not for gang up)

       // console.log(targetRange);
       
       
        if 
        //(  ====> exclude vehicle removed
         ///   !this.chat.flags["swade-tools"]?.usevehicle && 
        (skill==gb.setting('fightingSkill') || targetRange==1)
       // )
        {
          //  targetNumber=gb.realInt(target.actor.data.data.stats.parry.value)+gb.realInt(target.actor.data.data.stats.parry.modifier)

          //console.log(target.actor);
          targetNumber=this.getParry(target.actor);

        //  console.log(targetNumber);
            if (skill!=gb.setting('fightingSkill')){
                //Ranged Weapons in Melee
                targetInfo+=`<li>${gb.trans('RangedInMelee')}</li>`;
            } else {
                /// using Fighting
                if (gb.setting('gangUp')){
                    let gangup=this.gangUp(this.getActor(true),target);
                    if (gangup>0){

                        let reason='';
                       // let char=new Char(target.actor);
                        if (char.hasEdgeSetting('Improved Block')){
                            gangup-=2
                            reason=` (${gb.settingKeyName('Improved Block')})`
                        } else if (char.hasEdgeSetting('Block')){
                            gangup-=1
                            reason=` (${gb.settingKeyName('Block')})`
                        }

                        if (gangup<0){
                            gangup=0;
                        }


                        targetNumber-=gangup;
                        targetInfo+=`<li>${gb.trans('gangUpBonus')}: +${gangup}${reason}</li>`;

                        
                    }
                }
            }
        } else {

        //// ranged attack or vehicle

            

           
            if (char.hasEdgeSetting('Dodge')){
                targetNumber+=2;
                targetInfo+=`<li>${gb.settingKeyName('Dodge')}: -2`
            }

            


            if (!gb.setting('ignoreRange') && item.system?.range.includes('/')){
                let distances=item.system.range.split('/')
                
                let distancemod=0;
                let toofar=false;
                let extreme='';
                let i=1;
               // console.log(targetRange);
                distances.forEach(dist=>{
                    dist=gb.realInt(dist);
                    if (dist>0 && targetRange>Math.abs(dist)){
                        if (i<3){
                            distancemod+=2

                        } else {
                            
                            extreme=` (${gb.trans('Extreme')})`;
                            distancemod=8;
                            if (targetRange>dist*4){
                                toofar=true;
                               
                            }
                            
                        }
                        
                    }
                    
                    i++
                })

                if (distancemod){
                    if (toofar){
                        raisecount=-1;  // autofail 
                        targetInfo+=`<li>${gb.trans('TargetTooFar')}</li>`;
                    } else {
                        targetNumber+=distancemod;
                        targetInfo+=`<li>${gb.trans('Range._name','SWADE')}: -${distancemod}${extreme}</li>`;
                    }
                }
            }


            if (gb.setting('autoCover')){
                /// cover
                let coveritems=target.actor.items.filter(el=>el.system.equipStatus==3 && el.system.cover<0);
               // let finalcover = Math.min(...coveritems.map(item => item.cover));
                let finalcover=0;
                let itemname='';
    
                /// find lowest cover
                coveritems.map(item=>{
                    if (item.system.cover<finalcover){
                        finalcover=item.system.cover;
                        itemname=item.name;
                    }
                })
    
                if (finalcover<0){
                    let coverBonus=Math.abs(finalcover);
                    targetNumber+=coverBonus;
                    targetInfo+=`<li>${itemname}: -${coverBonus}`
                }
    
                }
            
        }


        /// combat acrobat both ranged and melee
        
        if (char.hasEdgeSetting('Combat Acrobat')){
            targetNumber+=1;
            targetInfo+=`<li>${gb.settingKeyName('Combat Acrobat')}: -1`
        }

        if (char.hasAbilitySetting('Rifts Uncanny Reflexes')){
            targetNumber+=2;
            targetInfo+=`<li>${gb.settingKeyName('Rifts Uncanny Reflexes')}: -2`
        }

        /// scale 
        if (gb.setting('useScale')){
            
            let atScale=gb.getScale(this.getSize(this.getActor(false,true)));
            let dfScale=gb.getScale(this.getSize(target.actor));

            let diffScale=dfScale-atScale;

            let showSwat='';
            if (diffScale<0 && this.chat.flags["swade-tools"]?.useswat){
                if (diffScale>=-4){
                    diffScale=0;
                } else {
                    diffScale+=4;
                }
                showSwat=` (${gb.trans('SwatSetting')})`;
            }

            if (diffScale){

                

                targetNumber-=diffScale;
                
                if (diffScale>0){
                    diffScale='+'+diffScale; // for writing
                }
                targetInfo+=`<li>${gb.trans('Scale')}: ${diffScale}${showSwat}</li>`;
            }

            /* if (atScale<dfScale){
                /// attacker is smaller - bonus
               

            } else if (atScale>dfScale){
                /// attacker is bigger - penalty

            } */
        }


       
       


    }


    if (powertype!='template' && char.is('isVulnerable')){
        targetInfo+=`<li>${target.name} ${gb.trans('IsVulnerable')}: +2</li>`;
         targetNumber-=2;
     }
        //// distance modifier

      //  console.log(this.failedPower(item));
        
        if (this.failedPower(item)) { /// failed power
            raisecount=-1 /// force failure
        } else {

            
    
            
            if (rof<2){
                raisecount=gb.raiseCount(total,targetNumber);
            }
            
        }

        

     //   console.log(raisecount);
        if (rof<2 && raisecount>=0){
            rollDmg=true;
            addTarget='hit';
            if (raisecount>0){
                addTarget='raise';
                raise=1;
            }
        } 

        


       

       
        if (rof>1){
           
            addTarget='rof';
        }

        print+=`<div class="swadetools-targetwrap  swadetools-term-${addTarget}">`

       
        //data-swade-tools-action="rollTargetDmg:${this.actor._id},${this.itemid},${target.id},${raise}"

      /*   if (rof>1){

            /// totaldie= this.roll.terms[0].results[i].result
            let showTargetNumber='';
            let showRaiseTargetNumber='';
            if (game.user.isGM){
                showTargetNumber=` (${targetNumber})`
                showRaiseTargetNumber=` (${targetNumber+4})`
            }
            print+=`<i class="fas fa-bullseye"></i><div class="swadetools-targetname">${target.name}: <a class="swadetools-rolldamage swadetools-rof-hit" data-swadetools-raise=0 data-swadetools-targetid="${target.id}">${gb.trans('Targethit')}${showTargetNumber}</a> <span class="swadetools-bar">|</span> <a class="swadetools-rolldamage swadetools-rof-raise" data-swadetools-raise=1 data-swadetools-targetid="${target.id}">${gb.trans('Targetraise')}${showRaiseTargetNumber}</a></div>`

        } else { */

        if (rollDmg){
            let raiseInt=0;
            if (raise){
                raiseInt=1;
            }
            print+=`<a class="swadetools-rolldamage swadetools-rolldamage-style" data-swadetools-raise=${raiseInt} data-swadetools-targetid="${target.id}" title="${gb.trans('RollDamage')}"><i class="fas fa-bullseye"></i>`
        } else {
            print+=`<i class="fas fa-times-circle"></i>`;
        }

        print+=`<div class="swadetools-targetname">${target.name}: ${gb.trans('Target'+addTarget)}</div>`
        
        if (rollDmg){
            print+=`</a>` 
        }
   // }


        if (targetInfo){

            let displaycss=' style="display:none" ';
            if (gb.setting('alwaysShowSituational')){
                displaycss='';
            }
            print+=`<a class="swadetools-situational-link" title="${gb.trans('SeeSituational')}"><i class="fa fa-question-circle"></i></a><div class="swadetools-situational-info" ${displaycss}><ul>${targetInfo}</ul></div>`;
        }
    

        print+=`</div>`;


        this.targetPrint.push({rof:rofnumb,total:total,print:print})


        if (!this.targetFunction){

        this.targetFunction= async (targetid,raiseDmg)=>{

          //  console.log(target);

         //   let actor=game.actors.get(actorid);
          //  let target=target;
           // let item=actor.items.get(argsArray[1]);



           if (this.getActor().permission!=3 || this.getItemOwner().permission!=3){
            ui.notifications.error(gb.trans('PermissionActor'))
            return false;
           }
      
           
            let charRoll=new ItemRoll(this.getItemOwner(),item);

            if (this.chat.flags["swade-tools"]?.usevehicle){
                charRoll.usingVehicle(this.getItemOwner());
            }

            if (this.chat.flags["swade-tools"]?.wildattack){
                let wildDmg=2;
                if (this.getActor().getFlag('swade','wildAttackDamage')!==undefined){
                    wildDmg=gb.realInt(this.getActor().getFlag('swade','wildAttackDamage'));
                }
                charRoll.addModifier(wildDmg,gb.trans('WildAttack'));
            }


             //pack tactics handle - thanks to EternalRider
             let charAct=new Char(this.getActor());
             if (gb.setting('gangUp') && gangup>0 && charAct.hasAbilitySetting('Pack Tactics')) {
                 charRoll.addModifier(gangup,gb.trans('PackTacticsSetting'));
             }

            if (this.chat.flags["swade-tools"]?.desperateattack){
                let despmod=0-gb.realInt(this.chat.flags["swade-tools"].desperateattack)
                charRoll.addModifier(despmod,gb.trans('DesperateAttack'));
            }

            charRoll.useTarget(targetid);
            if (raiseDmg){
                charRoll.raiseDmg();
            }

            if (this.chat.flags["swade-tools"]?.usecalled){
                charRoll.addFlag('usecalled',this.chat.flags["swade-tools"].usecalled);

                /* if (this.chat.data.flags["swade-tools"].usecalled=='Head'){
                    charRoll.addModifier(4,gb.trans('CalledShot')+ ' ('+gb.trans('Head','SWADE')+')')
                } */
            }


            if (this.chat.flags["swade-tools"].damageaction){
                await charRoll.rollAction(this.chat.flags["swade-tools"].damageaction)
            } else {
                await charRoll.rollBaseDamage();
            }

            
          //  charRoll.combatRoll(argsArray[1]);
          //  charRoll.damageTarget(target);
           //   charRoll.addFlavor(item.name);
           /*    charRoll.addModifier(item.data.data.actions.dmgMod,gb.trans('ModItem'));
              
            charRoll.rollDamage(`${item.data.data.damage}`); */
            charRoll.display();
        }
        }
    }

    damageTarget(target,newWounds=null,unstoppable=0){
        let applyDmg=false;
        let raisecount;
        let soakClass='';
        let isvehicle=false;
        let area='torso';
        let total=this.roll.total+this.gmmod;
        let targetInfo='';
       // let unstoppable=0;
        
        

        if (newWounds===null){
      
        let itemid=this.chat.flags["swade-tools"].itemroll;
        let item=this.getItemOwner().items.get(itemid);
      


      if (this.chat.flags['swade-tools'].usecalled){ // called shot
        area=this.chat.flags['swade-tools'].usecalled;
    }

    
      /// heavy armor check
      if (gb.isHeavyArmor(target.actor,area) && !item?.system?.isHeavyWeapon){ //heavy armor but no heavy weapon
        raisecount=-1 // no damage
        targetInfo+=`<li>${gb.trans('HeavyArmorWarn')}</li>`;
      } else {

        let toughness;
        let armor;
        if (target.actor.type=='vehicle'){
            toughness=gb.realInt(target.actor.system.toughness.total);
            armor=gb.realInt(target.actor.system.toughness.armor);
            isvehicle=true;
        } else {
            toughness=gb.realInt(target.actor.system.stats.toughness.value);
           
         
           
               armor=gb.realInt(gb.getArmorArea(target.actor,area)) 

               
               toughness=toughness-gb.getArmorArea(target.actor)+armor; /// remove default armor, add location armor to final toughness
           
            
              

        }

 
     
     /// adds AP
        let apextra=0;
        if (item.system.ap){

            let useAp=item.system.ap

            if (this.chat.flags["swade-tools"]?.useaction) {
                let actionKey=this.chat.flags["swade-tools"].useaction
                if (item.system.actions.additional[actionKey]?.ap){
                    useAp=item.system.actions.additional[actionKey].ap
                }
            }

            apextra=gb.realInt(useAp);

            let useactor=this.getItemOwner();

            if (useactor?.system?.stats?.globalMods?.ap && useactor?.system?.stats?.globalMods?.ap.length > 0) {
                useactor?.system?.stats?.globalMods?.ap.forEach(el => {
                    apextra=apextra+el.value
                });

                if (apextra<0){
                    apextra=0
                }
            }
           
            if (apextra>armor){
                apextra=armor;
            }
        }


       
     
         raisecount=gb.raiseCount(total,toughness-apextra);
    }
        } else {
            raisecount=newWounds; 

            if (raisecount==0){ //0 wounds
                raisecount=-1  ///not even shaken
            } 

            if (unstoppable && raisecount>1){
                raisecount=1;
            }
        }
     //   console.log(toughness+armor);
     //   console.log(raisecount);
        let addTarget='none';

        
        

        if (raisecount>=0){
            applyDmg=true;
            
            addTarget='shaken';
            
            
            
            if (raisecount>0){

                if(raisecount>4 && (gb.settingKeyName('Wound Cap') || gb.systemSetting('woundCap'))){
                    raisecount=4;
                }
                addTarget='wounds';
            }

            ///unstoppable
            
            if (raisecount>1){
                let char=new Char(target.actor);                
                
                if (char.hasAbilitySetting('Unstoppable')){

                    let attackerIsJoker=false;
                    if (this.chat.flags?.["swade-tools"]?.useactor){
                        if (gb.actorIsJoker(game.actors.get(this.chat.flags["swade-tools"].useactor))){
                            attackerIsJoker=true;
                        }
                    }


                    if (!attackerIsJoker){

                        unstoppable=raisecount;
                        raisecount=1;
                        
                    }                
                    
                }
            }
        } 

      
        let addTargetTxt=addTarget
        if (addTarget=='wounds'){
            let s='';
            if (raisecount>1){
                s='s';
            }

            addTargetTxt=`${raisecount} ${gb.trans('Targetwound'+s)} `

           if (isvehicle){
            addTargetTxt+=`+ ${gb.trans('Targetshakenvehicle')}`;
           } else {
            addTargetTxt+=`+ ${gb.trans('Targetshaken')}`;
           }
            
            

        } else {
            if (isvehicle && addTarget=='shaken'){
                addTargetTxt=gb.trans('Targetshakenvehicle');
            } else {
                addTargetTxt=gb.trans('Target'+addTarget);
            }
           
        }

        let driverHasAce=false;

        if (isvehicle){
            let driver=new Char(gb.getDriver(target.actor));
            if (driver.hasEdgeSetting('Ace')){
                driverHasAce=true;
            }
        }

        if ((!isvehicle || driverHasAce) && applyDmg && addTarget=='wounds' && newWounds===null){
            soakClass=' swadetools-damage-with-soak';
        }


        if (!this.titleshow){
            this.targetShow+=`<div class="swadetools-target-title">${gb.trans('TargetsTitleDamage')}</div>`
            this.titleshow=true;
        }

        this.targetShow+=`<div class="swadetools-targetwrap swadetools-term-${addTarget}${soakClass}">`

       

        if (applyDmg){
            ///data-swade-tools-action-once=1 data-swade-tools-action="applyTargetDmg:${target.id},${raisecount}"
            this.targetShow+=`<a class="swadetools-applydamage swadetools-chat-dmg-button" title="${gb.trans('ApplyDamage')}" data-swadetools-raise=${raisecount} data-swadetools-targetid="${target.id}"><i class="fas fa-tint"></i>`
        } else {
            this.targetShow+=`<i class="fas fa-times-circle"></i>`;
        }



        this.targetShow+=`<div class="swadetools-targetname">${target.name}: ${addTargetTxt}</div>`
        
        if (applyDmg){
            this.targetShow+=`</a>`
            if (soakClass){ 
                this.targetShow+=`<a class="swadetools-soakdamage swadetools-chat-soak-button" data-swadetools-raise=${raisecount} data-swadetools-targetid="${target.id}" title="${gb.trans('SoakDmg')}"><i class="fas fa-tint-slash"></i></a>`;
            }
        }


        if (targetInfo){

            let displaycss=' style="display:none" ';
            if (gb.setting('alwaysShowSituational')){
                displaycss='';
            }
            this.targetShow+=`<a class="swadetools-situational-link" title="${gb.trans('SeeSituational')}"><i class="fa fa-question-circle"></i></a><div class="swadetools-situational-info" ${displaycss}><ul>${targetInfo}</ul></div>`;
        }
        
        this.targetShow+=`</div>`;


        this.soakFunction=async (targetid)=>{
            let target=canvas.tokens.get(targetid);
            let tactor=target.actor;
            
            if (isvehicle){
                tactor=gb.getDriver(target.actor);
            }
            let charRoll=new CharRoll(tactor);
            let char=new Char(tactor);
          //  let wounds=raisecount;

            if (char.spendBenny()){

                if (!isvehicle){

                

                if (!gb.setting('onlySystemMod')){
                charRoll.addEdgeModifier('Iron Jaw',2)
                }

                charRoll.addModifier(tactor.system.attributes.vigor?.soakBonus,gb.trans('DamageApplicator.SoakModifier','SWADE'),);
                

                if((gb.settingKeyName('Unarmored Hero') || gb.systemSetting('unarmoredHero')) && tactor.system.wildcard && 
                tactor.items.find(el=>el.type=='armor' && el.system.equipStatus==3)===undefined
                ){
                    charRoll.addModifier(2,gb.trans("Settings.UnarmoredHero.Name","SWADE"));
                }
               
            } 
                
                charRoll.addFlavor(gb.trans('DoSoak'))
                
                charRoll.addFlag('usetarget',target.id);
                charRoll.addFlag('wounds',raisecount);
                charRoll.addFlag('unstoppable_wounds',unstoppable);
                if (isvehicle){
                    await charRoll.rollSkill(gb.getDriverSkill(target.actor));
                } else {
                    await charRoll.rollAtt('vigor');
                }
                
                charRoll.addFlag('rolltype','soak'); //here to overwrite rolltype attribute
                charRoll.display();
                
            }
           
           
        }

        this.targetFunction=async (targetid,raisecount)=>{
            let target=canvas.tokens.get(targetid);
           // let target=canvas.tokens.get(argsArray[0]).actor
      //  let raisecount=argsArray[1];

            if (!game.user.isGM){
                ui.notifications.error(gb.trans('OnlyGM'))
                return false;  ///only gm can apply damage
            }


            let char=new Char(target.actor);

          //  console.log(target);
          //  console.log(raisecount);
        

            if (raisecount==0){
                if (char.isVehicle()){
                    await char.outOfControl();
                } else
                if (char.is('isShaken')){
                    if (!char.hasAbilitySetting('Hardy')){
                        char.applyWounds(1);
                    } else {
                        ui.notifications.info(`${target.actor.name} ${gb.trans('HardyWarn')}`)
                    }
                    
                } else {
                    char.on('isShaken');
                }
            } else if (raisecount>0){
                
               
                char.applyWounds(raisecount);
                
                if (char.isVehicle()){
                    await char.outOfControl();
                } else {                    
                    char.on('isShaken');

                    /* if (gb.setting('grittyDamage')){
                        await char.rollTable(game.tables.get(gb.setting('grittyDamage')));
                    } */

                    
                    let useditem=this.getItemOwner().items.get(this.chat.flags["swade-tools"].itemroll);

                    if (gb.systemSetting('injuryTable') && (gb.systemSetting('grittyDamage') || (gb.setting('bloodAndGoreRifts') && useditem.system.isHeavyWeapon && !gb.isHeavyArmor(target.actor,area)))){
                        let table=await fromUuid(gb.systemSetting('injuryTable'));
                        await char.rollTable(table);
                    }
                  //  this.grittyDamage(target);
                }
                
            }
        }
    }


    addFreeRerollButton() {
        this.html.find('.swadetools-relative .swadetools-rollbuttonwrap').
            append('<button class="swadetools-freereroll swadetools-rollbutton" title="' +
                   gb.trans('FreeReroll','SWADE') +
                   '"><i class="fa fa-redo"></i></button>').
            on('click', 'button.swadetools-freereroll', async () => {
                let actor=this.findActor();

                if (actor) {
                    await this.rerollBasic(actor, true);
                }
            }
        );
    } 
    

    addBennyButton(){

        

        if (this.rolltype!='unshaken'){ /// dont show benny button for unshaken roll
        this.html.find('.swadetools-relative .swadetools-rollbuttonwrap').append('<button class="swadetools-bennyrerroll swadetools-rollbutton" title="'+gb.trans('RerollBtn')+'"></button>').on('click','button.swadetools-bennyrerroll',async ()=>{
            

            let actor=this.findActor();

            if (actor){
            let char=new Char(actor);
            
         //   console.log(actor);

            if (char.spendBenny()){

               


                await this.rerollBasic(actor);
               
                
            
            }
            }
        });
    }
    }

   

    findActor(){

        let actor;
        if (this.chat.flags["swade-tools"]?.useactor){
            actor=game.actors.get(this.chat.flags["swade-tools"].useactor)
        } else {
            actor=game.actors.filter(el=>el.name==this.chat.alias)[0];
        }

         
        if (!actor || actor.length>1){
             ui.notifications.warn(gb.trans('NoActorFoundReroll'));
             return false;
        } else {
            return actor;
        }
    }

    async rerollBasic(actor,freeReroll=false){

        let char=new Char(actor);
        let mod=0;
        let reason='';
        let edgebonus=false;
        let oldroll=this.chat.rolls[0];
        let flavor=this.chat.flavor;
        let chatflags=this.chat.flags['swade-tools'];


     //  console.log(this.chat.flags);

       if (this.chat.flags['swade-tools']?.edgebonus) {
        edgebonus=this.chat.flags['swade-tools'].edgebonus;
       }

      if (!freeReroll){
        if (this.rolltype=='damage'){

            if (this.chat.flags['swade-tools']?.edgebonus!="nomercy" && char.hasEdgeSetting('No Mercy')){
                mod=2
                reason=gb.settingKeyName('No Mercy');
                edgebonus='nomercy'
            }

        } else {
            if (this.chat.flags['swade-tools']?.edgebonus!="elan" && char.hasEdgeSetting('Elan')){
                mod=2
                reason=gb.settingKeyName('Elan');    
                edgebonus='elan'
            }
        }

      
       
    } 
       
   

       let modStr='';
       let extraflavor='';
       if (freeReroll){
        let freeRerollHTML=`<div><strong>${gb.trans('FreeReroll','SWADE')}</strong></div>`;
        if (flavor.search(freeRerollHTML)<0){
            extraflavor+=freeRerollHTML
        }
        
    }

       if (mod){
           modStr=gb.stringMod(mod);
            extraflavor+=`<div>${reason}: ${modStr}</div>`;
       }

       

      //  let roll = await new Roll(oldroll.formula+modStr).roll({async:true}); /// removed due to swade system  2.3
      /// new roll
      let roll = new CONFIG.Dice.SwadeRoll(oldroll.formula+modStr, {}, {});
      await roll.evaluate({async: true});
      /// end new roll

        //console.log(roll);
        if (oldroll.terms[0]?.dice!==undefined){

            for (let i=0;i<oldroll.terms[0].dice.length;i++){
                roll.terms[0].dice[i].options=oldroll.terms[0].dice[i].options
            }

        } else {

            /// 1 die
            roll.terms[0].options=oldroll.terms[0].options
        }

        


        if (this.chat.flags['swade-tools']?.itemroll){
            
            Hooks.call('swadeAction',actor, actor.items.get(this.chat.flags['swade-tools'].itemroll),this.chat.flags['swade-tools']?.useaction,roll, game.user.id);  /// all item rolls -> can be used for hit/damage (itemDialog) => search for "new itemRoll"
        }

         ////
   //  console.log(this.chat._roll.terms[0].dice); /// if undefined its 1 die, use this.chat._roll.terms[0].options
     /// else
 // console.log(this.chat._roll.terms[0].dice); /// defined, use this.chat._roll.terms[0].dice[i].options

        /// also copy roll.options addDiceFlavor TODO

       // console.log(this.chat.flags?.['swade-tools']);

    //   console.log(chatflags,roll.total);

   // console.log(chatflags);
        
        if (gb.raiseCount(roll.total)>=0 && chatflags?.arcanefail?.arcaneItem){

       //     console.log('pass');

       

           

                if (chatflags?.arcanefail?.pp){
                    char.spendPP(chatflags?.arcanefail?.pp,chatflags.arcanefail.arcaneItem);
                }
               
                flavor=flavor.replace(`<div>${gb.trans('FailedPP')}</div>`,'');
                chatflags.arcanefail={}; ///remove arcane fail pp to avoid repeat
            
            
        }
            

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
         //content: 'this is plus',
        flavor: flavor+extraflavor
        };


        

        

       await roll.toMessage(chatData).then(async chat=>{
        if (chatflags){
            let flags=chatflags;

           
            
            await chat.update({"flags.swade-tools":flags,"flags.swade-tools.edgebonus":edgebonus});
            /// repeat flags for roll
           
        }
       });
    }

    isCritical(){
       // let rolltype=this.chat.data.flags?.["swade-tools"]?.rolltype;

        if (this.rolltype!='damage' && this.roll){

       // console.log(this.roll);

        let dices=this.roll.terms[0].dice;

       
        if (dices!==undefined){ /// extras roll one dice only
        let ones=dices.filter(el=>el.total==1);
        if (ones.length>1 && ones.length>(dices.length/2)){
            // check wild die
            if (dices.filter(el=>el.options.flavor=="Wild Die" && el.total>1).length>0){
                return false;
            } else {
                return true;
            }
            
        } 
        }

        }
            return false;
        
    }


    /* getDisposition(token){
        if (token.actor.data.type=='character'){ /// all pcs are friendly
            return 'friend';
        } else {
            if (token.data.disposition==1){ // a friendly npc
                return 'friend';
            }

            return 'enemy';
        }
    }
 */
    /// token.data.disposition
    // disposition -1 friendly
        // disposition 1 hostile

    gangUp(attacker,target){
        if (!attacker || !target 
        || attacker?.actor?.type=='vehicle' || target?.actor?.type=='vehicle'
        || attacker.document.disposition==target.document.disposition
        || attacker.document.disposition==0
        ) {
          //  console.log('nothing');
            return 0;
        }



        let all_around_target=canvas.tokens.placeables.filter(t=>
            t.id!=attacker.id // not the attacker
            && gb.getRange(target,t,true)==1 /// adjacent
            && t.actor!==undefined /// prevent no actor bug
            && t?.actor?.type!='vehicle'
            && !(attacker.actor.isToken===false && attacker.actor.id==t?.actor?.id)
            && t.id!=target.id /// not the target
            && t.visible  /// is visible   
            && t.document.overlayEffect!=CONFIG.controlIcons.defeated   /// not defeated (out of combat)
            && !t.actor.effects.find(el=>el.name==gb.trans('Incap',"SWADE") && el.disabled==false)  /// not defeated (out of combat)
            && !t.combatant?.defeated /// not defeated 
            && t?.actor?.system.status.isStunned!==true /// not stunned               
            && t.document.disposition!=0               
        )

     //  console.log('all_around',all_around_target.length)

        if (!all_around_target.length){
            return 0
        }


        let allies_of_attacker=all_around_target.filter(t=>
             t.document.disposition==attacker.document.disposition 
        )

     //  console.log('allies_of_attacker',allies_of_attacker.length);

        let allies_of_target=all_around_target.filter(t=>
            t.document.disposition==target.document.disposition
        )
        
     //   console.log('allies_of_target',allies_of_target.length);
      
        let helping_target=0;
        if (allies_of_target.length){ ///see if any of them nullify something
            allies_of_target.map(al=>{
                let not_able=allies_of_attacker.filter(t=>
                gb.getRange(al,t)==1
                );
                if (not_able.length){
                    helping_target++
                }
            })
        }

     //   console.log('helping',helping_target);

        let formation_allies_of_attacker = allies_of_attacker.filter(al=>{
            let alChar = new Char(al)
            return alChar.hasEdgeSetting('Formation Fighter')
        })

        let gangup=allies_of_attacker.length+formation_allies_of_attacker.length-helping_target;

        if (gangup>4){
            gangup=4
        }

        
        if (gangup>0){
            let targetActor=new Char(target.actor);
            if (targetActor.hasAbilitySetting('All-Around Vision')){
                gangup=gangup-1
               // console.log('all-around vision')
            }
            
        }
       // console.log('gangup',gangup);

        return gangup;
    
    }
}