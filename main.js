// the travelers tools by LightningWB
// 1.5.1
// I am trying to keep all the code in one file so it is easier to setup
if(globalThis.LightningClientIniialized){// you can't pile up hotbar after hotbar now
    alert('You can only inject once')
    throw 'Already injected';
}
// this is a small spiral loop function that I modified slightly for my use from Neatsu on stack exchange. https://stackoverflow.com/a/46852039 All credit for this goes to him
// spiral find
globalThis.spiralFind = (x, y, step, count, target, target2=null, target3=null, exempt=[]) => {
    let distance = 0;
    let range = 1;
    let direction = 'up';
    for ( let i = 0; i < count; i++ ) {
        // stuff I added
        if (!doesArrayIncludeArray(exempt,[YOU.x+x,YOU.y+y])){
            if(document.getElementById((YOU.x+x)+'|'+(YOU.y+y)).textContent==target || document.getElementById((YOU.x+x)+'|'+(YOU.y+y)).textContent==target2 || document.getElementById((YOU.x+x)+'|'+(YOU.y+y)).textContent==target3){
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
};
//Xp
globalThis.XPBot={
    startXP(){
        XPBot.running=true;
        XPBot.turn="left";
    },
    run(){
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
    },
};
//Double step
globalThis.doubleStep={
    toggle(){
        if(this.running){
            this.stop();
        }
        else{
            this.startDStep();
        }
        controller.toggelColor('doubleStep');
    },
    startDStep(){
        this.running=true;
    },
    run(){
        if(XP.sp>=10){
            DSTEP.click();
        }
    },
    stop(){
        this.running=false;
    }
};
// metal detector mine bot
globalThis.mineBot={
    getList:['copper_ore','scrap_metal','steel_shard'],
    direction:'n',
    startMine(){
        this.running=true;
        this.pos=1;
        //this.timer=setInterval(function(){mineBot.mine();}, 1100);// increased interval because it kept getting stuck
    },
    run(){
        lastMessage=document.getElementById('enginelog-latestmessage');
        if (lastMessage.textContent.includes('the metal detector pings.')){
            SOCKET.send({action: "equipment", option: "dig_with_shovel"});
        }
        for(i=0;i<this.getList.length;i++){
            LOOT.takeItems(this.getList[i],10);
        }
        if(YOU.currentTile=='H'||YOU.currentTile=='C'){
            SOCKET.send({'action':'event_choice','option':'__leave__'});
        }
        SOCKET.send({action: "loot_next"});
        setDir(this.direction);
    },
    endMine(){
        //clearInterval(this.timer);
        this.running=false;
    },
    popup(){
        POPUP.new(
            'Auto Mine Configure',
            'Will Get:'+JSON.stringify(this.getList)+'<br><ul><li onclick="mineBot.editGetList(\'copper_ore\');" style="cursor:pointer;">Copper</li><li onclick="mineBot.editGetList(\'scrap_metal\');" style="cursor:pointer;">Scrap</li><li onclick="mineBot.editGetList(\'steel_shard\');" style="cursor:pointer;">Steel</li></ul>\
            <label for="defaultDir">Direction</label>\
            <select name="defaultDir" id="defaultDir" style="background:inherit;" onchange="mineBot.direction=this.value">\
                <option value="n">North</option>\
                <option value="ne">North-East</option>\
                <option value="e">East</option>\
                <option value="se">South-East</option>\
                <option value="s">South</option>\
                <option value="sw">South-West</option>\
                <option value="w">West</option>\
                <option value="nw">North-West</option>\
            </select>\
            ',
            undefined
        )
    },
    editGetList(item){
        if(this.getList.includes(item)){
            this.getList.splice(this.getList.indexOf(item),1);
        }
        else{
            this.getList.push(item);
        }
        this.popup();
    }
};
// travel
globalThis.travelBot={
    xDest:YOU.x,
    yDest:YOU.y,
    start(){
        this.running=true;
        if(!doubleStep.running){
            doubleStep.toggle();
        }
        //this.timer=setInterval(function(){travelBot.travel();}, 1000);
    },
    run(){
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
        setDir(this.travelDir);
    },
    stop(){
        this.running=false;
        if(doubleStep.running){
            doubleStep.toggle();
        }
        //clearInterval(this.timer);
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
globalThis.treeBot={
    start(){
        this.running=true;
        this.defaultDir=document.getElementById('treeDefaultDir').value;
        //this.timer=setInterval(function(){treeBot.tree()}, 1000);
    },
    run(){
        SOCKET.send({action: "event_choice", option: "__leave__"});
        INT.leaveInit();
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
                setDir(this.defaultDir);
            }
        }
    },
    stop(){
        //clearInterval(this.timer);
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
globalThis.autoLoot={
    getUMF:true,
    exemptList:[],
    getList:[],
    beenThroughHazDoor:false,
    doneTreasuryDesk:false,
    doneTreasuryWoodCloset:false,
    beenInSkyscraper:false,
    beenInTent:false,
    lootedBody:false,
    readyToLeave:false,
    gottenUMF:false,
    beenEastLoot:false,
    defaultDir:'e',
    start(){
        this.running=true;
        //this.timer=setInterval(function(){autoLoot.raid()}, 1200);// I am doing 1.2 seconds because some cycles take longer and getting stuck in events is annoying. It will be slightly slower but less prone to getting stuck
    },
    run(){
        if(this.nextMove=='steal'){
            if (POPUP.isOpen==true||LOOT.mainEl.style.display==''){// stops if there is a little lag
                if(POPUP.evTitle.innerHTML=='a desolate city'){// cities
                    this.placeType='desolate'
                }
                else if(POPUP.evTitle.innerHTML=='a walled city'){
                    this.placeType='walled'
                }
                else if(POPUP.evTitle.innerHTML=='a withered city'){
                    this.placeType='withered'
                }
                else if(POPUP.evTitle.innerHTML=='a governing city'){
                    this.placeType='governing'
                }
                else if(POPUP.evTitle.innerHTML=='a blasted city'){
                    this.placeType='blasted'
                }
                else if(POPUP.evTitle.innerHTML=='a barn'){// houses
                    this.placeType='barn'
                }
                else if(POPUP.evTitle.innerHTML=='a cabin'){
                    this.placeType='cabin'
                }
                else if(POPUP.evTitle.innerHTML=='a garage'){
                    this.placeType='garage'
                }
                else if(POPUP.evTitle.innerHTML=='a childcare center'){
                    this.placeType='childcare'
                }
                else if(POPUP.evTitle.innerHTML=='a church'){
                    this.placeType='church'
                }
                else if(POPUP.evTitle.innerHTML=='a humble residence'){
                    this.placeType='humble'
                }
                else if(POPUP.evTitle.innerHTML=='a low home'){
                    this.placeType='low'
                }
                else if(POPUP.evTitle.innerHTML=='an old home'){
                    this.placeType='old'
                }
                else if(POPUP.evTitle.innerHTML=='a pet store'){
                    this.placeType='pet'
                }
                else if(POPUP.evTitle.innerHTML=='a ruined house'){
                    this.placeType='ruined'
                }
                else if(POPUP.evTitle.innerHTML=='a run-down shack'){
                    this.placeType='run-down'
                }
                else if(POPUP.evTitle.innerHTML=='a weathered house'){
                    this.placeType='weathered'
                }
                this.collect();
            }
            if(POPUP.isOpen==false&&LOOT.mainEl.style.display=='none'){this.leaveEvent()}
            if(POPUP.isOpen==false&&LOOT.mainEl.style.display=='none'&&this.left==true){
                this.left=false;
                this.nextMove='back';
            }
        }
        else if(this.nextMove==='collect'){
            this.exemptList.push([this.targetX+YOU.x,this.targetY+YOU.y]);
            if(this.goto(this.targetX,this.targetY)=='there'){
                this.nextMove='steal';
                if(this.defaultDir=='n'||this.defaultDir=='s'){// this should make sure you don't get stuck as much
                    this.targetX=this.prevCoords.x-YOU.x;
                    this.targetY=0;
                }
                else if(this.defaultDir=='e'||this.defaultDir=='w'){
                    this.targetX=0;
                    this.targetY=this.prevCoords.y-YOU.y;
                }
                else{
                    this.targetX=this.prevCoords.x-YOU.x;
                    this.targetY=this.prevCoords.y-YOU.y;
                }
            }
        }
        else if (this.nextMove=='move'){
            this.goto(this.targetX, this.targetY)
        }
        else if(this.nextMove=='back'){
            this.goto(this.targetX, this.targetY)
        }
        else{
            spiralResults=spiralFind(0, 0, 1, 961, WORLD.TILES.city, target2=WORLD.TILES.house,target3='WOW', exempt=this.exemptList);// i guess all previous defaults need to be defined
            if (spiralResults.found===true){
                if(doubleStep.running){
                    doubleStep.toggle();
                }
                this.nextMove='move';
                this.targetX=spiralResults.relX;
                this.targetY=spiralResults.relY;
                this.prevCoords={x:YOU.x, y:YOU.y};
            }
            else{
                setDir(this.defaultDir);
                if(!doubleStep.running){
                    doubleStep.toggle();
                }
                SOCKET.send({
                    action:'event_choice',
                    option:'__leave__'
                })
            }
        }
    },
    stop(){
        //clearInterval(this.timer);
        this.running=false;
        if(doubleStep.running){
            doubleStep.toggle();
        }
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
            this.leaveEvent();
            setDir(travelDir);
            return'notThere';
        }
    },
    collect(){
        if(WORLD.deriveTile(YOU.x, YOU.y)=='C'){// city paths
            switch(this.placeType){
                case 'desolate':
                    this.handelEvent('a desolate city', 'the highway');
                    if(this.beenInTent==false){
                        this.handelEvent('the midst of the towers', 'the tent')
                    }
                    if(this.lootAll('a camping tent')){this.beenInTent=true;}
                    if(this.beenInTent==true&&this.beenInSkyscraper==false&&this.handelEvent('the midst of the towers', 'the skyscraper')){
                        this.beenInSkyscraper=true;
                        break;
                    }
                    this.handelEvent("the tower's bones", 'the corner');
                    if(this.lootedBody==false&&this.handelEvent('the ruined office', 'the body')){
                        this.lootedBody=true;
                    }
                    this.lootAll('a dead man');
                    if(this.lootedBody==true){
                        this.handelEvent('the ruined office', 'go back');
                    }
                    if(this.beenInTent==true&&this.beenInSkyscraper==true&&this.lootedBody==true){
                        this.handelEvent('the midst of the towers', 'the subway');
                    }
                    this.handelEvent('the subway', 'the railway');
                    this.handelEvent('the tunnel', 'keep walking');
                    this.handelEvent('another platform', 'check the bodies');
                    this.lootAll('homeless bodies');
                    this.handelEvent('the buried platform', 'the tunnel')
                    this.leaveEvent(name='the continuing dark tunnel');
                    break;
                case 'walled':
                    this.leaveEvent();// a walled city just isnt worth it
                    /*this.handelEvent('a walled city', 'the eastern side')
                    this.handelEvent('the collapsed eastern wall', 'swim to the refinery')
                    this.handelEvent('ashen waters', 'circle the perimeter')
                    if(!this.beenThroughHazDoor){
                        this.handelEvent('the perimeter', 'the main entrance')
                        this.handelEvent('the main area', 'the hazard door')
                    }
                    if(this.handelEvent('the hazard door', 'the control panel')){this.beenThroughHazDoor=true;}
                    this.handelEvent('the control panel', 'the gap in the wall')
                    this.handelEvent('the gap', 'check wood box')
                    this.lootAll('a rotten wood box')
                    this.handelEvent('the dark room','activate button')
                    this.handelEvent('a flood of water','escape up the stairs')
                    this.handelEvent('a flood of water','back up stairs')
                    if(this.beenThroughHazDoor){
                        this.handelEvent('a flood of water','back up stairs')
                        this.handelEvent('the main area','back out toward the city')
                        if(this.leaveEvent()){this.beenThroughHazDoor=false;}
                    }*/
                    break;
                case 'withered':
                    this.handelEvent('a withered city', 'the tunnel');
                    this.handelEvent('the tunnel', 'enter sewage system');
                    this.handelEvent('dark tunnels', 'go east');
                    this.handelEvent('the east path', 'continue');
                    if(this.getUMF==true&&this.gottenUMF==false){
                        this.handelEvent('a frigid intersection', 'north');
                    }
                    if(this.gottenUMF==true||this.getUMF==false){
                        this.handelEvent('a frigid intersection', 'south');
                    }
                    if(this.lootAll('a strange cube')){
                        this.gottenUMF=true;
                    }
                    this.lootAll('an abandoned backpack');
                    if(this.beenEastLoot==false&&this.handelEvent('discolored liquid', 'east')){
                        this.beenEastLoot=true;
                    }
                    this.handelEvent('discolored liquid', 'south');
                    this.handelEvent('dim daylight', 'west');
                    if(this.leaveEvent(name='outside')){
                        this.gottenUMF=false;
                        this.beenEastLoot=false;
                    }
                    break;
                case 'governing':
                    this.handelEvent('a governing city', 'the tunnel')
                    this.handelEvent('strong stone', 'continue')
                    this.handelEvent('a concrete path', 'continue')
                    this.handelEvent('the winding path', 'continue')
                    this.handelEvent('the treasury', 'enter')
                    if(!this.doneTreasuryDesk){
                        this.handelEvent("the treasury's lobby", 'the desk')
                        if(this.lootAll('the desk')){this.doneTreasuryDesk=true;}
                    }
                    if(!this.doneTreasuryWoodCloset&&this.doneTreasuryDesk){
                        if(this.handelEvent("the treasury's lobby", 'the wooden closet')){this.doneTreasuryWoodCloset=true;}
                    }
                    this.lootAll('the wooden closet')
                    if(this.doneTreasuryDesk&&this.doneTreasuryWoodCloset){
                        this.handelEvent("the treasury's lobby", 'back outside')
                        if(this.leaveEvent()){this.doneTreasuryDesk=false;this.doneTreasuryWoodCloset=false;}
                    }
                    break;
                case 'blasted':
                    this.handelEvent('a blasted city', 'the road')
                    this.handelEvent('black and red', 'the tower')
                    if(!this.doneElevator){
                        this.handelEvent('the tower lobby', 'the elevator')
                        if(this.lootAll('the elevator shaft')){this.doneElevator=true;}
                    }
                    if(!this.doneOffice){
                        this.handelEvent('the tower lobby', 'the exit sign')
                        this.handelEvent('the exit sign', 'the fire escape')
                        this.handelEvent('the fire escape', 'the eighth floor')
                        this.handelEvent('the eighth floor', 'the office')
                        this.handelEvent('the office', 'loot area')
                        this.lootAll('the blasted office')
                        this.handelEvent('the office', 'return to tower base')
                        if(this.handelEvent('descent', 're-enter tower')){this.doneOffice=true;}
                    }
                    if(this.doneOffice, this.doneElevator, POPUP.evTitle.innerHTML=='the tower lobby'){
                        this.doneElevator=false;
                        this.doneOffice=false;
                        this.leaveEvent();
                    }
                    break;
            }
        }
        else if(WORLD.deriveTile(YOU.x, YOU.y)=='H'){// house paths
            switch(this.placeType){
                case 'barn':
                    this.leaveEvent();
                    break;
                case 'cabin':
                    this.handelEvent('a cabin', 'check the back');
                    this.handelEvent('the backyard', 'a plastic container');
                    this.lootAll('a plastic container')  
                    break;
                case 'childcare':
                    this.leaveEvent();
                    break;
                case 'church':
                    this.handelEvent('a church', 'investigate')
                    this.handelEvent('rows of pews', 'the book')
                    this.handelEvent('a withered book', 'the back halls')
                    this.handelEvent('the back halls', 'the control room')
                    this.lootAll('the control room')
                    break;
                case 'garage':
                    this.leaveEvent();
                    break;
                case 'humble':
                    this.leaveEvent();
                    break;
                case 'low':
                    this.leaveEvent();
                    break;
                case 'old':
                    this.handelEvent('an old home', 'enter')
                    this.handelEvent('the living room', 'the back room')
                    this.handelEvent('the back room', 'the closet')
                    this.handelEvent('the closet', 'search')
                    this.lootAll('a cardboard box')
                    break;
                case 'pet':
                    this.handelEvent('a pet store', 'enter');
                    this.handelEvent('inside', 'the aisles');
                    this.handelEvent('the aisles', 'the adoption center');
                    this.handelEvent('the adoption center', 'the stocking room');
                    this.handelEvent('the stocking room', 'look around');
                    this.lootAll('the shelves');
                    break;
                case 'ruined':
                    this.handelEvent('a ruined house', 'the kitchen')
                    this.handelEvent('the kitchen', 'an old note')
                    this.handelEvent('an old note', 'the top floor')
                    this.handelEvent('the top floor', 'search')
                    this.lootAll('an old trash bag')
                    break;
                case 'run-down':
                    this.handelEvent('a run-down shack', 'check shack')
                    this.lootAll('inside the shack')
                    break;
                case 'weathered':
                    this.handelEvent('a weathered house','enter')
                    this.handelEvent('the entrance hall','the kitchen')
                    this.handelEvent('the kitchen', 'the backyard')
                    this.lootAll('the backyard')
                    break;
            }
        }
    },
    leaveEvent(name=undefined){//I added in name this way so I wouldn't have to rewrite code that worked
        if(!name==undefined&&!POPUP.evTitle.innerHTML==name){
            return;
        }
        classList=document.getElementsByClassName('popup-button')
        for(i=0;i<classList.length;i++){
            if(classList[i].value=='exit event'){
                classList[i].click();
                return true;
            }
        }
        this.left=true;
    },
    lootAll(name){
        if(name==LOOT.titleEl.innerHTML){
            for(i=0;i<this.getList.length;i++){
                LOOT.takeItems(this.getList[i],10);// no one needs copper coils
            }
            SOCKET.send({action: "loot_next"});
            return true;
        }
    },
    handelEvent(name,solution){
        if(POPUP.evTitle.innerHTML==name){
            classList=document.getElementsByClassName('popup-button')
            otherList=document.getElementsByClassName('popup-reqbutton');
            for(i=0;i<classList.length;i++){
                if(classList[i].value==solution){
                    //console.log(solution) //quite useful for debugging
                    classList[i].click();
                    return true;
                }
                if(otherList.length>0&&otherList[i].toString.includes(solution)){
                    otherList[i].click();
                    return true;
                }
            }

        }
    },
    /*changeUMF(){
        if (document.getElementById('UMF').checked===true){
            this.getUMF=true;
        }
        else{
            this.getUMF=false
        }
    },*/
    // checkItem wasn't even used
    popup(){
        POPUP.new(
            'City/House Raider Configuration',// if I don't put \ at the end of lines then there are line breaks everywhere
            'Will Get:'+JSON.stringify(this.getList.sort())+'<hr>'+`\
            <h3 style="margin-top:0px;margin-bottom:0px;">Item Configuration</h3>\
            <ul>`+
            this.toggleButton('axe')+
            this.toggleButton('baseball_bat')+
            this.toggleButton('blow_torch')+
            this.toggleButton('bolt_cutters')+
            this.toggleButton('bp_low_teleporter')+
            this.toggleButton('bp_metal_detector')+
            this.toggleButton('bp_reality_anchor')+
            this.toggleButton('bullet')+
            this.toggleButton('circuit_board')+
            this.toggleButton('cloth')+
            this.toggleButton('copper_coil')+
            this.toggleButton('crowbar')+
            this.toggleButton('battery',displayName='energy cell')+
            this.toggleButton('fire_extinguisher')+
            this.toggleButton('machete')+
            this.toggleButton('maintnence_key')+
            this.toggleButton('pistol')+
            this.toggleButton('plastic')+
            this.toggleButton('rope')+
            this.toggleButton('rusty_knife')+
            this.toggleButton('scrap_metal')+
            this.toggleButton('shotgun_shell')+
            this.toggleButton('shovel')+
            this.toggleButton('soda_bottle')+// thanks for taking the time to read through my code. BOAT GANG
            this.toggleButton('steel_shard')+
            this.toggleButton('syringe')+
            this.toggleButton('alien_fragment',displayName='unknown material fragment')+
            this.toggleButton('wire')+
            this.toggleButton('wood_stick')+
            `</ul>\
            <hr>\
            <h3 style="margin-top:0px;margin-bottom:0px;">Other Configuration</h3>\
            <label for="defaultDir">Direction</label>\
            <select name="defaultDir" id="defaultDir" style="background:inherit;" onchange="autoLoot.defaultDir=this.value">\
                <option value="n">North</option>\
                <option value="ne">North-East</option>\
                <option value="e">East</option>\
                <option value="se">South-East</option>\
                <option value="s">South</option>\
                <option value="sw">South-West</option>\
                <option value="w">West</option>\
                <option value="nw">North-West</option>\
            </select>\
            `,
            undefined
        );
        document.getElementById('event-desc').style.maxHeight='650px';
    },
    toggleButton(ID, displayName=null){
        if(displayName!=null){
            return '<li style="cursor:pointer;" onclick="autoLoot.editGetList(\''+ID+'\')">'+displayName+'</li>'
        }
        return '<li style="cursor:pointer;" onclick="autoLoot.editGetList(this.innerHTML)">'+ID+'</li>'
    },
    editGetList(item){
        if(this.getList.includes(item)){
            this.getList.splice(this.getList.indexOf(item),1);
        }
        else{
            this.getList.push(item);
        }
        this.popup();
    }
}
// waypoint travel
globalThis.wayPointTravel={
    wayPointList:[],// format is [[x,y],[x,y]]
    start(){
        this.running=true;
        //this.timer=setInterval(function(){wayPointTravel.run();},1000);
        if(!doubleStep.running){
            doubleStep.toggle();
        }
    },
    run(){
        if(this.wayPointList.length==0){controller.toggle('wayPointTravel');}
        else{
            direction=this.getDir(this.wayPointList[0][0],this.wayPointList[0][1]);
            if(direction==''){
                if(this.wayPointList.length>0){
                    this.wayPointList.shift();
                }
            }
            else{
                setDir(direction);
            }
            SOCKET.send({action: "event_choice", option: "__leave__"});
        }
    },
    stop(){
        this.running=false;
        //clearInterval(this.timer);
        if(doubleStep.running){
            doubleStep.toggle();
        }
    },
    addPoints(){
        x=Number(document.getElementById('waypointX').value);
        y=Number(document.getElementById('waypointY').value);
        this.wayPointList.push([x,y]);
        this.popup();
    },
    getDir(targetX,targetY){
        if (targetY>YOU.y){// north south
            travelDir='n';
        }
        else if (targetY<YOU.y){
            travelDir='s';
        }
        else{
            travelDir='';
        }
        if (targetX>YOU.x){// east west
            travelDir=travelDir+'e';
        }
        else if (targetX<YOU.x){
            travelDir=travelDir+'w';
        }
        else{
            travelDir=travelDir+'';
        }
        return travelDir;
    },
    popup(){
        POPUP.new(
            'Waypoint Travel',
            JSON.stringify(wayPointTravel.wayPointList).replace('[[','[').replace(']]',']')+`<hr><div style="border:1px solid black;text-align:center;height:20px;">\
                    <input type="number" id="waypointX" placeholder="X" style="width:80px;">\
                    <input type="number" id="waypointY" placeholder="Y" style="width:80px;">\
                    <span style="border:1px solid black;width:50px;cursor:pointer;" onclick="wayPointTravel.addPoints()">Add to List</span>\
                </div>\
                <input type="text" style="width:600px;" id="wayPointJSON">\
                <div style="border:1px solid black;text-align:center;cursor:pointer;" onclick="wayPointTravel.wayPointList=JSON.parse('['+document.getElementById('wayPointJSON').value+']');wayPointTravel.popup();">Set data to waypoints</div>\
                <div style="border:1px solid black;text-align:center;cursor:pointer;" onclick="localStorage.setItem('waypoints',JSON.stringify(wayPointTravel.wayPointList));wayPointTravel.popup();">Load to local storage</div>\
                <div style="border:1px solid black;text-align:center;cursor:pointer;" onclick="wayPointTravel.wayPointList=JSON.parse(localStorage.getItem('waypoints'));wayPointTravel.popup();">Load from local storage</div>\
                <div style="border:1px solid black;text-align:center;cursor:pointer;" onclick="wayPointTravel.wayPointList=[];wayPointTravel.popup();">Delete All</div>`,
            undefined
        );
    }
};
//auto Reconnect
globalThis.autoReconnect={
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
        if (SOCKET.isOpen==false||POPUP.evTitle.innerHTML=="disconected"){//changed detection as it is unlikely to socket will close and more likely you will be cut
            SOCKET.open();
            setTimeout(()=>{//has to wait a little bit to connect to server
            POPUP.hide();
            SOCKET.send({
                "action": "setDir",
                "dir": YOU.dir,
                "autowalk": YOU.autowalk
            });}, 1000)
        }
        if(POPUP.evTitle.innerHTML=="disconnected"&&SOCKET.isOpen==true){
            POPUP.hide();
        }
    },
    stop(){
        this.running=false;
        clearInterval(this.timer);
    }
}
// event stopper
globalThis.eventStop={
    running:false,
    knownList:['&nbsp;', ',', 't','w','M','H','C','<b>&amp;</b>','.','~','T','<b><b>&amp;</b></b>','&amp;'],
    newList:[],
    toggle(){
        if (this.running==false){
            this.running=true;
            //this.timer=setInterval(function(){eventStop.run()}, 1000);
        }
        else{this.stop()}
        controller.toggelColor('eventFind')
    },
    run(){
        for(i=0;i<WORLD.tilemap.length;i++){
            tile=WORLD.tilemap[i].innerHTML
            if(this.knownList.includes(tile)==false){
                this.newList.push(tile)
                NOTIF.new('NEW LOCATION',1000);
                this.toggle();
                stopTravels();
            }
        }
    },
    stop(){
        this.running=false;
        //clearInterval(this.timer);
    },
    updateNewPlayer(value){
        if(value==true){
            this.knownList.pop();
        }
        else{
            this.knownList.push('&amp;');
        }
    }
};
// freecam
globalThis.freeCam={
    running:false,
    speed:1,
    prevX:YOU.x,
    prevY:YOU.y,
    x:YOU.x,
    y:YOU.y,
    toggle(){
        if (this.running==false){
            this.running=true;
            this.timer=setInterval(function(){freeCam.run()}, 30);
            this.prevX=YOU.x;
            this.prevY=YOU.y;
            if(document.getElementById('freeCamX').value!=''){
                YOU.x=Number(document.getElementById('freeCamX').value)
            }
            if(document.getElementById('freeCamY').value!=''){
                YOU.y=Number(document.getElementById('freeCamY').value)
            }
            onkeydown=function(key){
                if(key.key=='w'){
                    KEYBOOL.w=true;
                }
                if(key.key=='s'){
                    KEYBOOL.s=true;
                }
                if(key.key=='a'){
                    KEYBOOL.a=true;
                }
                if(key.key=='d'){
                    KEYBOOL.d=true;
                }
            };
            onkeyup=function(key){
                if(key.key=='w'){
                    KEYBOOL.w=false;
                }
                if(key.key=='s'){
                    KEYBOOL.s=false;
                }
                if(key.key=='a'){
                    KEYBOOL.a=false;
                }
                if(key.key=='d'){
                    KEYBOOL.d=false;
                }
            };
            WORLD.build();
        }
        else{this.stop();}
        controller.toggelColor('freeCam');
    },
    run(){
        changed=false;
        if(KEYBOOL.w){
            YOU.y+=this.speed;
            changed=true;
        }
        else if(KEYBOOL.s){
            YOU.y-=this.speed;
            changed=true;
        }
        if(KEYBOOL.a){
            YOU.x-=this.speed;
            changed=true;
        }
        else if(KEYBOOL.d){
            YOU.x+=this.speed;
            changed=true;
        };
        if(changed==true){
            WORLD.build();
        }
    },
    stop(){
        this.running=false;
        clearInterval(this.timer);
        YOU.x=this.prevX;
        YOU.y=this.prevY;
        WORLD.build();
    }
};
// greater efficiency
globalThis.cycleAligner={
    modules:[doubleStep,XPBot,mineBot,travelBot,treeBot,autoLoot,wayPointTravel,eventStop],
    initialize(){
        ENGINE.addCycleTrigger('cycleAligner.checkRunning()');
    },
    checkRunning(){
        setTimeout(function(){cycleAligner.checkAll();},400)// .4 seconds after the cycle starts it will queue it back in. if each cycle takes more than .4 seconds then you need an upgrade
    },
    checkAll(){
        ENGINE.addCycleTrigger('cycleAligner.checkRunning();');
        for(let i=0;i<cycleAligner.modules.length;i++){
            if(cycleAligner.modules[i].running){
                cycleAligner.modules[i].run();
            }
        }
    }
};
// controller
globalThis.controller={
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
        else if(job=='bigXP'){
            bigXPBot.start();
        }
        else if(job=='wayPointTravel'){
            wayPointTravel.start();
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
        else if(job=='bigXP'){
            bigXPBot.stop();
        }
        else if(job=='wayPointTravel'){
            wayPointTravel.stop();
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
        else if(job=='bigXP'){// bigXP
            if (bigXPBot.running==true){
                this.stop('bigXP');
            }
            else{
                this.start('bigXP');
            }
        }
        else if(job=='wayPointTravel'){// bigXP
            if (wayPointTravel.running==true){
                this.stop('wayPointTravel');
            }
            else{
                this.start('wayPointTravel');
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
            if (id=='bigXP'){// same as travel
                document.getElementById('bigXP').children[0].classList.remove('toolUnClicked');
                document.getElementById('bigXP').children[0].classList.add('toolClicked');
            }
        }
        else if (document.getElementById(id).classList.contains('toolClicked')){
            document.getElementById(id).classList.add('toolUnClicked');
            document.getElementById(id).classList.remove('toolClicked');
            if (id=='travel'){
                document.getElementById('travel').children[0].classList.add('toolUnClicked');
                document.getElementById('travel').children[0].classList.remove('toolClicked');
            }
            if (id=='bigXP'){// same as travel
                document.getElementById('bigXP').children[0].classList.add('toolUnClicked');
                document.getElementById('bigXP').children[0].classList.remove('toolClicked');
            }
        }
    }
};
// color
globalThis.color={
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
globalThis.changelog={
    showChangelog(){
        POPUP.new(null,this.changes.replaceAll('\n',''))// no longer have to add in \
    },
    changes:
    `
    <h1 class="code-line" data-line-start=0 data-line-end=1 ><a id="Changelog_0"></a>Changelog</h1>
<hr>
<h2 class="code-line" data-line-start=2 data-line-end=3 ><a id="151_2"></a>1.5.1</h2>
<ul>
<li class="has-line-data" data-line-start="3" data-line-end="4">Added a bookmarklet</li>
<li class="has-line-data" data-line-start="4" data-line-end="5">Added in diagonals to event raider</li>
<li class="has-line-data" data-line-start="5" data-line-end="6">Now you can enter waypoints as a list</li>
</ul>
<h2 class="code-line" data-line-start=6 data-line-end=7 ><a id="150_6"></a>1.5.0</h2>
<ul>
<li class="has-line-data" data-line-start="7" data-line-end="8">Added the ability to teleport anywhere with freecam</li>
<li class="has-line-data" data-line-start="8" data-line-end="9">Made city/house raider not get stuck as often</li>
<li class="has-line-data" data-line-start="9" data-line-end="10">Added in a system to alling scripts running to the cycles</li>
<li class="has-line-data" data-line-start="10" data-line-end="11">Added in the ability to choose what to mine for in auto mine</li>
<li class="has-line-data" data-line-start="11" data-line-end="12">Added the ability to choose what to get from city/house raider</li>
<li class="has-line-data" data-line-start="12" data-line-end="13">Added waypoint travel</li>
<li class="has-line-data" data-line-start="13" data-line-end="14">Added changelog</li>
</ul>
<h2 class="code-line" data-line-start=14 data-line-end=15 ><a id="140_14"></a>1.4.0</h2>
<ul>
<li class="has-line-data" data-line-start="15" data-line-end="16">Added freecam</li>
</ul>
<h2 class="code-line" data-line-start=16 data-line-end=17 ><a id="130_16"></a>1.3.0</h2>
<ul>
<li class="has-line-data" data-line-start="17" data-line-end="18">Reworked UI</li>
<li class="has-line-data" data-line-start="18" data-line-end="19">Added a location stopper</li>
<li class="has-line-data" data-line-start="19" data-line-end="20">Added map explorer</li>
<li class="has-line-data" data-line-start="20" data-line-end="21">Hid auto reconnect from the ui because the exploit is used got patched</li>
</ul>
<h2 class="code-line" data-line-start=21 data-line-end=22 ><a id="123_21"></a>1.2.3</h2>
<ul>
<li class="has-line-data" data-line-start="22" data-line-end="23">Fixed css with toggling dark mode</li>
</ul>
<h2 class="code-line" data-line-start=23 data-line-end=24 ><a id="122_23"></a>1.2.2</h2>
<ul>
<li class="has-line-data" data-line-start="24" data-line-end="25">Made auto loot look better</li>
</ul>
<h2 class="code-line" data-line-start=25 data-line-end=26 ><a id="121_25"></a>1.2.1</h2>
<ul>
<li class="has-line-data" data-line-start="26" data-line-end="27">Added direction changer to city/house raider</li>
<li class="has-line-data" data-line-start="27" data-line-end="28">Improved auto reconnect detection</li>
</ul>
<h2 class="code-line" data-line-start=28 data-line-end=29 ><a id="120_28"></a>1.2.0</h2>
<ul>
<li class="has-line-data" data-line-start="29" data-line-end="30">Added city/house raider</li>
</ul>
<h2 class="code-line" data-line-start=30 data-line-end=31 ><a id="110_30"></a>1.1.0</h2>
<ul>
<li class="has-line-data" data-line-start="31" data-line-end="32">Added tree mower</li>
<li class="has-line-data" data-line-start="32" data-line-end="33">Added auto reconnect</li>
</ul>
<h2 class="code-line" data-line-start=33 data-line-end=34 ><a id="101_33"></a>1.0.1</h2>
<ul>
<li class="has-line-data" data-line-start="34" data-line-end="35">Auto travel won’t get stuck on events anymore</li>
</ul>
<h2 class="code-line" data-line-start=35 data-line-end=36 ><a id="100_35"></a>1.0.0</h2>
<ul>
<li class="has-line-data" data-line-start="36" data-line-end="37">Added auto travel</li>
<li class="has-line-data" data-line-start="37" data-line-end="38">Added a help menu</li>
</ul>
<h2 class="code-line" data-line-start=38 data-line-end=39 ><a id="021_38"></a>0.2.1</h2>
<ul>
<li class="has-line-data" data-line-start="39" data-line-end="40">Removed dome debug code</li>
<li class="has-line-data" data-line-start="40" data-line-end="41">Made auto mine more clear that you need a metal detector</li>
</ul>
<h2 class="code-line" data-line-start=41 data-line-end=42 ><a id="020_41"></a>0.2.0</h2>
<ul>
<li class="has-line-data" data-line-start="42" data-line-end="43">Added auto mine</li>
</ul>
<h2 class="code-line" data-line-start=43 data-line-end=44 ><a id="010_43"></a>0.1.0</h2>
<ul>
<li class="has-line-data" data-line-start="44" data-line-end="45">Added auto XP</li>
<li class="has-line-data" data-line-start="45" data-line-end="46">Added auto doublestep</li>
</ul>
`
}
// help popup
globalThis.popupHelp=function(){// I need the \ so there aren't indentations and it is much more readable
    POPUP.new('Help', "\
    Auto Xp will walk back and forth.\
    Auto double step will automaticly double step.\
    Auto mine with metal detector will mine if you have a metal detctor equiped and a shovel.\
    Auto travel will automaticly travel to the desired coords. Using a boat is quicker and more reliable.\
    If you don't have a boat equiped you may get stuck. Tree mower will auto farm trees.\
    I am aware that auto city and house raider will miss some loot.\
    Location stopper will stop at locations that aren't natural or rare.\
    Use it while travel is running to stop.\
    Check the players box to stop for players.\
    Free Cam used wasd to move around. You can't manually move while doing this. Free Cam also only shows stuff that is seen on mapexplorer.\
    The coord input on freecam let you go directly to coords. Ex. 0,0.\
    Map explore uses <a href='https://pfg.pw' target='blank'>Pfg's</a> map explorer.\
    Waypoint travel will go to the first waypoint then the second and so on. Recommended to navigate around oceans.\
    You can save waypoints to local storage and load them from there. Local storage is shared across the current browser and will stay if you reload.\
      ", undefined);
};
// mapexplorer popup
globalThis.popupMap=function(){
    POPUP.new('<a href="https://pfg.pw" target="_blank">MapExplorer by pfg</a>',
    '<iframe src="https://pfg.pw/mapexplorer/" width=640 height=640 class="embed-responsive-item">',
    undefined);
    document.getElementById('event-desc').style.maxHeight='650px';
    POPUP.evBox.style.maxHeight="900px"
};
globalThis.doesArrayIncludeArray=function(array1,array2){//js doesnt compare arrays well
    for(i=0;i<array1.length;i++){
        if(array1[i].join('')==array2.join('')){
            return true;
        }
    }
    return false;
};
globalThis.stopTravels=function(){
    if(travelBot.running){
        controller.toggle('travel');
    }
    if(wayPointTravel.running){
        controller.toggle('wayPointTravel');
    }
    if(YOU.autowalk){
        setDir(YOU.dir);
    }
};
// new change dir to work with buttons
globalThis.setDir=function(dir){
    ENGINE.dir(dir, document.getElementById('arrow-'+dir))
};
function init(){
    color.getColor();
    var insertedHTML=document.createElement("div");
    insertedHTML.innerHTML=
    //this is the html added to the bottom of the webpage
    `
    <div class='complexHr'>
        <span class="header">Utility</span>
    </div>
    <div id="Utility Hot Bar" style="margin:auto;width:636px;height:62px;">
        <div class="tool toolUnClicked" onclick=" doubleStep.toggle()" id="doubleStep">Auto Double Step</div>
        <div class="tool toolUnClicked" id="eventFind">
            <span onclick=eventStop.toggle() >Location Stopper</span>
            
            <label for='playerStop'>Players</label>
            <input type="checkbox" id='playerStop' onchange="eventStop.updateNewPlayer(this.checked)" style="margin-bottom:0px;">
        </div>
        <div class="tool toolUnClicked" id="freeCam">
            <span onclick=freeCam.toggle() >Free Cam</span>
            <input type="number" placeholder=1 id="freeCamSpeed" onchange="freeCam.speed=Number(this.value)">
            <input style="width:35px;" type="number" placeholder="X" id="freeCamX">
            <input style="width:35px;" type="number" placeholder="Y" id="freeCamY">
        </div>
        <div class="tool toolUnClicked" onclick=popupMap() >Map Explorer</div>
        <div class="tool toolUnClicked" onclick=changelog.showChangelog() id="help">Changelog</div>
        <div class="tool toolUnClicked" onclick=popupHelp() id="help">Help</div>
    </div>`+
   `
   <div class='complexHr'>
            <span class="header">Bots</span>
    </div>
   <div id="Tool Hot Bar" style="margin:auto;width:636px;height:62px;">
        <style>
        .tool{
            margin:2px 2px;
            border-width:1px;
            border-style:solid;
            width:100px;
            height:60px;
            cursor:pointer;
            float:left;
            text-align:center;
        }   
        .toolUnClicked{
            color:`+color.textColor+`;
            border-color:`+color.textColor+`;
            background-color:`+color.background+`;
        }
        .toolClicked{
            color:`+color.clickedTextColor+`;
            border-color:`+color.clickedTextColor+`;
            background-color:`+color.clickedBackground+`;
        }
        .complexHr {
            margin-top: 15px;
            margin-bottom: 15px;
            border: 0;
            border-top: 1px solid `+color.textColor+`;
            text-align: center;
            height: 0px;
            line-height: 0px;
        }
        .header{
            background-color:`+color.background+`;
            padding-left:5px;
            padding-right:5px;
        }
        </style>
        <div class="tool toolUnClicked" onclick=controller.toggle("xp") id="xp">Auto Xp</div>
        <div class="tool toolUnClicked" id="dig">
            <span onclick=controller.toggle("dig")>Auto Mine</span>
            <span onclick="mineBot.popup();" style="border:1px solid black;">Configure</span>
        </div>
        <div class="tool toolUnClicked" id="travel">
            <div onclick=controller.toggle("travel")>Travel</div>
            <input type="number" id="x" placeholder="X" onchange="travelBot.changeDestinationX(this.value)" style="width:88px">
            <input type="number" id="y" placeholder="Y" onchange="travelBot.changeDestinationY(this.value)" style="width:88px">
        </div>
        <div class="tool toolUnClicked" id="treeBot">
            <span onclick=controller.toggle('treeBot')>
                Tree Mower
            </span>
            <label for="treeDefaultDir">Dir</label>
            <select name="treeDefaultDir" id="treeDefaultDir" style="background:inherit;">
                <option value="n">North</option>
                <option value="e">East</option>
                <option value="s">South</option>
                <option value="w">West</option>
            </select>
        </div>
        <div class="tool toolUnClicked" id="autoLoot">
            <span onclick=controller.toggle('autoLoot') >C/H Raider</span>
            <span onclick="autoLoot.popup();" style="border:1px solid black;">Configure</span>
        </div>
        <div class="tool toolUnClicked" id="wayPointTravel">
            <span onclick=controller.toggle("wayPointTravel")>Waypoint Travel</span>
            <span onclick="wayPointTravel.popup();" style="border:1px solid black;">Configure</span>
        </div>
    </div><br>`
        /*<div class="tool toolUnClicked" onclick=autoReconnect.toggle() id="reconnect">Auto Reconnect</div>*/ // auto reconnect was removed in 1.0.4 R.I.P.
    ;
    var target=document.getElementById('game-content').getElementsByClassName('mid-screencontainer scrollbar')[0];
    target.appendChild(insertedHTML);
    EQUIP.menuEl.style.width="420px";
    BUILD.boxEl.style.width="420px";
    cycleAligner.initialize();
    globalThis.LightningClientIniialized=true;
}
init();