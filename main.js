// the travelers tools by LightningWB
// 1.1
// I am trying to keep all the code in one file so it is easier to setup
// this is a small spiral loop function that I modified slightly for my use from Neatsu on stack exchange. https://stackoverflow.com/a/46852039 All credit for this goes to him
// spiral find
let spiralFind = (x, y, step, count, target, target2=null, exempt=[]) => {
    let distance = 0;
    let range = 1;
    let direction = 'up';

    for ( let i = 0; i < count; i++ ) {
        // stuff I added
        if (!exempt.includes([YOU.x+x,YOU.y+y])){
            if(document.getElementById((YOU.x+x)+'|'+(YOU.y+y)).textContent==target || document.getElementById((YOU.x+x)+'|'+(YOU.y+y)).textContent==target2){
                return {found:true, relX:x, relY:y};
            }
        }
        // not my stuff
        distance++;
        switch ( direction ) {
            case 'up':
                y += step;
                if ( distance >= range ) {
                    direction = 'right';
                    distance = 0;
                }
                break;
            case 'right':
                x += step;
                if ( distance >= range ) {
                    direction = 'bottom';
                    distance = 0;
                    range += 1;
                }
                break;
            case 'bottom':
                y -= step;
                if ( distance >= range ) {
                    direction = 'left';
                    distance = 0;
                }
                break;
            case 'left':
                x -= step;
                if ( distance >= range ) {
                    direction = 'up';
                    distance = 0;
                    range += 1;
                }
                break;
            default:
                break;
        }
    }
    return {found:false, relX:null, relY:null};
}
//Xp
var XPBot={
    startXP(){
        XPBot.running=true;
        XPBot.turn="left";
        this.xPTimer=setInterval(function(){XPBot.afkXP();}, 1000);
    },
    afkXP(){
        if(this.turn==="left"){
            setDir('w');
            this.turn="right";
        }else{
            setDir('e');
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
            setDir('sw');        }
        else if(this.pos<=0){
            SOCKET.send({action: "event_choice", option: "__leave__"});
            this.direction='e';
            this.pos++;
            setDir('se');
        }
        else{
            SOCKET.send({action: "event_choice", option: "__leave__"});
            setDir(this.direction);
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
        this.xDest=Number(this.xDest);
        this.yDest=Number(this.yDest);
        SOCKET.send({action: "event_choice", option: "__leave__"});
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
        setDir(this.travelDir);
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
// tree farmer
var treeBot={
    start(){
        this.running=true;
        this.timer=setInterval(function(){treeBot.tree()}, 1000);
    },
    tree(){
        SOCKET.send({action: "event_choice", option: "__leave__"});
        if(this.nextMove==='collect'){
            HANDS.gettree(document.getElementById('hands-tree'));
            this.nextMove='back';
            spiralResults=spiralFind(0, 0, 1, 961, 't');
            if (spiralResults.found===true){
                this.nextMove='move';
                this.targetX=spiralResults.relX;
                this.targetY=spiralResults.relY;
                this.prevCoords={x:YOU.x, y:YOU.y};
            }
        }
        else if (this.nextMove==='move'){
            this.goto(this.targetX, this.targetY)
        }
        else if(this.nextMove==='back'){
            this.goto(this.targetX, this.targetY)
        }
        else{
            spiralResults=spiralFind(0, 0, 1, 961, 't');
            if (spiralResults.found===true){
                this.nextMove='move';
                this.targetX=spiralResults.relX;
                this.targetY=spiralResults.relY;
                this.prevCoords={x:YOU.x, y:YOU.y};
            }
            else{
                setDir('e');
            }
        }
    },
    stop(){
        clearInterval(this.timer);
        this.running=false;
        this.nextMove='travel'
    },
    goto(x, y){
        if (YOU.y+y>YOU.y){// north south
            travelDir='n';
            this.targetY=y-1;
        }
        else if (YOU.y+y<YOU.y){
            travelDir='s';
            this.targetY=y+1;
        }
        else{
            travelDir='';
        }
        if (YOU.x+x>YOU.x){// east west
            travelDir=travelDir+'e';
            this.targetX=x-1;
        }
        else if (YOU.x+x<YOU.x){
            travelDir=travelDir+'w';
            this.targetX=x+1;
        }
        else{
            travelDir=travelDir+'';
        }
        if(travelDir===''){
            if (this.nextMove=='move'){
                this.nextMove='collect';
            }
            else if (this.nextMove=='back'){
                this.nextMove='travel';
            }
            return'there';
        }
        else{
            setDir(travelDir);
            return'notThere';
        }
    }
};
// Auto city and house
var autoLoot={
    getUMF:false,
    start(){
        this.running=true;
        this.timer=setInterval(function(){autoLoot.raid()}, 1000);
    },
    raid(){
        if(this.nextMove=='steal'){
            if (popup.isOpen==true){// stops if there is a little lag
                if(POPUP.evTitle=='a desolate city'){// cities
                    this.placeType='desolate'
                }
                else if(POPUP.evTitle=='a walled city'){
                    this.placeType='walled'
                }
                else if(POPUP.evTitle=='a withered city'){
                    this.placeType='withered'
                }
                else if(POPUP.evTitle=='a governing city'){
                    this.placeType='governing'
                }
                else if(POPUP.evTitle=='a blasted city'){
                    this.placeType='blasted'
                }
                else if(POPUP.evTitle=='a barn'){// houses
                    this.placeType='barn'
                }
                else if(POPUP.evTitle=='a cabin'){
                    this.placeType='cabin'
                }
                else if(POPUP.evTitle=='a garage'){
                    this.placeType='garage'
                }
                else if(POPUP.evTitle=='a childcare center'){
                    this.placeType='childcare'
                }
                else if(POPUP.evTitle=='a church'){
                    this.placeType='church'
                }
                else if(POPUP.evTitle=='a humble residence'){
                    this.placeType='humble'
                }
                else if(POPUP.evTitle=='a low home'){
                    this.placeType='low'
                }
                else if(POPUP.evTitle=='an old home'){
                    this.placeType='old'
                }
                else if(POPUP.evTitle=='a pet store'){
                    this.placeType='pet'
                }
                else if(POPUP.evTitle=='a ruined house'){
                    this.placeType='ruined'
                }
                else if(POPUP.evTitle=='a run-down shack'){
                    this.placeType='run-down'
                }
                else if(POPUP.evTitle=='a weatherd house'){
                    this.placeType='weathered'
                }
                this.collect()
            }
        }
        else if(this.nextMove==='collect'){
            this.collect();
            this.nextMove='steal';
            this.targetX=YOU.x-this.prevCoords.x;
            this.targetY=YOU.y-this.prevCoords.y;
        }
        else if (this.nextMove==='move'){
            this.goto(this.targetX, this.targetY)
        }
        else if(this.nextMove==='back'){
            this.goto(this.targetX, this.targetY)
        }
        else{
            spiralResults=spiralFind(0, 0, 1, 961, 'C', target2='H');
            if (spiralResults.found===true){
                this.nextMove='move';
                this.targetX=spiralResults.relX;
                this.targetY=spiralResults.relY;
                this.prevCoords={x:YOU.x, y:YOU.y};
            }
            else{
                setDir('e');
            }
        }
    },
    stop(){
        clearInterval(this.timer);
        this.running=false;
        this.nextMove='travel'
    },
    goto(x, y){
        if (YOU.y+y>YOU.y){// north south
            travelDir='n';
            this.targetY=y-1;
        }
        else if (YOU.y+y<YOU.y){
            travelDir='s';
            this.targetY=y+1;
        }
        else{
            travelDir='';
        }
        if (YOU.x+x>YOU.x){// east west
            travelDir=travelDir+'e';
            this.targetX=x-1;
        }
        else if (YOU.x+x<YOU.x){
            travelDir=travelDir+'w';
            this.targetX=x+1;
        }
        else{
            travelDir=travelDir+'';
        }
        if(travelDir===''){
            if (this.nextMove=='move'){
                this.nextMove='collect';
            }
            else if (this.nextMove=='back'){
                this.nextMove='travel';
            }
            return'there';
        }
        else{
            setDir(travelDir);
            return'notThere';
        }
    },
    collect(){
        if(WORLD.deriveTile(YOU.x, YOU.y)=='C'){// city paths
            switch(this.placeType){
                case 'desolate':
                    break;
                case 'walled':
                    break;
                case 'withered':
                    break;
                case 'governing':
                    break;
                case 'blasted':
                    break;
            }
        }
        else if(WORLD.deriveTile(YOU.x, YOU.y)=='H'){// house paths
            switch(this.placeType){
                case 'barn':
                    this.leaveEvent();
                    break;
                case 'cabin':
                    if(POPUP.evTitle=='a cabin'){
                        //add in button here
                    }
                    break;
                case 'childcare':
                    this.leaveEvent();
                    break;
                case 'church':
                    break;
                case 'garage':
                    break;
                case 'humble':
                    this.leaveEvent();
                    break;
                case 'low':
                    this.leaveEvent();
                    break;
                case 'old':
                    break;
                case 'pet':
                    break;
                case 'ruined':
                    break;
                case 'run-down':
                    break;
                case 'weathered':
                    break;
            }
        }
    },
    leaveEvent(){
        classList=document.getElementsByClassName('popup-button')
        for(i=0;i<classList.length;i++){
            if(classList[i].value=='exit event'){
                classList[i].click();
            }
        }
        this.nextMove='back';
    },
    changeUMF(){
        if (document.getElementById('UMF').checked===true){
            this.getUMF=true;
        }
        else{
            this.getUMF=false
        }
    },
    checkItem(item){
        if (SUPPLIES.current.hasOwnProperty(item)){
            return true;
        }
        else{
            return false;
        }
    }
}
//auto Reconnect
var autoReconnect={
    running:false,
    toggle(){
        if (this.running==false){
            this.running=true;
            this.timer=setInterval(function(){autoReconnect.run()}, 1000*10);
        }
        else{this.stop()}
        controller.toggelColor('reconnect')
    },
    run(){
        if (SOCKET.isOpen==false){
            SOCKET.open();
            setTimeout(()=>{
            POPUP.hide();
            SOCKET.send({
                "action": "setDir",
                "dir": YOU.dir,
                "autowalk": YOU.autowalk
            });}, 1000)
        }
    },
    stop(){
        this.running=false;
        clearInterval(this.timer);
    }
}
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
        else if(job=='treeBot'){
            treeBot.start();
        }
        else if(job=='autoLoot'){
            autoLoot.start();
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
        else if(job=='treeBot'){
            treeBot.stop();
        }
        else if(job=='autoLoot'){
            autoLoot.stop();
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
        else if(job=='treeBot'){// tree
            if (treeBot.running==true){
                this.stop('treeBot');
            }
            else{
                this.start('treeBot');
            }
        }
        else if(job=='autoLoot'){// city and house
            if (autoLoot.running==true){
                this.stop('autoLoot');
            }
            else{
                this.start('autoLoot');
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
            this.clickedBackground='rgb(83, 83, 83)';
        }
        else{
            this.textColor='rgb(0, 0, 0)';//black
            this.background='rgb(255, 255, 255)';//white
            this.clickedTextColor ='rgb(0, 0, 0)';
            this.clickedBackground='rgb(215, 215, 215)';
        }
    }
};
// help popup
function popupHelp(){
    POPUP.new('Help', "Afk Xp will walk back and forth. Auto double step will automaticly double step. Auto mine with metal detector will mine if you have a metal detctor equiped and a shovel. Auto travel will automaticly travel to the desired coords. Using a boat is quicker and more reliable. If you don't have a boat equiped you may get stuck.", undefined);
};
// new change dir to work with buttons
function setDir(dir){
    ENGINE.dir(dir, document.getElementById('arrow-'+dir))
};
function init(){
    color.getColor();
    var insertedHTML=document.createElement("div");
    insertedHTML.innerHTML=
    //this is the html added to the bottom of the webpage
   `<div id="Utility Hot Bar" style="margin:auto;width:636px;">
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
        <div class="tool toolUnClicked" id="treeBot" onclick=controller.toggle('treeBot')>Tree Mower</div>
        `+/*<div class="tool toolUnClicked" id="autoLoot">
            <span onclick=controller.toggle('autoLoot') >City/House Raider</span>
            <br>
            <label for='UMF'>Get UMF</label>
            <input type="checkbox" id='UMF' onchange="autoLoot.changeUMF()">
        </div>*/`
        <div class="tool toolUnClicked" onclick=autoReconnect.toggle() id="reconnect">Auto Reconnect</div>
        <div class="tool toolUnClicked" onclick=popupHelp() id="help">Help</div>
    </div>`;
    var target=document.getElementById('game-content').getElementsByClassName('mid-screencontainer scrollbar')[0];
    target.appendChild(insertedHTML);
    EQUIP.menuEl.style.width="430px";
    BUILD.boxEl.style.width="430px";
}
init();