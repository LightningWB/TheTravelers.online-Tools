// the travelers tools by LightningWB
// 1.0
// I am trying to keep all the code in one file so it is easier to setup
//Xp
var XPBot={
    startXP(){
        XPBot.running=true;
        XPBot.turn="left";
        this.xPTimer=setInterval(function(){XPBot.afkXP();}, 1000);
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
        this.timer=setInterval(function(){DSTEP.click();}, 1010);
    },
    stop(){
        clearInterval(this.timer);
        this.running=false;
    }
};
// metal detector mine bot
var mineBot={
    startMine(){
        this.running=true;
        this.pos=1;
        this.direction='e';
        this.timer=setInterval(function(){mineBot.mine();}, 1000);
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
            SOCKET.send({action: "event_choice", option: "__leave__"});// stop getting stuck on events
            this.direction='w';
            this.pos--;
            SOCKET.send({action: 'setDir', dir: 'sw', autowalk:false});        }
        else if(this.pos<=0){
            SOCKET.send({action: "event_choice", option: "__leave__"});
            this.direction='e';
            this.pos++;
            SOCKET.send({action: 'setDir', dir: 'se', autowalk:false});
        }
        else{
            SOCKET.send({action: "event_choice", option: "__leave__"});
            SOCKET.send({action: "setDir", dir: this.direction, autowalk: false});
            if(this.direction=='e'){this.pos++;}
            else{this.pos--;}
            this.nextMove='dig';
        }
    },
    endMine(){
        clearInterval(this.timer);
        this.running=false;
    }
};
// travel
var travelBot={
    xDest:YOU.x,
    yDest:YOU.y,
    start(){
        this.running=true;
        this.timer=setInterval(function(){travelBot.travel();}, 1000);
    },
    travel(){
        if (this.yDest>YOU.y){// north south
            this.travelDir='n';
        }
        else if (this.yDest<YOU.y){
            this.travelDir='s';
        }
        else{
            this.travelDir='';
        }
        if (this.xDest>YOU.x){// east west
            this.travelDir=this.travelDir+'e';
        }
        else if (this.xDest<YOU.x){
            this.travelDir=this.travelDir+'w';
        }
        else{
            this.travelDir=this.travelDir+'';
        }
        if(this.travelDir==''){controller.toggle('travel');return;}
        if(EQUIP.current!='small boat'){// water no boat
            if (this.travelDir=='ne'){this.dest=[1,1];}
            else if (this.travelDir=='e'){this.dest=[1,0];}
            else if (this.travelDir=='se'){this.dest=[1,-1];}
            else if (this.travelDir=='s'){this.dest=[0,-1];}
            else if (this.travelDir=='sw'){this.dest=[-1,-1];}
            else if (this.travelDir=='w'){this.dest=[-1,0];}
            else if (this.travelDir=='nw'){this.dest=[-1,1];}
            else if (this.travelDir=='n'){this.dest=[0,1];}
            this.destTile=this.waterAt(this.dest[0], this.dest[1]);
            if (this.destTile=='w'){
                solutionFound=false;
                if (this.dest[0]>-1){
                    if (!this.waterAt(this.dest[0]-1, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]-1, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[0]<1){
                    if (!this.waterAt(this.dest[0]+1, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]+1, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]>-1){
                    if (!this.waterAt(this.dest[0], this.dest[1]-1)){
                        this.travelDir=this.numToDir(this.dest[0], this.dest[1]-1);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]<1){
                    if (!this.waterAt(this.dest[0], this.dest[1]+1)){
                        this.travelDir=this.numToDir(this.dest[0], this.dest[1]+1);
                        solutionFound=true;
                    }
                }
                if (solutionFound){}
                else{// try again
                if (this.dest[0]==1){
                    if (!this.waterAt(this.dest[0]-2, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]-2, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[0]==-1){
                    if (!this.waterAt(this.dest[0]+2, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]+2, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]==1){
                    if (!this.waterAt(this.dest[0], this.dest[1]-2)){
                        this.travelDir=this.numToDir(this.dest[0], this.dest[1]-2);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]==-1){
                    if (!this.waterAt(this.dest[0], this.dest[1]+2)){
                        this.travelDir=this.numToDir(this.dest[0], this.dest[1]+2);
                        solutionFound=true;
                    }
                }
                }
            }
        }
        DSTEP.click();
        SOCKET.send({action:"setDir", dir:this.travelDir, autowalk:false});
    },
    stop(){
        this.running=false;
        clearInterval(this.timer);
    },
    changeDestinationX(x){
        this.xDest=x;
    },
    changeDestinationY(y){
        this.yDest=y;
    },
    waterAt(relX, relY){
        if (WORLD.deriveTile(YOU.x+relX, YOU.y+relY)=='w'){
            return 'w';
        }
        else{
            return '';
        }
    },
    numToDir(x, y){
        if (y==1){
            dest='n';
        }
        else if(y==-1){
            dest='s';
        }
        else{
            dest='';
        }
        if (x==1){
            dest=dest+'e';
        }
        else if(x==-1){
            dest=dest+'w';
        }
        else{
            dest=dest+'';
        }
        return dest;
    }
};
// controller
var controller={
    runningList:[],
    // starts
    start(job){
        if (this.runningList.length>0){// stops multiple task from running and conflicting
            for (i=0; i<this.runningList.length; i++){
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
        else if(job=='travel'){
            travelBot.start();
        }
        this.runningList.push(job);
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
        else if(job=='travel'){
            travelBot.stop();
        }
        this.runningList.splice(this.runningList.indexOf(job), 1);// clears list
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
                this.stop('dig');
            }
            else{
                this.start('dig');
            }
        }
        else if(job=='travel'){// travel
            if (travelBot.running==true){
                this.stop('travel');
            }
            else{
                this.start('travel');
            }
        }
        else{
            window.alert('Error: Job not found');
        }
        this.toggelColor(job);
    },
    toggelColor(id){
        if (document.getElementById(id).classList.contains('toolUnClicked')){
            document.getElementById(id).classList.remove('toolUnClicked');
            document.getElementById(id).classList.add('toolClicked');
            if (id=='travel'){//  because travel has i=child classes those have to be accessed seprately
                document.getElementById('travel').children[0].classList.remove('toolUnClicked');
                document.getElementById('travel').children[0].classList.add('toolClicked');
            }
        }
        else if (document.getElementById(id).classList.contains('toolClicked')){
            document.getElementById(id).classList.add('toolUnClicked');
            document.getElementById(id).classList.remove('toolClicked');
            if (id=='travel'){
                document.getElementById('travel').children[0].classList.add('toolUnClicked');
                document.getElementById('travel').children[0].classList.remove('toolClicked');
            }
        }
    }
};
// color
var color={
    getColor(){
        if (SETTINGS.darkmode=='true'){
            this.textColor='rgb(255, 255, 255)';//white
            this.background='rgb(40, 40, 40)';//gray
            this.clickedTextColor ='rgb(215, 215, 215)';
            this.clickedBackground='rgb(0, 0, 0)';
        }
        else{
            this.textColor='rgb(0, 0, 0)';//black
            this.background='rgb(255, 255, 255)';//white
            this.clickedTextColor ='rgb(0, 0, 0)';
            this.clickedBackground='rgb(215, 215, 215)';
        }
    }
};
function popup(){
    POPUP.new('Help', "Afk Xp will walk back and forth. Auto double step will automaticly double step. Auto mine with metal detector will mine if you have a metal detctor equiped and a shovel. Auto travel will automaticly travel to the desired coords. Using a boat is quicker and more reliable. If you don't have a boat equiped you may get stuck.", undefined);
}
function init(){
    color.getColor();
    var insertedHTML=document.createElement("div");
    insertedHTML.innerHTML=
    //this is the html added to the bottom of the webpage
    // the \ is so the string can be multiline and readable
   `<div id="Utility Hot Bar" style="margin:auto;width:530px;">
        <style>
        .tool{
            margin:2px 2px;
            border-width:1px;
            border-style:solid;
            width:100px;
            height:60px;
            cursor:pointer;
            float:left;
        }   
        .toolUnClicked{
            color:`+color.textColor+`;
            border-color:`+color.textColor+`;
            background-color:`+color.backgroundColor+`;
        }
        .toolClicked{
            color:`+color.clickedTextColo+`;
            border-color:`+color.clickedTextColo+`;
            background-color:`+color.clickedBackground+`;
        }
        }
        </style>
        <div class="tool toolUnClicked" onclick=controller.toggle("xp") id="xp">Afk Xp</div>
        <div class="tool toolUnClicked" onclick=controller.toggle("doubleStep") id="doubleStep">Auto Double Step</div>
        <div class="tool toolUnClicked" onclick=controller.toggle("dig") id="dig">Auto Mine with Metal Detector</div>
        <div class="tool toolUnClicked" id="travel">
            <div onclick=controller.toggle("travel")>Travel</div>
            <input type="number" id="x" placeholder="X" onchange="travelBot.changeDestinationX(this.value)" style="width:88px">
            <input type="number" id="y" placeholder="Y" onchange="travelBot.changeDestinationY(this.value)" style="width:88px">
        </div>
        <div class="tool toolUnClicked" onclick=popup() id="help">Help</div>
    </div>`;
    var target=document.getElementById('game-content').getElementsByClassName('mid-screencontainer scrollbar')[0];
    target.appendChild(insertedHTML);
}
init();