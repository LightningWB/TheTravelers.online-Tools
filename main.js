// the travelers tools by LightningWB
// I am trying to keep all the code in one file so it is easier to setup
//Xp
var XPBot={
    startXP(){
        XPBot.running=true;
        XPBot.turn="left";
        this.xPTimer=setInterval(function(){XPBot.afkXP()}, 1000);
    },
    afkXP(){
        if(this.turn==="left"){
            SOCKET.send({action:"setDir", dir:"w", autowalk:false});
            this.turn="right";
        }else{
            SOCKET.send({action:"setDir", dir:"e", autowalk:false});
            this.turn="left";
        }
    },
    stopXP(){
        XPBot.running=false;
        clearInterval(this.xPTimer);
    },
};
//Double step
var doubleStep={
    startDStep(){
        this.running=true;
        this.timer=setInterval(function(){DSTEP.click()}, 1010);
    },
    stop(){
        clearInterval(this.timer);
        this.running=false;
    }
}
// metal detector mine bot
var mineBot={
    startMine(){
        this.running=true;
        this.pos=0;
        this.direction='e';
        this.timer=setInterval(function(){mineBot.mine()}, 1000);
    },
    mine(){
        this.lastMessage=document.getElementById('enginelog-latestmessage');
        if (this.lastMessage.textContent.includes('the metal detector pings.')){
            ENGINE.log('mined');
            SOCKET.send({action: "equipment", option: "dig_with_shovel"});
            this.nextMove='take all';
        }
        else if(this.nextMove=='take all'){
            SOCKET.send({action: "loot_takeall"});
            SOCKET.send({action: "loot_next"});
            this.nextMove='move';
        }
        else if (this.pos>=1000){// rebound
            this.direction='w';
            this.pos--;
            SOCKET.send({action: 'setDir', dir: 'sw', autowalk:false});
        }
        else if(this.pos<=0){
            this.direction='e';
            this.pos++;
            SOCKET.send({action: 'setDir', dir: 'se', autowalk:false});
        }
        else{
            SOCKET.send({action: "setDir", dir: this.direction, autowalk: false});
            if(this.direction=='e'){this.pos++;}
            else{this.pos--;}
            this.nextMove='dig'
        }
        console.log(this.pos);
    },
    endMine(){
        clearInterval(this.timer);
        this.running=false;
    }
}
// controller
var controller={
    runningList:[],
    // starts
    start(job){
        if (this.runningList!=[]){// stops multiple task from running and conflicting
            for (i=0; i<this.runningList.length; i++){
                console.log(this.runningList[i])
                this.toggle(this.runningList[i]);
            }
        }
        if (job=='xp'){
            XPBot.startXP();
        }
        else if(job=='doubleStep'){
            doubleStep.startDStep();
        }
        else if(job=='dig'){
            mineBot.startMine();
        }
        this.runningList.push(job)
    },
    // stops
    stop(job){
        if (job=='xp'){
            XPBot.stopXP();
        }
        else if(job=='doubleStep'){
            doubleStep.stop();
        }
        else if(job=='dig'){
            mineBot.endMine();
        }
        this.runningList.splice(this.runningList.indexOf(job), 1)// clears list
    },
    //toggle to have one function
    toggle(job){
        if (job=='xp'){//xp
            if (XPBot.running==true){
                this.stop('xp');
            }
            else{
                this.start('xp');
            }
        }
        else if (job=='doubleStep'){//dstep
            if (doubleStep.running==true){
                this.stop('doubleStep');
            }
            else{
                this.start('doubleStep');
            }
        }
        else if(job=='dig'){// mine
            if (mineBot.running==true){
                this.stop('dig')
            }
            else{
                this.start('dig')
            }
        }
        else{
            window.alert('Error: Job not found')
        }
        this.toggelColor(job);
    },
    toggelColor(id){
        if (document.getElementById(id).classList.contains('toolUnClicked')){
            document.getElementById(id).classList.remove('toolUnClicked');
            document.getElementById(id).classList.add('toolClicked')
        }
        else if (document.getElementById(id).classList.contains('toolClicked')){
            document.getElementById(id).classList.add('toolUnClicked');
            document.getElementById(id).classList.remove('toolClicked')
        }
    }
}
// color
var color={
    getColor(){
        if (SETTINGS.darkmode=='true'){
            this.textColor='rgb(255, 255, 255)';//white
            this.background='rgb(40, 40, 40)';//gray
            this.clickedTextColor ='rgb(215, 215, 215)'
            this.clickedBackground='rgb(0, 0, 0)'
        }
        else{
            this.textColor='rgb(0, 0, 0)';//black
            this.background='rgb(255, 255, 255)';//white
            this.clickedTextColor ='rgb(0, 0, 0)'
            this.clickedBackground='rgb(215, 215, 215)'
        }
    }
}
function init(){
    color.getColor()
    var insertedHTML=document.createElement("div");
    insertedHTML.innerHTML=
    //this is the html added to the bottom of the webpage
    // the \ is so the string can be multiline and readable
   '<div id="Utility Hot Bar" style="margin:auto;width:306px;">\
        <style>\
        .tool{\
            margin:auto;\
            border-width:1px;\
            border-style:solid;\
            width:100px;\
            height:54px;\
            cursor:pointer;\
            float:left;\
        }   \
        .toolUnClicked{\
            color:'+color.textColor+';\
            border-color:'+color.textColor+';\
            background-color:'+color.backgroundColor+';\
        }\
        .toolClicked{\
            color:'+color.clickedTextColo+';\
            border-color:'+color.clickedTextColo+';\
            background-color:'+color.clickedBackground+';\
        }\
        }\
        </style>\
        <div class="tool toolUnClicked" onclick=controller.toggle("xp") id="xp">Afk Xp</div>\
        <div class="tool toolUnClicked" onclick=controller.toggle("doubleStep") id="doubleStep">Auto Double Step</div>\
        <div class="tool toolUnClicked" onclick=controller.toggle("dig") id="dig">Auto Mine</div>\
    </div>';
    var target=document.getElementById('game-content').getElementsByClassName('mid-screencontainer scrollbar')[0];
    target.appendChild(insertedHTML);
}
init();