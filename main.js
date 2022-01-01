// the travelers tools by LightningWB
// ~~1.5.1~~ some version idk. check the changelog
// I am trying to keep all the code in one file so it is easier to setup
if(globalThis.LightningClientInitialized){// you can't pile up hot bar after hot bar now
    alert('You can only inject once')
    throw 'Already injected';
}
// this is a small spiral loop function that I modified slightly for my use from Neatsu on stack exchange. https://stackoverflow.com/a/46852039 All credit for this goes to him
// spiral find
/**
 * A function to find any tile using what is on screen
 * @param {Number} x X
 * @param {Number} y Y
 * @param {Number} step should be one
 * @param {Number} count Irrelevant now
 * @param {String} target target
 * @param {String} target2 target two
 * @param {String} target3 target three
 * @param {Number[][]} exempt an exempt array structured similar to [[0,0], [1,1]]
 * @param {boolean} ignoreOneAway for tree bot
 */
globalThis.spiralFind = (x, y, step, count, target, target2=null, target3=null, exempt=[], getOneAway=true) => {
    let distance = 0;
    let range = 1;
    let direction = 'up';
    count=WORLD.tilemap.length-1;// render distance compatibility
    for ( let i = 0; i < count; i++ ) {
        // stuff I added
        if ( (getOneAway || Math.max(Math.abs(x), Math.abs(y))>1) && !doesArrayIncludeArray(exempt,[YOU.x+x,YOU.y+y])){
			ele=WORLD.tilemap.find(e=>e.id===(YOU.x+x)+'|'+(YOU.y+y));
			if(ele)
			{
				tile = ele.textContent;
				if(tile==target || tile==target2 || tile==target3){
					return {found:true, relX:x, relY:y};
				}

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
// copy stuff
globalThis.copyToClipboard=(e=>{const t=document.createElement("textarea");t.value=e||' ',t.setAttribute("readonly",""),t.style.position="absolute",t.style.left="-9999px",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)});// minified
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
        controller.toggleColor('doubleStep');
    },
    startDStep(){
        this.running=true;
    },
    run(){
        if(XP.sp>=10 && YOU.currentTile!='M' && YOU.currentTile!='w'){
            DSTEP.click();
        }
    },
    stop(){
		this.running=false;
		if(DSTEP.btnIsActive())DSTEP.click();
    }
};
// metal detector mine bot
globalThis.mineBot={
    getList:['copper_ore','scrap_metal','steel_shard','plastic','cloth', 'bullet'],
	direction:'n',
	logLoot:false,// loot tables have been documented now
	autoPlatform:false,
	log:[],
	loopAround:false,
	count:0,
	/**
	 * Positive for original path and negative for opposite path
	 */
	going:1,
	loopDistance:500,
	clockWiseDirs:{
		'n':'ne',
		'ne':'e',
		'e':'se',
		'se':'s',
		's':'sw',
		'sw':'w',
		'w':'nw',
		'nw':'n'
	},
	counterClockwiseDirs:{
		'n':'nw',
		'ne':'n',
		'e':'ne',
		'se':'e',
		's':'se',
		'sw':'s',
		'w':'sw',
		'nw':'w'
	},
	oppositeDir:{
		'n':'s',
		'ne':'sw',
		'e':'w',
		'se':'nw',
		's':'n',
		'sw':'ne',
		'w':'e',
		'nw':'se'
	},
    startMine(){
        this.running=true;
		this.count=0;
		this.going=1;
        //this.timer=setInterval(function(){mineBot.mine();}, 1100);// increased interval because it kept getting stuck
    },
    run(){
		if(ENGINE.midCycleDataCall)return;
		if(Number(XP.carryEl.innerHTML.split('/')[0])+25>XP.max_carry)controller.toggle('dig');// stops from getting over encumbered
        lastMessage=document.getElementById('enginelog-latestmessage');
        if (lastMessage.textContent.includes('the metal detector pings.')){
            SOCKET.send({action: "equipment", option: "dig_with_shovel"});
		}
		if(EQUIP.current!='metal detector')ENGINE.log('<b>please equip a metal detector</b>');
		this.lootAll();
		if(YOU.state==='looting')
		{
			if(this.logLoot){
				lootData=[];
				lootItems=Object.keys(LOOT.current);// if I just do LOOT.current as the loot it also has item data which is huge
				for(i=0;i<lootItems.length;i++){
					lootData.push({
						'id':lootItems[i],
						count:LOOT.current[lootItems[i]].count
					});
				}
				this.addToLog(
					{
						title:'hole',
						loot:lootData,
					}
				);
			}
		}
        if(YOU.currentTile=='H'||YOU.currentTile=='C'){
            SOCKET.send({'action':'event_choice','option':'__leave__'});
		}
		if(this.autoPlatform)SOCKET.send({action:'craft', item:'ocean_platform', count:1});
		if(this.autoPlatform && (SUPPLIES.current.copper_coil==undefined || SUPPLIES.current.copper_coil.count<25))
		{
			SOCKET.send({action:'craft', item:'copper_coil', count:1});
		}
        SOCKET.send({action: "loot_next"});
		if(!this.loopAround){if(YOU.dir!=this.direction)setDir(this.direction, true);}
		else
		{
			this.count++;
			if(this.count>10000000)
			{
				let dir = this.oppositeDir[this.direction];
				if(YOU.dir!=dir)setDir(dir);
				this.direction=dir;
				this.count=0;
			}
			else if(this.count>this.loopDistance)
			{
				let dir = this.going>0?this.clockWiseDirs[this.direction]:this.counterClockwiseDirs[this.direction];
				if(YOU.dir!=dir)setDir(dir);
				this.count=100000000;
				this.going*=-1;
			}
			else
			{
				if(YOU.dir!=this.direction)setDir(this.direction, true);
			}
		}
    },
    endMine(){
		//clearInterval(this.timer);
		stopTravels();
        this.running=false;
    },
    popup(){
        POPUP.new(
            'Auto Mine Configure',
            'Will Get:'+JSON.stringify(this.getList)+'<br><ul>\
                <li onclick="mineBot.editGetList(\'copper_ore\');" style="cursor:pointer;">Copper</li>\
                <li onclick="mineBot.editGetList(\'scrap_metal\');" style="cursor:pointer;">Scrap</li>\
                <li onclick="mineBot.editGetList(\'steel_shard\');" style="cursor:pointer;">Steel</li>\
                <li onclick="mineBot.editGetList(\'plastic\');" style="cursor:pointer;">Plastic</li>\
				<li onclick="mineBot.editGetList(\'cloth\');" style="cursor:pointer;">Cloth</li>\
				<li onclick="mineBot.editGetList(\'bullet\');" style="cursor:pointer;">Bullet</li>\
			</ul>\
			<hr>\
			<span style="cursor:pointer;" onclick="mineBot.logLoot=!mineBot.logLoot;mineBot.popup();"><input type="checkbox" '+streamerMode.boolToCheck(this.logLoot)+' readonly>Log Loot</span>\
			<br>\
			<input style="margin:5px;font-size:15px;" type="button" onclick="copyToClipboard(localStorage.getItem(\'travelersMiningLog\'))" value="Copy Log">\
			<br>\
			<input style="margin:5px;font-size:15px;" type="button" onclick="localStorage.removeItem(\'travelersMiningLog\')" value="Delete Log"></input>\
			<hr>\
            <label for="defaultDir">Direction</label>\
            <select name="defaultDir" id="defaultDir" style="background:inherit;" onchange="mineBot.direction=this.value">\
                <option value="n" '+(this.direction==='n'?'selected':'')+'>North</option>\
                <option value="ne" '+(this.direction==='ne'?'selected':'')+'>North-East</option>\
                <option value="e" '+(this.direction==='e'?'selected':'')+'>East</option>\
                <option value="se" '+(this.direction==='se'?'selected':'')+'>South-East</option>\
                <option value="s" '+(this.direction==='s'?'selected':'')+'>South</option>\
                <option value="sw" '+(this.direction==='sw'?'selected':'')+'>South-West</option>\
                <option value="w" '+(this.direction==='w'?'selected':'')+'>West</option>\
                <option value="nw" '+(this.direction==='nw'?'selected':'')+'>North-West</option>\
			</select>\
			<hr>\
			<label for="mineLoopAround">Loop around:</label>\
			<input id="mineLoopAround" type="checkbox" onchange="mineBot.loopAround=this.checked" '+streamerMode.boolToCheck(this.loopAround)+'>\
			<br>\
			<label for="mineLoopAroundDistance">Loop around distance:</label>\
			<input id="mineLoopAroundDistance" type="number" onchange="mineBot.loopDistance=Number(this.value)" value="'+this.loopDistance+'">\
			<hr>\
			<label for="mineAutoPlatform">Automatically craft ocean platforms:</label>\
            <input id="mineAutoPlatform" type="checkbox" onchange="mineBot.autoPlatform=this.checked" '+streamerMode.boolToCheck(this.autoPlatform)+'>\
            ',
            [{
				disp:'close',
				func:()=>POPUP.hide(),
				disable:false
			}]
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
	},
	addToLog(data){
		this.log=JSON.parse(localStorage.getItem('travelersMiningLog'))||[];
		this.log.push(data);
		localStorage.setItem('travelersMiningLog', JSON.stringify(this.log));
	},
	lootAll()
	{
		if(!this.autoPlatform){
			for(i=0;i<this.getList.length;i++){
				LOOT.takeItems(this.getList[i],10);
			}
		}
		else
		{
			if(this.verifyItem('scrap_metal', 70))LOOT.takeItems('scrap_metal', 10);
			if(this.verifyItem('copper_ore', 5))LOOT.takeItems('copper_ore', 10);
			if(this.verifyItem('steel_shard', 20))LOOT.takeItems('steel_shard', 10);
			if(this.verifyItem('plastic', 50))LOOT.takeItems('plastic', 10);
		}
	},
	/**
	 * Returns true if you can get an item
	 * @param {String} id the id to verify
	 * @param {Number} max max amount of items allowed to have
	 */
	verifyItem(id, max=1000)
	{
		return SUPPLIES.current[id]===undefined || SUPPLIES.current[id].count<max && this.getList.includes(id)
	}
};
// travel
globalThis.travelBot={
	// bresenham line algorithm implementation done my slippyIceHero. Original licensing still applies.
	// https://github.com/slippyice/travelers-bresenhamLineAlgorithm
	/*
	MIT License
	
	Copyright (c) 2020 slippyice
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	*/
	bresBOT:{err:void 0,dx:void 0,dy:void 0,sx:void 0,sy:void 0,pgx:void 0,pgy:void 0,count:void 0,limit:100,run:function(i,s,t,h){if(!(isNaN(i)&&isNaN(s)&&isNaN(t)&&isNaN(h))){if((this.count>this.limit||void 0===this.count||t!==this.pgx||h!==this.pgy)&&this.reset(),void 0===this.err){var r=this.init(i,s,t,h);this.err=r[4],this.dx=r[0],this.dy=r[2],this.sx=r[1],this.sy=r[3],this.pgx=t,this.pgy=h,this.count=0}var o=this.cycle(i,s,this.sx,this.sy,this.dx,this.dy,this.err);return this.err=o[1],o[0]}},reset:function(){this.err=void 0,this.dx=void 0,this.dy=void 0,this.sx=void 0,this.sy=void 0,this.pgx=void 0,this.pgy=void 0,this.count=0},init:function(i,s,t,h,r,o,d){var v=isNaN(r)?Math.abs(t-i):v=r,n=i<t?1:-1,e=isNaN(o)?-Math.abs(h-s):e=o,a=s<h?1:-1,y=isNaN(d)?v+e:y=d;return[v,n,e,a,y]},cycle:function(i,s,t,h,r,o,d){var v,n,e=2*d;return e>=o&&(d+=o,v=t>0?"e":"w"),e<=r&&(d+=r,n=h>0?"n":"s"),[n?v?n+v:n:v,d]}},
    xDest:YOU.x,
	yDest:YOU.y,
	tmap:[],
	debugDOM:false,
	invalidStand:['+','#','<b>#</b>','D','<b>D</b>','$','┬', WORLD.TILES.worldedge, WORLD.TILES.water],
	/**positive for clockwise negative for counter */
	spinDir:1,
	lastFlip:0,// this locks it to changing direction every blank seconds. this might also let it get out of unfinished tunnels in walls
	flipTime:1000,
	prevDir:'',
	bresenham:false,
	oppositeDir:
	{
		'n':'s',
		'e':'w',
		's':'n',
		'w':'e',
		'ne':'sw',
		'nw':'se',
		'se':'nw',
		'sw':'ne'
	},
    start(){
        this.running=true;
        if(!doubleStep.running){
            doubleStep.toggle();
		}
		let seconds=(Math.max(Math.abs(Math.max(this.xDest, YOU.x)-Math.min(this.xDest, YOU.x)),Math.max(Math.abs(Math.max(this.yDest, YOU.y)-Math.min(this.yDest, YOU.y))))*(EQUIP.current=='small boat'?.92:.95)).toFixed(0);
		let hoursToArrive = seconds/60/60;
		let d = new Date();
		d.setSeconds(d.getSeconds()+Number(seconds));
		ENGINE.log('Estimated time of arrival: '+
			d.getHours()+':'+d.getMinutes()+' '+d.toDateString()+
			' in '+
			hoursToArrive.toFixed(1)+
			' hours'
		);
		this.bresBOT.reset();
        //this.timer=setInterval(function(){travelBot.travel();}, 1000);
	},
	distanceToDest()
	{
		return Math.max(Math.abs(Math.max(this.xDest, YOU.x)-Math.min(this.xDest, YOU.x)),Math.max(Math.abs(Math.max(this.yDest, YOU.y)-Math.min(this.yDest, YOU.y))));
	},
    run(){
		let dir;
        this.xDest=Number(this.xDest);
		this.yDest=Number(this.yDest);
		this.setTmap();
		SOCKET.send({action: "event_choice", option: "__leave__"});
		SOCKET.send({action:'loot_next'});
		SOCKET.send({action:'leave_int'});
		this.bresBOT.limit=this.distanceToDest()<1000?10:100
		if(!this.bresenham || this.distanceToDest()<100)
		{
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
		}
		else
		{
			this.travelDir=this.bresBOT.run(YOU.x, YOU.y, this.xDest, this.yDest);
		}
        if(this.travelDir==''){controller.toggle('travel');return;}
		if(EQUIP.current!='small boat'||this.containsImpassableObj()){// water and no boat
            if (this.travelDir=='ne'){this.dest=[1,1];}
            else if (this.travelDir=='e'){this.dest=[1,0];}
            else if (this.travelDir=='se'){this.dest=[1,-1];}
            else if (this.travelDir=='s'){this.dest=[0,-1];}
            else if (this.travelDir=='sw'){this.dest=[-1,-1];}
            else if (this.travelDir=='w'){this.dest=[-1,0];}
            else if (this.travelDir=='nw'){this.dest=[-1,1];}
            else if (this.travelDir=='n'){this.dest=[0,1];}
			this.destTile = renderDistance.distance<1||YOU.checkProximFor(1, 'w')||(Math.max(Math.abs(YOU.x), Math.abs(YOU.y))>499990&&YOU.checkProximFor(1, '░'))? 'w':'';
			if(WORLD.otherObjs.length>0 && renderDistance.distance>=1)this.destTile = this.checkProxForObjs()? 'w':this.destTile;
			if (this.destTile=='w'){
				this.bresBOT.reset();
				switch (this.travelDir)
				{
					case 'n':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
						}
						break;
					case 'ne':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
						}
						break;
					case 'e':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
						}
						break;
					case 'se':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
						}
						break;
					case 's':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
						}
						break;
					case 'sw':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
						}
						break;
					case 'w':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
						}
						break;
					case 'nw':
						if(this.spinDir>0)
						{
							if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
						}
						else
						{
							if(!this.waterAt(this.dirToFunky('nw')))dir='nw';
							else if(!this.waterAt(this.dirToFunky('w')))dir='w';
							else if(!this.waterAt(this.dirToFunky('sw')))dir='sw';
							else if(!this.waterAt(this.dirToFunky('s')))dir='s';
							else if(!this.waterAt(this.dirToFunky('se')))dir='se';
							else if(!this.waterAt(this.dirToFunky('e')))dir='e';
							else if(!this.waterAt(this.dirToFunky('ne')))dir='ne';
							else if(!this.waterAt(this.dirToFunky('n')))dir='n';
						}
						break;
					default:
						break;
				}
				this.travelDir=dir;
				if(this.oppositeDir[dir]===this.prevDir&&this.lastFlip<0)
				{
					this.spinDir*=-1;
					this.lastFlip=this.flipTime;
				}
				//console.log(travelBot.travelDir, dir, travelBot.oppositeDir[dir], travelBot.prevDir, this.spinDir)
				//#region old bad pathing
				/*if (this.dest[0]>-1){//e
                    if (!this.waterAt(this.dest[0]-1, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]-1, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[0]<1){//w
                    if (!this.waterAt(this.dest[0]+1, this.dest[1])){
                        this.travelDir=this.numToDir(this.dest[0]+1, this.dest[1]);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]>-1){//n
                    if (!this.waterAt(this.dest[0], this.dest[1]-1)){
                        this.travelDir=this.numToDir(this.dest[0], this.dest[1]-1);
                        solutionFound=true;
                    }
                }
                else if (this.dest[1]<1){//s
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
				}*/
				//#endregion
            }
		}
		this.prevDir=this.travelDir;
		this.lastFlip--;
        if(YOU.dir!=this.travelDir)setDir(this.travelDir, autoWalk=true);
    },
    stop(){
        this.running=false;
        if(doubleStep.running){
            doubleStep.toggle();
		}
		if(YOU.autowalk)fancyDir.a.click();
		stopTravels();
        //clearInterval(this.timer);
    },
    changeDestinationX(x){
        this.xDest=x;
    },
    changeDestinationY(y){
        this.yDest=y;
    },
    waterAt(loc){
		relX=loc[0];
		relY=loc[1];
        if (this.invalidStand.indexOf((WORLD.tilemap.find(e=>e.id===(relX+YOU.x)+'|'+(relY+YOU.y)) || {innerHTML:'some super long string to only be used in case of no water visible'}).innerHTML)!=-1){
            return true;
        }
        else{
            return false;
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
	},
	dirToFunky(dir)
	{
		if (dir=='ne'){dest=[1,1];}
        else if (dir=='e'){dest=[1,0];}
        else if (dir=='se'){dest=[1,-1];}
        else if (dir=='s'){dest=[0,-1];}
        else if (dir=='sw'){dest=[-1,-1];}
        else if (dir=='w'){dest=[-1,0];}
        else if (dir=='nw'){dest=[-1,1];}
		else if (dir=='n'){dest=[0,1];}
		return dest;
	},
	setTmap()
	{
		this.tmap=[];
		WORLD.tilemap.forEach(ele=>this.tmap.push(ele.innerHTML));
	},
	containsImpassableObj()
	{
		for (let i=0; i<this.invalidStand.length; i++)
		{
			if(this.invalidStand[i]===WORLD.TILES.water)
			{
				if(EQUIP.current!='small boat')return true;
			}
			else if(this.tmap.includes(this.invalidStand[i]))
			{
				return true;
			}
		}
		return false;
	},
	checkProxForObjs()
	{
		for (let i=0; i<this.invalidStand.length; i++)
		{
			if(YOU.checkProximFor(1, this.invalidStand[i]))return true;
		}
		return false;
	},
	popup()
	{
		POPUP.new('Travel configuration',
		'\
		Bresenham line algorithm goes directly towards the destination in a straight line instead of going diagonally then straight. This doesn\'t make it any faster but changes the way you get there.\n\
		<input type="checkbox" id="travel-bresenham-check" onchange="travelBot.bresenham=this.checked" '+streamerMode.boolToCheck(this.bresenham)+'><label for="travel-bresenham-check">Bresenham algorithm</label>\
		',[{
			disp:'close',
			func:()=>POPUP.hide(),
			disable:false
		}])
	}
};
// tree farmer
globalThis.treeBot={
    autoMakeWoodFence:false,// secret feature// not anymore
	defaultDir:'n',
	exempt:[],// render distance compatibility
    start(){
		this.running=true;
        //this.timer=setInterval(function(){treeBot.tree()}, 1000);
    },
    run(){
        SOCKET.send({action: "event_choice", option: "__leave__"});
        INT.leaveInit();
        if(this.autoMakeWoodFence==true){
            if(SUPPLIES.current.wood_stick!=undefined&&SUPPLIES.current.rope!=undefined){
                if(SUPPLIES.current.wood_stick.count>=20&&SUPPLIES.current.rope.count>=1){
                    CRAFTING.open('wood_block');
                    CRAFTING.craft();
                    CRAFTING.close();
                }
            }
		}
        if (this.nextMove==='move'){
            if(this.getOneAway() || this.goto(this.targetX, this.targetY)==='there'){
				this.nextMove='';
				this.run();
			}
        }
        else{
            spiralResults=spiralFind(0, 0, 1, 961, 't', 'WOW', 'WOW', this.exempt, false);
            if (spiralResults.found===true){
                this.nextMove='move';
                this.targetX=spiralResults.relX+YOU.x;
				this.targetY=spiralResults.relY+YOU.y;
				this.exempt.push([this.targetX, this.targetY]);
				this.goto(this.targetX, this.targetY);
            }
            else{
				setDir(this.defaultDir);
				if(this.distanceTo(x,y)>1 && XP.sp>=10 && YOU.currentTile!='M' && YOU.currentTile!='w')DSTEP.click();
            }
        }
    },
    stop(){
        //clearInterval(this.timer);
        this.running=false;
		this.nextMove='travel';
	},
	getTile(relX,relY)
	{
		return (WORLD.tilemap.find(e=>e.id===(YOU.x+relX)+'|'+(YOU.y+relY)) || {innerHTML:''}).innerHTML;
	},
	getOneAway()
	{
		if(YOU.currentTile==='w')return false;
		let ring = [
			{
				dir:'n',
				x:0,
				y:1
			},
			{
				dir:'ne',
				x:1,
				y:1
			},
			{
				dir:'e',
				x:1,
				y:0
			},
			{
				dir:'se',
				x:1,
				y:-1
			},
			{
				dir:'s',
				x:0,
				y:-1
			},
			{
				dir:'sw',
				x:-1,
				y:-1
			},
			{
				dir:'w',
				x:-1,
				y:0
			},
			{
				dir:'nw',
				x:-1,
				y:1
			}
		]
		let changed = false;
		for(let loc of ring)
		{
			let tile = this.getTile(loc.x, loc.y);
			if(tile===WORLD.TILES.tree)
			{
				SOCKET.send({
					"action": "break",
					"option": BUILD.breaking_with_id,
					"dir": loc.dir
				});
				changed=true;
			}
		}
		return changed;
	},
	goto(x, y){
        if (y>YOU.y){// north south
            travelDir='n';
        }
        else if (y<YOU.y){
            travelDir='s';
        }
        else{
            travelDir='';
        }
        if (x>YOU.x){// east west
            travelDir=travelDir+'e';
        }
        else if (x<YOU.x){
            travelDir=travelDir+'w';
        }
        else{
            travelDir=travelDir+'';
		}
        if(travelDir===''){
            return 'there';
        }
        else{
			if(this.distanceTo(x,y)>2 && XP.sp>=10 && YOU.currentTile!='M' && YOU.currentTile!='w')DSTEP.click();
            setDir(travelDir);
            return 'notThere';
        }
    },
    updateFence(value){
        this.autoMakeWoodFence=value;
	},
	distanceTo(x,y)
	{
		let obj={};
		obj.X=x;
		obj.Y=y;
	   return Math.max(Math.abs(Math.max(obj.X, YOU.x)-Math.min(obj.X, YOU.x)),Math.max(Math.abs(Math.max(obj.Y, YOU.y)-Math.min(obj.Y, YOU.y))))
	}
};
// Auto city and house
globalThis.autoLoot={
	shouldLootAll:false,
	logLoot:false,
	getHouses:true,// dont set both of these to false
	getCities:true,
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
    doneStairs:false,
	defaultDir:'e',
	log:[],
    start(){
        this.running=true;
		//this.timer=setInterval(function(){autoLoot.raid()}, 1200);// I am doing 1.2 seconds because some cycles take longer and getting stuck in events is annoying. It will be slightly slower but less prone to getting stuck
		if(!doubleStep.running){
		    doubleStep.toggle();
		}
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
		else {
		    this.placeType='other'
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
            this.exemptList.push([this.targetX,this.targetY]);
            if(this.goto(this.targetX,this.targetY)=='there'){
                this.nextMove='steal';
                if(this.defaultDir=='n'||this.defaultDir=='s'){// this should make sure you don't get stuck as much
                    this.targetX=this.prevCoords.x;
                    this.targetY=YOU.y;
                }
                else if(this.defaultDir=='e'||this.defaultDir=='w'){
                    this.targetX=YOU.x;
                    this.targetY=this.prevCoords.y;
                }
                else{
                    this.targetX=this.prevCoords.x;
                    this.targetY=this.prevCoords.y;
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
            if(this.getHouses && this.getCities)spiralResults=spiralFind(0, 0, 1, 961, WORLD.TILES.city, target2=WORLD.TILES.house, target3='WOW', exempt=this.exemptList);// i guess all previous defaults need to be defined
			else if(this.getHouses && !this.getCities)spiralResults=spiralFind(0, 0, 1, 961, 'WOW', target2=WORLD.TILES.house, target3='WOW', exempt=this.exemptList);
			else if(!this.getHouses && this.getCities)spiralResults=spiralFind(0, 0, 1, 961, WORLD.TILES.city, target2='WOW', target3='WOW', exempt=this.exemptList);
			if (spiralResults.found===true){
                this.nextMove='move';
                this.targetX=spiralResults.relX+YOU.x;
                this.targetY=spiralResults.relY+YOU.y;
                this.prevCoords={x:YOU.x, y:YOU.y};
            }
            else{
                if(YOU.dir!=this.defaultDir)setDir(this.defaultDir, true);
                if(YOU.state==='event')SOCKET.send({
                    action:'event_choice',
                    option:'__leave__'
				})
				if(YOU.state==='looting')SOCKET.send({
                    action:'loot_next'
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
		this.nextMove='travel';
		stopTravels();
    },
    goto(x, y){
        if (y>YOU.y){// north south
            travelDir='n';
        }
        else if (y<YOU.y){
            travelDir='s';
        }
        else{
            travelDir='';
        }
        if (x>YOU.x){// east west
            travelDir+='e';
        }
        else if (x<YOU.x){
            travelDir+='w';
        }
        else{
            travelDir+='';
		}
        if(travelDir===''){
            if (this.nextMove=='move'){
                this.nextMove='collect';
            }
            else if (this.nextMove=='back'){
                this.nextMove='travel';
            }
            return 'there';
        }
        else{
            this.leaveEvent();
            if(YOU.dir!=travelDir)setDir(travelDir, true);
            return 'notThere';
        }
    },
    collect(){
        switch(this.placeType){
	     case 'other':
                    this.leaveEvent();
                    break;
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
                    if(this.leaveEvent('the continuing dark tunnel')){
						this.beenInTent=false;this.lootedBody=false;this.beenInSkyscraper=false;
					}
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
                    if(this.leaveEvent('outside')){
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
                    }
                    if(this.lootAll('the desk')){this.doneTreasuryDesk=true;}// shouldn't get stuck there anymore
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
                    else if(!this.doneOffice){
                        this.handelEvent('the tower lobby', 'the exit sign')
                        this.handelEvent('the exit sign', 'the fire escape')
                        this.handelEvent('the fire escape', 'the eighth floor')
                        this.handelEvent('the eighth floor', 'the office')
                        this.handelEvent('the office', 'loot area')
                        this.lootAll('the blasted office')
                        this.handelEvent('the office', 'return to tower base')
                        if(this.handelEvent('descent', 're-enter tower')){this.doneOffice=true;return;}
                    }// no clue what is was thinking with commas
                    else if(!this.doneStairs){
                        if(SUPPLIES.current.blowtorch===undefined || SUPPLIES.current.bolt_cutters===undefined){
                            this.doneStairs=true;
                            return;
                        }
                        this.handelEvent('the tower lobby', 'the staircase')
                        if(SUPPLIES.current.blowtorch!=undefined){
                            this.handelEvent('the staircase', 'the safe')
                            this.lootAll('the safe')
                        }
                        this.handelEvent('the fifteenth floor', 'the ladder')
                        this.handelEvent('the maintenance ladder', 'the eighteenth floor')
                        this.handelEvent('the eighteenth floor', 'the staircase')
                        if(SUPPLIES.current.bolt_cutters!=undefined){
                            this.handelEvent('the staircase', 'the electrical room')
                            this.lootAll('the electrical room')
                            this.handelEvent('the thirty-ninth floor', 'the lift')
                        }
                        this.handelEvent('the lift', 'ascend')
                        this.handelEvent('ascension', 'the ladders')
                        this.handelEvent('the ladders', 'loot area')
                        this.lootAll('the toolbox and pallet')
						this.handelEvent('the last platform', 'return to tower base')
						if(this.handelEvent('descent', 're-enter tower')){this.doneStairs=true;return;}
                    }
                    if(this.doneOffice && this.doneElevator && this.doneStairs && POPUP.evTitle.innerHTML=='the tower lobby'){
                        this.doneElevator=false;
                        this.doneOffice=false;
                        this.doneStairs=false;
                        this.leaveEvent();
                    }
                    break;
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
    },
	leaveEvent(name=undefined){//I added in name this way so I wouldn't have to rewrite code that worked
        if(name!=undefined&&POPUP.evTitle.innerHTML!=name){
			return;
        }
        classList=document.getElementsByClassName('popup-button')
        for(i=0;i<classList.length;i++){
            if(classList[i].value=='exit event'){
				classList[i].click();
				if(this.debugMode)console.log(classList[i]);
				SOCKET.send({'action':'event_choice','option':'__leave__'});
				SOCKET.send({'action':'loot_next'});
                return true;
            }
        }
        this.left=true;
    },
    lootAll(name){
        if(name==LOOT.titleEl.innerHTML && LOOT.mainEl.style.display!='none'){
			if(this.logLoot){
				lootData=[];
				lootItems=Object.keys(LOOT.current);// if I just do LOOT.current as the loot it also has item data which is huge
				for(i=0;i<lootItems.length;i++){
					lootData.push({
						'id':lootItems[i],
						count:LOOT.current[lootItems[i]].count
					})
				}
				this.addToLog(
					{
						evType:this.placeType,
						title:LOOT.titleEl.innerHTML,
						loot:lootData,
					}
				)
			}
            for(i=0;i<this.getList.length;i++){
                LOOT.takeItems(this.getList[i],10);
			}
			if(this.shouldLootAll)SOCKET.send({action:'loot_takeall'})
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
					if(this.debugMode)console.log(classList[i]);
                    classList[i].onclick();
                    //SOCKET.send({'action':'event_choice','option':classList[i].id});// this wont lock you in an event
                    return true;
                }
            }
			for(i=0;i<otherList.length;i++){
                if(otherList.length>0&&otherList[i].innerHTML.includes(solution)){
					otherList[i].onclick();
					if(this.debugMode)console.log(otherList[i]);
                    //SOCKET.send({'action':'event_choice','option':otherList[i].id});
                    return true;
                }
            }
        }
    },
    // checkItem wasn't even used
    popup(){
        POPUP.new(
            'City/House Raider Configuration',// if I don't put \ at the end of lines then there are line breaks everywhere
            `\
            <h3 style="margin-top:0px;margin-bottom:0px;">Item Configuration</h3>\
			<ul style="height:470px;overflow:scroll;margin:0px;">`+
			'<li style="cursor:pointer;" onclick="autoLoot.shouldLootAll=!autoLoot.shouldLootAll;autoLoot.popup();"><input type="checkbox" '+streamerMode.boolToCheck(this.shouldLootAll)+' readonly>Loot All</li>'+
            this.toggleButton('axe')+
            this.toggleButton('baseball_bat')+
            this.toggleButton('blow_torch')+
			this.toggleButton('bolt_cutters')+
			this.toggleButton('bp_high_teleporter',displayName='high range teleporter blueprint')+
            this.toggleButton('bp_low_teleporter',displayName='low range teleporter blueprint')+
            this.toggleButton('bp_metal_detector',displayName='metal detector blueprint')+
            this.toggleButton('bp_reality_anchor',displayName='personal reality anchor blueprint')+
            this.toggleButton('bullet')+
            this.toggleButton('circuit_board')+
            this.toggleButton('cloth')+
            this.toggleButton('copper_coil')+
            this.toggleButton('crowbar')+
            this.toggleButton('battery',displayName='energy cell')+
			this.toggleButton('fire_extinguisher')+
			this.toggleButton('keycard_a', displayName='keycard a')+
			this.toggleButton('keycard_b', displayName='keycard b')+
			this.toggleButton('keycard_c', displayName='keycard c')+
			this.toggleButton('keycard_d', displayName='keycard d')+
			this.toggleButton('keycard_e', displayName='keycard e')+
            this.toggleButton('machete')+
            this.toggleButton('maintenance_key')+
            this.toggleButton('medical_pill')+
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
			<span style="cursor:pointer;" onclick="autoLoot.logLoot=!autoLoot.logLoot;autoLoot.popup();"><input type="checkbox" `+streamerMode.boolToCheck(this.logLoot)+` readonly>Log Loot</span>
			<input style="margin:0px;font-size:15px;" type="button" onclick="copyToClipboard(localStorage.getItem('travelersEventRaiderLog'))" value="Copy Log">\
			<input style="margin:0px;font-size:15px;" type="button" onclick="localStorage.removeItem('travelersEventRaiderLog')" value="Delete Log">
            <label for="defaultDir">Direction</label>\
            <select name="defaultDir" id="defaultDir" style="background:inherit;" onchange="autoLoot.defaultDir=this.value" value=`+this.defaultDir+`>\
                <option value="n">North</option>\
                <option value="ne">North-East</option>\
                <option value="e">East</option>\
                <option value="se">South-East</option>\
                <option value="s">South</option>\
                <option value="sw">South-West</option>\
                <option value="w">West</option>\
                <option value="nw">North-West</option>\
            </select>\
            `.replace('value="'+this.defaultDir+'"', 'value="'+this.defaultDir+'" selected'),
            [{
				disp:'close',
				func:()=>POPUP.hide(),
				disable:false
			}]
        );
        document.getElementById('event-desc').style.maxHeight='650px';
    },
    toggleButton(ID, displayName=null){
        if(displayName!=null){
            return '<li style="cursor:pointer;" onclick="autoLoot.editGetList(\''+ID+'\')"><input type="checkbox" '+this.inGetList(ID)+' readonly>'+displayName+'</li>'
        }
        return '<li style="cursor:pointer;" onclick="autoLoot.editGetList(\''+ID+'\')"><input type="checkbox" '+this.inGetList(ID)+' readonly>'+ID.replace(/_/g,' ')+'</li>'
    },
    editGetList(item){
        if(this.getList.includes(item)){
            this.getList.splice(this.getList.indexOf(item),1);
        }
        else{
            this.getList.push(item);
        }
        this.popup();
    },
    inGetList(item){
        if(this.getList.includes(item)){
            return 'checked';
        }
        else{
            return'';
        }
	},
	addToLog(data){
		this.log=JSON.parse(localStorage.getItem('travelersEventRaiderLog'))||[];
		this.log.push(data);
		localStorage.setItem('travelersEventRaiderLog', JSON.stringify(this.log));
	}
};
// bigXPBot
globalThis.bigXPBot={
    exemptList:[],
    xDest:YOU.x,
    yDest:YOU.y,
    getEvents:true,
    start(){
        this.running=true;
        if(!doubleStep.running){
            doubleStep.toggle();
        }
        if(!this.getEvents){interval=1300;}
        else{interval=1000;}
        //this.timer=setInterval(function(){bigXPBot.run();}, interval);
    },
    run(){
        found=false;
        if(this.getEvents){spiralResults=spiralFind(0, 0, 1, 961, 'C', target2='H', target3='WOW', exempt=this.exemptList);if(spiralResults.found==true){found=true;}}
        if(found==true){
            dir=this.getDir(spiralResults.relX+YOU.x, spiralResults.relY+YOU.y);
        }
        else{
            dir=this.getDir(this.xDest,this.yDest);
		}
		if(WORLD.otherPlayers.length>0)
		{
			SOCKET.send({action:'leave_int'});
		}
		SOCKET.send({action:'loot_next'});
        if(YOU.currentTile=='H' || YOU.currentTile=='C'){
            if(!this.exemptList.includes([YOU.x,YOU.y])){
                this.exemptList.push([YOU.x,YOU.y]);
            }
            SOCKET.send({action: "event_choice", option: "__leave__"});
        }
        if(this.exemptList.length>100){
            this.exemptList.shift();
        }
        if(YOU.x==this.xDest && YOU.y==this.yDest){
            controller.toggle('bigXP');
            controller.toggle('xp');
        }
        setDir(dir);
    },
    stop(){
        this.running=false;
        if(doubleStep.running){
            doubleStep.toggle();
        }
        //clearInterval(this.timer);
    },
    changeDestinationX(x){
        this.xDest=Number(x);
    },
    changeDestinationY(y){
        this.yDest=Number(y);
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
    }
};
// waypoint travel
globalThis.wayPointTravel={
    wayPointList:[],// format is [[x,y],[x,y]]
    digHoles:false,// don't use for stuff
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
            while(direction==''){
                if(this.wayPointList.length>0){
                    this.wayPointList.shift();
                    if(YOU.checkProximFor(5,'w')===false&&this.digHoles)
                    {
                        SUPPLIES.open('shovel');EQUIP.open();
                        SOCKET.send({action:'equipment', option:'dig'});
                        setTimeout(()=>{SUPPLIES.open('boat');EQUIP.open();},10000);
                    }
				}
				else{return;}
				direction=this.getDir(this.wayPointList[0][0],this.wayPointList[0][1]);
			}
            if(YOU.dir!=direction)setDir(direction, autowalk=true);
            SOCKET.send({action: "event_choice", option: "__leave__"});
            if(this.digHoles)LOOT.takeall();
            SOCKET.send({action:'loot_next'});
        }
    },
    stop(){
        this.running=false;
        //clearInterval(this.timer);
        if(doubleStep.running){
            doubleStep.toggle();
		}
		stopTravels();
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
				[{
					disp:'close',
					func:()=>POPUP.hide(),
					disable:false
				}]
        );
    }
};
// auto breaker
globalThis.autoBreaker={
    running:false,
    toggle(){
        if(this.running){
            this.stop();
        }
        else{
            this.start();
        }
        controller.toggleColor('autoBreaker');
    },
    start(){
        this.running=true;
    },
    stop(){
        this.running=false;
    },
    run(){
        if(YOU.biome==='mountains'||YOU.biome==='swamp'||YOU.biome==='forest edge'||YOU.biome==='forest clearing'||YOU.biome==='forest'||YOU.biome==='wasteland'){
            if((BUILD.breakTimerEl.style.display==='none'||BUILD.boxEl.style.display==='none')&& !YOU.checkProximFor('w', 3)){// this stops all oceans
                if(WORLD.otherObjs.length===0)return;
                HANDS.breakBtnEl.className = "hotbar-btn unselectable active";
                ENGINE.addCycleTrigger(function (){HANDS.breakBtnEl.className = "hotbar-btn unselectable";});
                SOCKET.send({
                  "action": "break",
                  "option": BUILD.breaking_with_id||'hands',
                  "dir": YOU.dir
                });
            }
        }
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
        controller.toggleColor('reconnect')
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
};
// event stopper
globalThis.eventStop={
    running:false,
    knownList:['&nbsp;', ',', 't','w','M','H','C','<b>&amp;</b>','.','~','T','<b><b>&amp;</b></b>','░'],
    ignoreList:[],
    newList:[],
    toggle(){
        if (this.running==false){
            this.running=true;
            //this.timer=setInterval(function(){eventStop.run()}, 1000);
        }
        else{this.stop()}
        controller.toggleColor('eventFind')
    },
    run(){
        for(i=0;i<WORLD.tilemap.length;i++){
            tile=WORLD.tilemap[i].innerHTML
            if(this.knownList.includes(tile)===false&&this.ignoreList.includes(tile)===false){
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
    /*updateNewPlayer(value){
        if(value==true){
            this.knownList.pop();
        }
        else{
            this.knownList.push('&amp;');
        }
    }*/
    popup(){
        POPUP.new(
            'Event Stopper Configuration',
            'Will Ignore:'+JSON.stringify(this.ignoreList.sort())+'<hr>'+`\
            <h3 style="margin-top:0px;margin-bottom:0px;">Item Configuration</h3>\
            <ul>`+
            this.item('&')+
            this.item('@')+
            this.item('u')+
            this.item('n')+
            this.item('o')+
            this.item('+')+
            this.item('D')+
            this.item('#')+
            this.item('<b>D</b>')+
            this.item('<b>#</b>')+
            this.item('$')+
            this.item('┬')+
            this.item('¶')+
            this.item('◻')+
			this.item('▭')+
			this.item('Θ')+
            this.item('B')+
            this.item('_')+
            this.item('▋')+
            this.item('<b>S</b>')+
            this.item('△')+
            this.item('▢')+
            this.item('⬓')+
            this.item('⬟')+
            this.item('▥')+
			this.item('◫')+
			this.item('⬡')+
			`</ul>`,
			[{
				disp:'close',
				func:()=>POPUP.hide(),
				disable:false
			}]
        )
    },
    item(character){
        return '<li onclick="eventStop.toggleItem(this.innerText);" style="cursor:pointer;"><input type="checkbox" '+this.inGetList(character)+' readonly>'+character+'</li>'
    },
    toggleItem(item){
        if(this.ignoreList.includes(item)){
            this.ignoreList.splice(this.ignoreList.indexOf(item),1);
        }
        else{
            this.ignoreList.push(item);
        }
        this.popup();
    },
    inGetList(item){
        if(this.ignoreList.includes(item)){
            return 'checked';
        }
        else{
            return '';
        }
    }
};
// location logger
globalThis.locationLogger={
    running:false,
    markHoles:true,
    toggle(){
        if (this.running==false){
            this.running=true;
            //this.timer=setInterval(function(){locationLogger.run()}, 1000);
        }
        else{this.stop();}
        controller.toggleColor('locationLogger');
    },
    run(){
        logList=[];
        data=''
        data=localStorage.getItem('travelersLocationLogger');
        if(data!=''&&data!=null){
            logList=JSON.parse(data);
        }
        if(WORLD.otherObjs.length>0){
            for(i=0;i<WORLD.otherObjs.length;i++){
                if(JSON.stringify(logList).includes(JSON.stringify({char:WORLD.otherObjs[i].char,X:WORLD.otherObjs[i].x,Y:WORLD.otherObjs[i].y}))==false){
                    if(WORLD.otherObjs[i].char!='C' && WORLD.otherObjs[i].char!='H'){// visited cities and houses count as objects I guess  ¯\_(ツ)_/¯
                        if(WORLD.otherObjs[i].char!='o'||this.markHoles==true){
                            logList.push({char:WORLD.otherObjs[i].char,X:WORLD.otherObjs[i].x,Y:WORLD.otherObjs[i].y});
                        }
                    }
                }
            }    
        }
        for(i=0;i<WORLD.otherPlayers.length;i++){
            if(JSON.stringify(logList).includes(JSON.stringify({char:'&',X:WORLD.otherPlayers[i].x,Y:WORLD.otherPlayers[i].y}))==false){
                logList.push({char:'&',X:WORLD.otherPlayers[i].x,Y:WORLD.otherPlayers[i].y});
            }
        } 
        for(i=0;i<WORLD.otherStumps.length;i++){
            if(JSON.stringify(logList).includes(JSON.stringify({char:'stump',X:WORLD.otherStumps[i].x,Y:WORLD.otherStumps[i].y}))==false){
                logList.push({char:'stump',X:WORLD.otherStumps[i].x,Y:WORLD.otherStumps[i].y});
            }
        } 
        localStorage.setItem('travelersLocationLogger',JSON.stringify(logList));
    },
    stop(){
        this.running=false;
        //clearInterval(this.timer);
    },
    show(){
        if(localStorage.getItem('travelersLocationLogger')==null){
            localStorage.setItem('travelersLocationLogger','');
        }
        POPUP.evBox.style.maxHeight="900px";
        // warning long line of unreadable html
        POPUP.new('locations','<p style="height:500px;overflow:scroll;">'+localStorage.getItem('travelersLocationLogger').split('},').join('}<br>').replace('[','').replace(']','')+'</p>'+'<hr><div style="cursor:pointer;border:1px solid black;text-align:center;" onclick=copyToClipboard(localStorage.getItem("travelersLocationLogger"));this.innerText="copied";this.onclick="" >Copy</div><div style="cursor:pointer;border:1px solid black;text-align:center;" onclick=localStorage.removeItem("travelersLocationLogger");POPUP.hide()>Clear Logs</div>',[{
			disp:'close',
			func:()=>POPUP.hide(),
			disable:false
		}])
    }
};
// freecam
globalThis.freeCam={
    running:false,
    speed:1,
    x:0,
	y:0,
	delay:50,
    toggle(){
        if (this.running==false){
            this.running=true;
            this.timer=setInterval(function(){freeCam.run()}, this.delay);
            if(document.getElementById('freeCamX').value!=''){
                this.x=YOU.x*-1+Number(document.getElementById('freeCamX').value)
            }
            if(document.getElementById('freeCamY').value!=''){
                this.y=YOU.y*-1+Number(document.getElementById('freeCamY').value)
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
        controller.toggleColor('freeCam');
    },
    run(){
        changed=false;
        if(KEYBOOL.w){
            this.y+=this.speed;
            changed=true;
        }
        else if(KEYBOOL.s){
            this.y-=this.speed;
            changed=true;
        }
        if(KEYBOOL.a){
            this.x-=this.speed;
            changed=true;
        }
        else if(KEYBOOL.d){
            this.x+=this.speed;
            changed=true;
        };
        if(changed==true){
			try{
				WORLD.build();
				WORLD.checkPlayersAndObjs();
			}
			catch(err){};
        }
    },
    stop(){
        this.running=false;
        clearInterval(this.timer);
        this.x=0;
        this.y=0;
		WORLD.build();
		WORLD.checkPlayersAndObjs();
    }
};
// world download
globalThis.worldDownload={
    buffer:10,
    hideTerrain:false,
    fontSize:20,
	debug:false,// change this if it isn't working
	maxSize:3000,
    configure(){
        POPUP.new(
            'World Download Configuration',
			this.getPopupDesc().replace(/\n/g,''),
			[{
				disp:'close',
				func:()=>POPUP.hide(),
				disable:false
			}]
        )
    },
    getPopupDesc(){
        return `
        Buffer:<input type="number" onchange="worldDownload.buffer=Number(this.value)" value="`+this.buffer+`"><br>
        Text Size:<input type="number" onchange="worldDownload.fontSize=Number(this.value)" value="`+this.fontSize+`"><br>
        Hide natural terrain:<input type="checkbox" onchange="worldDownload.hideTerrain=Boolean(this.checked)" `+streamerMode.boolToCheck(this.hideTerrain)/*I dont feel like moving boolToCheck for just this one bit*/+`><br>
        `
    },
    async popup(){
        sleep=function(ms){return new Promise(resolve => setTimeout(resolve, ms));}
        buffer=this.buffer;
        locations=JSON.parse(localStorage.getItem('travelersLocationLogger'));
        minX=locations[0].X;
        minY=locations[0].Y;
        maxX=locations[0].X;
		maxY=locations[0].Y;
        for(i=0;i<locations.length;i++)
        {
            item=locations[i];
            if(item.X<minX){minX=item.X};
            if(item.X>maxX){maxX=item.X};
            if(item.Y<minY){minY=item.Y};
            if(item.Y>maxY){maxY=item.Y};
		}
		if(maxX-minX>this.maxSize || maxY-minY>this.maxSize){// sorry but this is bad for misclicks
			window.alert('The area must be less than '+this.maxSize/1000+'k tiles across');
			return;
		}
        tiles=[]
        time=0
        for(y=maxY+buffer;y>minY-buffer;y--)
        {
            row=[];
            for(x=minX-buffer;x<maxX+buffer;x++)
            {
                if(!this.hideTerrain)tile=WORLD.deriveTile(x,y);
                else{tile=' '}
                for(i=0;i<locations.length;i++)
                {
                    item=locations[i];
                    if(item.X==x&&item.Y==y)
                    {
                        if(item.char!='stump'){tile=item.char;}
                        else{tile=',';}
                    }
                }
                row.push(tile);
            }
            tiles.push(row);
            time++
            if(time%50===0){
                await sleep(0);
            }
        }
        if(this.debug)console.log('done generated tiles');
        width=tiles[0].length*this.fontSize+buffer;
        height=tiles.length*this.fontSize+buffer;
        POPUP.new(
			'Copy The Image',
			'<canvas id="worldDownloadCanvas" width="'+width+'" height="'+height+'" style="border:1px solid black;overflow:scroll;">Your browser doesn\'t support canvas so too bad</canvas>',
			[
				{
					disp:'open in new tab',
					func:function()
					{
						let x=window.open('');
						x.document.write('<img src="'+canvas.toDataURL('image/png')+'">');
						POPUP.selected=false;
					},
					disable:false
				},
				{
					disp:'close',
					func:function()
					{
						POPUP.hide();
						POPUP.selected=false;
					},
					disable:false
				}
			]);
        canvas=document.getElementById('worldDownloadCanvas');
        ctx=canvas.getContext('2d');
        ctx.font=this.fontSize+'px Courier New';
        ctx.fillStyle='#ffffff'
        ctx.fillRect(0,0,width,height);
        ctx.fillStyle='#000000';
        if(this.debug)console.log('canvas context done');
        /*for(i=0;i<tiles.length;i++){// this way didn't work with bold
            row='';
            for(j=0;j<tiles[i].length;j++){
                row+=tiles[i][j];
			}
			row = row.replaceAll('<b>', '').replaceAll('</b>', '');
            row=row.replaceAll('&nbsp;',' ');
            for(j=0;j<row.length;j++){
				if(!(row[j].includes('<')&&!row[j].includes('>')&&!row[j].includes('b')))ctx.fillText(row[j],j*this.fontSize,(i*this.fontSize)+this.fontSize);
				else{
					ctx.font='bold '+this.fontSize+'px Courier New';
					ctx.fillText(row[j],j*this.fontSize,(i*this.fontSize)+this.fontSize);
					ctx.font=this.fontSize+'px Courier New';
				}
            }
            if(i%10===0&&this.debug)console.log((i/tiles.length)*100+'% done drawing');
		}*/
		for (x=0; x<tiles.length; x++)
		{
			for (y=0; y<tiles[x].length; y++)
			{
				tile=tiles[x][y];
				if(tile=='&nbsp;')tile=' ';
				if(this.debug)console.log({x:x,y:y,tile:tile});
				if(!tile.includes('<b>'))ctx.fillText(tile,y*this.fontSize,(x*this.fontSize)+this.fontSize);
				else{
					tile = tile.replace('<b>', '').replace('</b>', '');
					ctx.font='bold '+this.fontSize+'px Courier New';
					ctx.fillText(tile,y*this.fontSize,(x*this.fontSize)+this.fontSize);
					ctx.font=this.fontSize+'px Courier New';
				}
			}
			if(x%10===0&&this.debug)console.log((i/tiles.length)*100+'% done drawing');
		}
		ctx.font=this.fontSize*1.5+'px Courier New';
		ctx.fillText('Download by lightning world download system',this.fontSize,this.fontSize);
    }
};
// streamer mode to hide stuff
globalThis.streamerMode={
    hideNotifs:false,
    hideCoords:false,
	hideBiome:false,
	hoverCoords:true,
	hideSeason:false,
    initialize(){
        const tileNames=Object.getOwnPropertyNames(WORLD.TILES);
        for(let i=0; i<tileNames.length; i++){
            if(tileNames[i]!='sand')this.changeTileGen(tileNames[i]);//  if sand breaks it all breaks
        }
        WORLD.checkWorldNotifsAndLogs=eval('('+WORLD.checkWorldNotifsAndLogs.toString().replace('SETTINGS.notifAny !== "true"','SETTINGS.notifAny !== "true"||streamerMode.hideNotifs')+')');
        WORLD.checkPlayersAndObjs=eval('('+WORLD.checkPlayersAndObjs.toString().replace('WORLD.TILES.house','WORLD.TILES.house||WORLD.TILES.sand').replace('WORLD.TILES.city','WORLD.TILES.city||WORLD.TILES.sand')+')')
        YOU.checkMoveLog=eval('('+YOU.checkMoveLog.toString().replace('let text = \'\';','if(streamerMode.hideNotifs){return;};let text = \'\';')+')');
        this.TILES=JSON.parse(JSON.stringify(WORLD.TILES));// texture pack
		document.querySelector("#world-position").style.height='32px';
		this.slippyCordDesc();
	},
	slippyCordDesc(){
		{
		// something made by slippyIceHero with some slight modification to avoid globals
		// https://github.com/slippyice/thetravelers-mod-coorddesc
		// original licensing still applies
		/*
		MIT License

		Copyright (c) 2020 slippyice

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
		*/
		//////////////////////
		/*
		makes it so coords display in the tile description box that appears when hovering over tiles on thetravelers.online
		also has streamer mode functionality for anyone that cares
		this is purely just a small QoL mod
		-slippy/hentai
		*/
		//////////////////////
		}
		streamerMode.coord_desc = function (el, stream) {
			if (streamerMode.hoverCoords) {return "";}//if true, do not show coords, for streamers
			let coords = el.id.split("|");
			return "<br>x: "+coords[0]+"<br>y: "+coords[1];
		}
		var desc_rem = 'html = WORLD.returnTileDesc(el);';
		var desc_add = `html = WORLD.returnTileDesc(el)+streamerMode.coord_desc(el, streamer);`;
		var desc_str = HOVER.on.toString();
		desc_str = desc_str.replace(desc_rem, desc_add);
		HOVER.on = eval('('+desc_str+')');//thank you LightningWB
	},
    changeTileGen(tileName){
        WORLD.deriveTile=eval('('+WORLD.deriveTile.toString().replace(RegExp('this.TILES.'+tileName, 'g'),'this.TILES.'+tileName+'||bottomtile')+')');
    },
    open(){
        POPUP.new(
            'Streamer Mode',
            this.toggleBox('grass')+
            this.toggleBox('tree')+
            this.toggleBox('forest')+
            this.toggleBox('house')+
            this.toggleBox('city')+
            this.toggleBox('swamp')+
            this.toggleBox('mountain')+
            this.toggleBox('water')+
            this.toggleBox('worldedge')+
            this.toggleBox('island')+
            '<input type="checkbox" id="streamerMode-hideNotifs" onchange="streamerMode.hideNotifs=this.checked" '+this.boolToCheck(this.hideNotifs)+'><label for="streamerMode-hideNotifs">Hide Biome Notifications</label><br>'+
			'<input type="checkbox" id="streamerMode-hideBiome" onchange="streamerMode.toggleBiome(this.checked)" '+this.boolToCheck(this.hideBiome)+'><label for="streamerMode-hideBiome">Hide Biome</label><br>'+
			'<input type="checkbox" id="streamerMode-hideSeason" onchange="streamerMode.toggleSeason(this.checked)" '+this.boolToCheck(this.hideSeason)+'><label for="streamerMode-hideSeason">Hide Time and Season</label><br>'+
			'<input type="checkbox" id="streamerMode-hideHoverCoords" onchange="streamerMode.hoverCoords=this.checked" '+this.boolToCheck(this.hoverCoords)+'><label for="streamerMode-hideHoverCoords">Hide hover coordinates</label><br>'+
            '<input type="checkbox" id="streamerMode-hideCoords" onchange="streamerMode.toggleCoords(this.checked)" '+this.boolToCheck(this.hideCoords)+'><label for="streamerMode-hideCoords">Hide Coordinates</label><br>'
        )
    },
    boolToCheck(bool){
        if(bool)return 'checked';
        return '';
    },
    toggleCoords(checked){
		this.hideCoords=checked;
		document.querySelector("#world-coords").style.opacity=checked?'0':''; 
        this.open();
    },
    toggleBiome(checked){
		this.hideBiome=checked;
		document.querySelector("#world-biome").style.opacity=checked?'0':'';
        this.open();
	},
	toggleSeason(checked){
		this.hideSeason=checked;
		document.querySelector("#time-ofday").style.opacity=checked?'0':'';
        this.open();
    },
    toggleTile(tileName){
        if(WORLD.TILES[tileName]===undefined){
            WORLD.TILES[tileName]=this.TILES[tileName];
        }
        else{
            WORLD.TILES[tileName]=undefined;
        }
        this.open();
        WORLD.build();
    },
    toggleBox(name){
        if(WORLD.TILES[name]!=undefined){
            return '<input type="checkbox" id="streamerMode-'+name+'" onchange="streamerMode.toggleTile(\''+name+'\')" checked><label for="streamerMode-'+name+'">Show '+name+'</label><br>';
        }
        return '<input type="checkbox" id="streamerMode-'+name+'" onchange="streamerMode.toggleTile(\''+name+'\')" ><label for="streamerMode-'+name+'">Show '+name+'</label><br>';
    }
};
// render distance
globalThis.renderDistance={
	distance:15,
	maxDistance:50,// you shouldn't need this to be any bigger
    open(){
        popupText= 
        `
        <hr>
        <div style="margin-left:auto;margin-right:auto;width:387px;">
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, false)" value="-10">
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, false)" value="-5">
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, false)" value="-1">
            `
            +this.distance+
            `
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, true)" value="+1">
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, true)" value="+5">
            <input style="margin:0px;" type="button" onclick="renderDistance.reload(Number(this.value), true, true, true)" value="+10">
		</div>
		<hr>
		<span id="renderDistanceErrorMessage" style="color:red;"></span>
        `
        POPUP.new(
            'Render Distance',
            popupText.replace(/\n/g,'').replace(/\t/g,''),
            [
                {
                    disp:'close',
                    func:()=>{
                        POPUP.hide();
                    },
                    disable:false
                }
            ]
        )
    },
    reload(change=0, popup=true, build=true, errors = false){
		function fail(reason)
		{
			setTimeout(
				()=>document.getElementById('renderDistanceErrorMessage').innerHTML='<b>Error:'+reason+'</b>',
				0
			)
		}
        this.distance+=change;
        if(this.distance<0)this.distance=0;
		if(this.distance>this.maxDistance)this.distance=this.maxDistance;
		let width = Number(getComputedStyle(WORLD.tilemap[0]).width.replace('px', ''));
		let height = Number(getComputedStyle(WORLD.tilemap[0]).height.replace('px', ''));
		let fontSize = Number(getComputedStyle(WORLD.tilemap[0]).fontSize.replace('px', ''));
		//console.log(width, height)
        WORLD.gridRadius=this.distance;
        WORLD.boxElem.replaceChildren();
        WORLD.tilemap=[];
        WORLD.initialize();
		WORLD.boxElem.style.width=WORLD.gridRadius*(width*2)+25+'px';
		let changePx = 20;
		WORLD.boxElem.style.height=WORLD.gridRadius*(height*2)+20+'px';
		if(window.innerWidth<375)
		{
			changePx=8;
			WORLD.boxElem.style.height=(WORLD.gridRadius*(height*3.2)+8)+'px';
		}
		else if(window.innerWidth<560)
		{
			changePx=8;
			WORLD.boxElem.style.height=(WORLD.gridRadius*(height*2.5)+8)+'px';
		}
		document.getElementsByClassName('mid-screencontainer')[0].style.minWidth=Number(getComputedStyle(WORLD.boxElem).width.replace('px', ''))+56-changePx+'px';
		if(
			Number(getComputedStyle(document.querySelector("#game-content > div.mid-screencontainer.scrollbar")).width.replace('px', ''))>window.innerWidth &&// if world box width is greater than the window width
			errors
		)
		{
			fail('too big for your screen');
			this.reload(-1*change, false, false);
		}
		if(build)
		{
			WORLD.build();
			WORLD.checkPlayersAndObjs();
		}
        if(popup)this.open();
    }
};
// anti interaction
globalThis.antiInt=
{
	running:false,
	timeout:0,
	/**
	 * The delay between sending leave int packets
	 */
	delay:20,
	/**
	 * Toggles the state of this
	 */
	toggle()
	{
		this.running=!this.running;
		clearTimeout(this.timeout);
		if(this.running)this.run();
		controller.toggleColor('antiInt');
	},
	/**
	 * The function to keep you out of interactions
	 */
	run()
	{
		if(!this.running)return;
		SOCKET.send({action:'leave_int'});
		this.timeout = setTimeout(()=>{antiInt.run();}, this.delay);
	}
};
// greater efficiency
globalThis.cycleAligner={
    modules:[doubleStep,XPBot,mineBot,travelBot,treeBot,autoLoot,bigXPBot,wayPointTravel,eventStop,locationLogger,autoBreaker],
    initialize(){
        ENGINE.addCycleTrigger('cycleAligner.checkRunning()');
    },
    checkRunning(){
        setTimeout(function(){cycleAligner.checkAll();},0)
    },
    checkAll(){
		ENGINE.addCycleTrigger('cycleAligner.checkRunning();');
		if(ENGINE.midCycleDataCall)return;
        for(let i=0;i<cycleAligner.modules.length;i++){
            if(cycleAligner.modules[i].running){
				try{cycleAligner.modules[i].run();}
				catch(err){console.log('Error on '+i+' module:'+err + ' at '+err.stack)}
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
        else if(job=='patrol'){
            patrolPvp.start();
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
        else if(job=='patrol'){
            patrolPvp.stop();
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
        else if(job=='wayPointTravel'){// waypoints
            if (wayPointTravel.running==true){
                this.stop('wayPointTravel');
            }
            else{
                this.start('wayPointTravel');
            }
        }
        else if(job=='patrol'){
            if(patrolPvp.running===true){
                this.stop('patrol');
            }
            else{
                this.start('patrol');
            }
        }
        else{
            window.alert('Error: Job not found');
        }
        this.toggleColor(job);
    },
    toggleColor(id){
        if (document.getElementById(id).classList.contains('toolUnClicked')){
            document.getElementById(id).classList.remove('toolUnClicked');
            document.getElementById(id).classList.add('toolClicked');
            if (id=='travel'){//  because travel has i=child classes those have to be accessed separately
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
	},
	makeUIElem(innerHTML, width, x, y)
	{
		const ele = document.createElement('div');
		ele.selected=false;
		function onclick()
		{
			if(ele.selected)ele.style.minHeight='';
			else ele.style.minHeight='50px';
			ele.selected = !ele.selected;
		}
		ele.onclick = onclick;
		ele.style.position='absolute';
		ele.onmousedown=function()
		{
			ele.mouseDown=true;
		}
		ele.onmouseenter=function()
		{
			ele.mouseIn=true;
		}
		ele.onmousemove=function(event)
		{
			console.log(ele.mouseDown, ele.mouseIn)
			if(!ele.mouseDown||!ele.mouseIn)return;
			ele.style.left=(event.screenX-10)+'px';
			ele.style.top=(event.screenY-10)+'px';
		}
		ele.onmouseout=function()
		{
			ele.mouseIn=false;
		}
		ele.onmouseup=function()
		{
			ele.mouseDown=false;
		}
		window.onmouseup=function()
		{
			ele.mouseDown=false;
		}
		ele.innerHTML=innerHTML;
		ele.classList=['unselectable'];
		ele.style.cursor='pointer';
		ele.style.backgroundColor='rgba(0,0,0,0)';
		ele.mouseDown=false;
		return ele;
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
        POPUP.new(null,this.changes.replace(/\n/g,''))// no longer have to add in \
    },
    changes:
    `<h1 id="changelog">Changelog</h1>
	<hr>
	<h2 id="2-1-2">2.1.2</h2>
	<ul>
	<li>Fixed a bug with travel getting stuck on oceans</li>
	<li>Added some slight optimizations for event raider</li>
	<li>You can now press the f key to toggle free cam and space to return to the player</li>
	<li>Tree mower will now &quot;dismantle&quot; trees to harvest more than one per cycle</li>
	</ul>
	<h2 id="2-1-1">2.1.1</h2>
	<ul>
	<li>Redid ui sizing to allow better browser and mobile compatibility</li>
	<li>Changed auto ocean platform crafting to only collect certain resources</li>
	<li>Revamped Auto Mine ui</li>
	<li>Removed anti interaction as you can no longer leave interactions instantly</li>
	<li>Updated event tag to not get stuck on looting events and players</li>
	<li>Added mobile compatibility for world download</li>
	<li>Halved bookmarklet file size so you can copy it far easier on mobile</li>
	<li>Many improvements with the hotbar</li>
	<li>This will likely be the final update for the travelers.online tools as I see no further way to improve it. This has been a wonderful project and I hope you enjoy using it.</li>
	</ul>
	<h2 id="2-1-0">2.1.0</h2>
	<ul>
	<li>Added a leaderboard viewer</li>
	<li>Made the ui spaced better</li>
	<li>Added configurable render distance</li>
	<li>Auto structure mower</li>
	<li>Update 1.1.0 compatible mining</li>
	<li>Added world download</li>
	<li>Added streamer mode</li>
	<li>Revamped help menu</li>
	<li>Improved event raider pathing to events and allowed more of blasted city to be explored if you have a blowtorch and bolt cutters</li>
	<li>You can now log loot with event raider</li>
	<li>Added anti interaction</li>
	<li>Travel will now navigate around all oceans and most player structures unless you are near the world border</li>
	<li>Added eta to travel bot</li>
	<li>Improved tree mower</li>
	<li>Added bresenham line algorithm to travel from slippyIceHero.</li>
	</ul>
	<h2 id="2-0-1">2.0.1</h2>
	<ul>
	<li>Fixed event tag getting stuck</li>
	</ul>
	<h2 id="2-0-0">2.0.0</h2>
	<ul>
	<li>2.0.0 UPDATE</li>
	<li>Browser extension</li>
	<li>Mapexplorer now brings you to your current coords</li>
	<li>Now you can use freecam while auto walking</li>
	<li>Added the ability to configure location stopper to ignore tiles</li>
	<li>Now you can enable auto fence crafting in tree mower</li>
	<li>Added diagonals to tree bot</li>
	<li>Added a Location logger</li>
	<li>Added a travel bot to tag events for xp</li>
	<li>You can now use this on mobile with bookmarklets</li>
	<li>Made event raider ui much more user friendly</li>
	</ul>
	<h2 id="1-5-1">1.5.1</h2>
	<ul>
	<li>Added a bookmarklet</li>
	<li>Added in diagonals to event raider</li>
	<li>Now you can enter waypoints as a list</li>
	</ul>
	<h2 id="1-5-0">1.5.0</h2>
	<ul>
	<li>Added the ability to teleport anywhere with freecam</li>
	<li>Made city/house raider not get stuck as often</li>
	<li>Added in a system to align scripts running to the cycles</li>
	<li>Added in the ability to choose what to mine for in auto mine</li>
	<li>Added the ability to choose what to get from city/house raider</li>
	<li>Added waypoint travel</li>
	<li>Added changelog</li>
	</ul>
	<h2 id="1-4-0">1.4.0</h2>
	<ul>
	<li>Added freecam</li>
	</ul>
	<h2 id="1-3-0">1.3.0</h2>
	<ul>
	<li>Reworked UI</li>
	<li>Added a location stopper</li>
	<li>Added map explorer</li>
	<li>Hid auto reconnect from the ui because the exploit is used got patched</li>
	</ul>
	<h2 id="1-2-3">1.2.3</h2>
	<ul>
	<li>Fixed css with toggling dark mode</li>
	</ul>
	<h2 id="1-2-2">1.2.2</h2>
	<ul>
	<li>Made auto loot look better</li>
	</ul>
	<h2 id="1-2-1">1.2.1</h2>
	<ul>
	<li>Added direction changer to city/house raider</li>
	<li>Improved auto reconnect detection</li>
	</ul>
	<h2 id="1-2-0">1.2.0</h2>
	<ul>
	<li>Added city/house raider</li>
	</ul>
	<h2 id="1-1-0">1.1.0</h2>
	<ul>
	<li>Added tree mower</li>
	<li>Added auto reconnect</li>
	</ul>
	<h2 id="1-0-1">1.0.1</h2>
	<ul>
	<li>Auto travel won&#39;t get stuck on events anymore</li>
	</ul>
	<h2 id="1-0-0">1.0.0</h2>
	<ul>
	<li>Added auto travel</li>
	<li>Added a help menu</li>
	</ul>
	<h2 id="0-2-1">0.2.1</h2>
	<ul>
	<li>Removed dome debug code</li>
	<li>Made auto mine more clear that you need a metal detector</li>
	</ul>
	<h2 id="0-2-0">0.2.0</h2>
	<ul>
	<li>Added auto mine</li>
	</ul>
	<h2 id="0-1-0">0.1.0</h2>
	<ul>
	<li>Added auto XP</li>
	<li>Added auto doublestep</li>
	</ul>
	
`
};
// fancy help menu
globalThis.help={
	/**
	 * Generates a popup in an easier way than what toro does
	 * @param {String} title the popup title
	 * @param {String} text the popup body text. this has newlines and tabs removed so use respective html values
	 * @param {String[]} buttonText an array of text to be used for buttons that corresponds to help.textToPopup
	 */
	genPopup(title, text, buttonText){
		text = text.replace(/\n/g, '').replace(/\t/g,'').trim();
		let btns = [];
		buttonText.forEach(item=>{
			btns.push({
				disp: item,
				func:()=>{help.switchEvent(item);},
				disable:false,
			})
		})
		POPUP.new(title, text, btns);
	},
	switchEvent(name){
		help.textToPopup[name]();
	},
	nav(){
		help.genPopup(
			'Help',
			'Welcome to the help menus. Please navigate through the categories to see additional information on each module.',
			['Tools', 'Bots', 'Resources', 'About', 'Contributors', 'Close']
		);
	},
	//#region tools
	tools(){
		help.genPopup(
			'Tools',
			'These are all of the currently included tools.',
			[
				'Auto Double Step',
				'Location Stopper',
				'Location Logger',
				'Free Cam',
				'Render Distance',
				'Structure Mower',
				'Streamer Mode',
				//'Anti Int',
				//'Spam',
				'Home'
			]
		)
	},
	autoDStep(){
		help.genPopup('Auto Double Step', 'This will automatically double step for you. This will get activated by certain bots.', ['Tools']);
	},
	locationStop(){
		help.genPopup('Location Stopper', 'This will stop auto walk and all travel bots when it finds an unknown tile. You can set it to ignore some tiles that you don\'t wish to stop at.', ['Tools']);
	},
	locationLog(){
		help.genPopup('Location Logger', 'This will log any unknown locations it sees and store them in local storage so they stick around after a browser refresh.', ['Tools']);
	},
	freeCam(){
		help.genPopup('Free Cam', 'This will let you leave your body and see client side world generation. Only places shown on mapexplorer will appear. Use wasd to move. F toggles freecam and space brings you back to your traveler. (sorry mobile)', ['Tools']);
	},
	renderDistance(){
		help.genPopup('Render Distance', 'This will allow you to have a smaller or larger render distance. Use the buttons to increase or decrease by 10, 5 or 1. You can keep this at 5 if you have a slow computer.', ['Tools']);
	},
	structureMower(){
		help.genPopup('Structure Mower', 'This will break any structures in the current direction you are traveling. This will not activate on or near oceans. If you equip an item to break structures faster it will use it.', ['Tools']);
	},
	streamerMode(){
		help.genPopup('Streamer Mode', 'This lets you hide certain visual aspects that are commonly used for location finding. I recommend disabling coords, biome notifications, trees and events for casual play.', ['Tools']);
	},
	antiInt(){
		help.genPopup('Anti Int', 'This sends leave interaction packets to keep you out of fights. Delay is the delay between packets in milliseconds. I recommend 20 for casual play and 0 for dangerous locations. Please note that it is possible for a bot to start a fight before you exit events so be wary of them.', ['Tools']);
	},
	spam(){
		help.genPopup('Spam', 'If you currently have a radio wave transmitter equipped this will spam a given frequency with a given message.', ['Tools']);
	},
	//#endregion
	//#region bots
	bots(){
		help.genPopup('Bots', 'These are all of the current bots included in this client.', [
			'Auto XP',
			'Auto Mine',
			'Travel',
			'Tree Mower',
			'Event Raider',
			'Event Tag',
			'Waypoint Travel',
			'Home'
		]);
	},
	autoXP(){
		help.genPopup('Auto XP', 'Auto XP will automatically walk left to right earning you one xp per cycle. Event tag is faster but this can be done in your base.', ['Bots']);
	},
	autoMine(){
		help.genPopup('Auto Mine', 'Auto Mine will automatically in a given direction as long as you have a metal detector equipped. When you enable auto ocean platforms it will automatically make copper coils and ocean platforms. When loop around is enabled it will do rows/columns based on your direction and then move one tile over clockwise and continue mining in the opposite direction.', ['Bots']);
	},
	travel(){
		help.genPopup('Travel', 'Travel will go to the entered coords. It is able to navigate around any ocean unless it touches the border or is heading straight into an ocean, then it has a 70% chance of making it. To access some settings right click it.', ['Bots']);
	},
	treeMower(){
		help.genPopup('Tree Mower', 'Tree mower will automatically farm trees. Dir is the direction to go if no trees are found. When the fence box is selected it will automatically make wood fences as long as you have the materials.', ['Bots']);
	},
	evRaid(){
		help.genPopup('Event Raider', 'Event raider will loot any events it sees. It will get most loot that isn\'t locked behind item requirements. You can configure it to choose what items to get and what direction to travel when no events are seen. Please turn on log loot and send the logs to someone working on the wiki so we can document the loot tables.', ['Bots']);
	},
	evTag(){
		help.genPopup('Event Tag', 'Event Tag will travel to given coords and xp tag any events it sees on its way to the destination. This is compatible with render distance.', ['Bots']);
	},
	wayPointTravel(){
		help.genPopup('Waypoint Travel', 'This will go to every entered waypoint in order. This can be used to go around oceans or scan areas.', ['Bots']);
	},
	//#endregion
	//#region resources
	resources(){
		help.genPopup(
			'Resources',
			'All the resources currently included.',
			[
				'Map Explorer',
				'Changelog',
				'Help',
				'Leaderboard',
				'World Download',
				'Home'
			]
		)
	},
	mapExplorer(){
		help.genPopup('Map Explorer', 'A map explorer made by <a target="_blank" href="https://pfg.pw">pfg</a>. This shows all client-side world gen.', ['Resources']);
	},
	changelog(){
		help.genPopup('Changelog', 'A change log for every version of this client.', ['Resources']);
	},
	help(){
		help.genPopup('Help', 'The menus you are in currently.', ['Resources']);
	},
	leaderboard(){
		help.genPopup('Leaderboard', 'A leader board history viewer made by <a target="_blank" href="https://pfg.pw">pfg</a>.', ['Resources']);
	},
	worldDownload(){
		help.genPopup('World Download', `A World download mod that uses location logger. 
		Run location logger through and area and then click on world download to download it. 
		After it is done converting right click and copy the image. 
		Buffer is the distance around the locations that is generated. 
		Text size is the size of the font drawn to the image. 
		There is a limit of how big a canvas can be. 
		If it appears to be weird try lowering text size. 
		Hide natural terrain is for if you want to hide natural terrain that could reveal where your download is.`, ['Resources']);
	},
	//#endregion
	//#region about
	about(){
		help.genPopup('About', 
		`
		This is a project I started to make back in july of 2020. The first version released on july second 2020. Feel free to give me suggestions in the travelers discord server.<br>
		-LightningWB.
		`,
		['Home'])
	},
	//#endregion
	//#region contributors
	contributors(){
		help.genPopup('Contributors', 
		`
		Huge thanks to everyone here for contributing code.
		`,['slippyIceHero', 'acedog3', 'Home'])
	},
	slippyIceHero(){
		help.genPopup('<a href="https://github.com/slippyice" target="_blank">SlippyIceHero</a>',
		`
		SlippyIceHero made the hover coords and the bresenham line algorithm implementation for travel.
		`,['Contributors'])
	},
	acedog3(){
		help.genPopup('<a href="https://github.com/Acedog3" target="_blank">Acedog3</a>',`
		Acedog3 added in the new materials to the mining bot when the travelers updated to 1.1.
		`,['Contributors'])
	}
	//#endregion
};
globalThis.help.textToPopup={// this has to be done after events are defined
	'Home':help.nav,
	'Tools':help.tools,// tools
	'Auto Double Step':help.autoDStep,
	'Location Stopper':help.locationStop,
	'Location Logger':help.locationLog,
	'Free Cam':help.freeCam,
	'Render Distance':help.renderDistance,
	'Structure Mower':help.structureMower,
	'Streamer Mode':help.streamerMode,
	'Anti Int':help.antiInt,
	'Spam':help.spam,
	'Bots':help.bots,// bots
	'Auto XP':help.autoXP,
	'Auto Mine':help.autoMine,
	'Travel':help.travel,
	'Tree Mower':help.treeMower,
	'Event Raider':help.evRaid,
	'Event Tag':help.evTag,
	'Waypoint Travel':help.wayPointTravel,
	'Resources':help.resources,// resources
	'Map Explorer':help.mapExplorer,
	'Changelog':help.changelog,
	'Help':help.help,
	'Leaderboard':help.leaderboard,
	'World Download':help.worldDownload,
	'About':help.about,// about
	'Contributors':help.contributors,
	'slippyIceHero':help.slippyIceHero,
	'acedog3':help.acedog3,
	'Close':()=>POPUP.hide()
};
// help popup
globalThis.popupHelp=function(){// I need the \ so there aren't indentations and it is much more readable
	help.nav();// the new help is so much better
    /*POPUP.new('Help', "\
    Auto Xp will walk back and forth.\
    Auto double step will automatically double step.\
    Auto mine with metal detector will mine if you have a metal detector equipped and a shovel.\
    Auto travel will automatically travel to the desired coords. Using a boat is quicker and more reliable.\
    If you don't have a boat equipped you may get stuck.\
    Tree mower will auto farm trees. The fences setting will automatically craft wood fences if you want.\
    I am aware that auto city and house raider will miss some loot.\
    Location stopper will stop at locations that aren't natural or rare.\
    Location logger will write down any location that aren't natural except holes unless you do locationLogger.markHoles=true; in the console.\
    Free Cam uses wasd to move around. Free Cam also only shows stuff that is seen on mapexplorer.\
    The coord input on freecam let you go directly to coords. Ex. 0,0.\
    Map explore uses <a href='https://pfg.pw' target='blank'>Pfg's</a> map explorer.\
    Event tag will go to any events on screen for xp while going to the coords.\
    Waypoint travel will go to the first waypoint then the second and so on. Recommended to navigate around oceans.\
    You can save waypoints to local storage and load them from there. Local storage is shared across the current browser and will stay if you reload.\
      ", undefined);*/
};
// mapexplorer popup
globalThis.popupMap=function(){
    POPUP.new('<a href="https://pfg.pw" target="_blank">MapExplorer by pfg</a>',
    '<iframe src="https://pfg.pw/mapexplorer/#,'+(YOU.x*30).toString()+','+(YOU.y*-30).toString()+','+YOU.x.toString()+','+(YOU.y*-1).toString()+','+'30" width=640 height=640  style="border:0px solid black;">',
    undefined);
    document.getElementById('event-desc').style.maxHeight='650px';
    POPUP.evBox.style.maxHeight="900px";
};
globalThis.popupLeaderboard=function(){
    POPUP.new('<a href="https://pfg.pw" target="_blank">Leaderboard history by pfg</a>',
    '<iframe src="https://pfg.pw/travelersleaderboard/player" width=640 height=640 style="border:0px solid black;">',
    undefined);
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
	fancyDir.stopAll();
	clearTimeout(EVENTS.leaveEventCountdown);
};
globalThis.sleep=function(ms){return new Promise(resolve => setTimeout(resolve, ms));}
// old change dir to work with buttons
globalThis.fancyDir=// avoid dom calls by this
{
	n:document.getElementById('arrow-n'),
	ne:document.getElementById('arrow-ne'),
	e:document.getElementById('arrow-e'),
	se:document.getElementById('arrow-se'),
	s:document.getElementById('arrow-s'),
	sw:document.getElementById('arrow-sw'),
	w:document.getElementById('arrow-w'),
	nw:document.getElementById('arrow-nw'),
	a:document.querySelector("#arrow-auto"),
	setDir(dir, auto)
	{
		this[dir].click();
		if(auto&&!YOU.autowalk)this['a'].click();
	},
	stopAll()
	{
		if(YOU.autowalk)this['a'].click();
		if(YOU.dir!='')this[YOU.dir].click();
	}
};
globalThis.setDir=function(dir, autoWalk=false){
    fancyDir.setDir(dir, autoWalk);
};
globalThis.resizeHotBar = function()
{
	if(MOBILE.is)
	{
		let utilHeightModifier = (Math.ceil(document.querySelector("#Utility\\ Hot\\ Bar").children.length/Math.floor(window.innerWidth/107)))*70;// this does figures out how many rows it takes
		document.querySelector('#Utility\\ Hot\\ Bar').style.height=utilHeightModifier+'px';
		let toolHeightModifier = (Math.ceil(document.querySelector("#Tool\\ Hot\\ Bar").children.length/Math.floor(window.innerWidth/107)))*70;
		document.querySelector('#Tool\\ Hot\\ Bar').style.height=toolHeightModifier+'px';
		let resourceHeightModifier = (Math.ceil(document.querySelector("#Resource\\ Hot\\ Bar").children.length/Math.floor(window.innerWidth/107)))*70;
		document.querySelector('#Resource\\ Hot\\ Bar').style.height=resourceHeightModifier+'px';
		document.querySelector('#Utility\\ Hot\\ Bar').style.width=Math.min(document.querySelector("#Utility\\ Hot\\ Bar").children.length, Math.floor(window.innerWidth/107))*106+'px';
		document.querySelector('#Tool\\ Hot\\ Bar').style.width=Math.min(document.querySelector("#Tool\\ Hot\\ Bar").children.length, Math.floor(window.innerWidth/107))*106+'px';
		document.querySelector('#Resource\\ Hot\\ Bar').style.width=Math.min(document.querySelector("#Resource\\ Hot\\ Bar").children.length, Math.floor(window.innerWidth/107))*106+'px';
	}
	else
	{
		document.querySelector('#Utility\\ Hot\\ Bar').style.height='140px';
		document.querySelector('#Tool\\ Hot\\ Bar').style.height='140px';
		document.querySelector('#Resource\\ Hot\\ Bar').style.height='70px';
		document.querySelector('#Utility\\ Hot\\ Bar').style.width='636px';
		document.querySelector('#Tool\\ Hot\\ Bar').style.width='636px';
		document.querySelector('#Resource\\ Hot\\ Bar').style.width='530px';
	}
	document.getElementById('mobile-boxselect').style.top=document.querySelector("#game-content > div.mid-screencontainer.scrollbar").getBoundingClientRect().height+'px';
	sideScreens=document.getElementsByClassName('side-screencontainer');// mobile stuff
    for(i=0;i<2;i++){
        sideScreens[i].style.top=document.querySelector("#game-content > div.mid-screencontainer.scrollbar").getBoundingClientRect().height+176+'px';
	}
};
globalThis.resetDarkMode = function()
{
	const cssElem = document.getElementById('travelersOnlineToolsCSS');
	color.getColor();
	cssElem.innerHTML=
	`
	.tool{
        margin:2px 2px;
        border-width:1px;
        border-style:solid;
        width:100px;
        height:60px;
        cursor:pointer;
		float: left;
		text-align:center;
		-moz-user-select: -moz-none;
		-webkit-user-select: none;
		-ms-user-select: none;
		user-select: none;
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
	.configureBtn{
		color:`+color.clickedTextColor+`;
		border:1px solid `+color.textColor+`;
		background-color:`+color.background+`;
	}
	.configureBtn:active{
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
	`
};
function globalInjections()
{
	ENGINE.applyData=eval('('+ENGINE.applyData.toString().replace('ENGINE.callCycleTriggers();', 'ENGINE.midCycleDataCall=midCycleDataCall||false;ENGINE.callCycleTriggers();')+')');
	window.onresize=eval('('+window.onresize.toString().replace('MOBILE.is;', `MOBILE.is;
	resizeHotBar();
	clearTimeout(globalThis.renderDistanceTimeout);
	globalThis.renderDistanceTimeout=setTimeout(()=>{renderDistance.reload(0, false);}, 100);
	`)+')');
	SETTINGS.toggleDarkMode=eval('('+SETTINGS.toggleDarkMode.toString().replace(RegExp('}$'), 'resetDarkMode();\n}')+')');
	WORLD.build=eval('('+WORLD.build.toString().replace('YOU.x + j','YOU.x + freeCam.x + j').replace('YOU.y - i','YOU.y + freeCam.y - i')+')');// keep moving while freecam
    YOU.getCoordString=eval('('+YOU.getCoordString.toString().replace(' YOU.x ','(YOU.x+freeCam.x)').replace(' YOU.y;','(YOU.y+freeCam.y);')+')');// display coords
	/**
	 * 
	 * @param {KeyboardEvent} ev 
	 */
	window.onkeypress=function(ev)
	{
		if(ev.target.tagName==='INPUT' || ev.target.tagName==='TEXTAREA' || ev.shiftKey)return;
		if(ev.key==='f')
		{
			ev.preventDefault();
			freeCam.toggle();
		}
		if(ev.key===' ')
		{
			ev.preventDefault();
			freeCam.x=0;
			freeCam.y=0;
			WORLD.build();
			WORLD.checkPlayersAndObjs();
		}
	}
};
function init(){
    color.getColor();
    var insertedHTML=document.createElement("div");
    insertedHTML.innerHTML=
    //this is the html added to the bottom of the webpage
    `
    <div class='complexHr'>
        <span class="header">Tools</span>
    </div>
    <div id="Utility Hot Bar" style="margin:auto;width:auto;height:`+(MOBILE.is?'210px':'140px')+`;">
        <div class="tool toolUnClicked" onclick=" doubleStep.toggle()" id="doubleStep">Auto Double Step</div>
        <div class="tool toolUnClicked" id="eventFind">
            <span onclick=eventStop.toggle() >Location Stopper</span>
            <span onclick="eventStop.popup();" class="configureBtn">Configure</span>
        </div>
		`+
		//'<div class="tool toolUnClicked" onclick=" autoScan.toggle()" id="autoScan">Auto Scanner</div>'+// comment out this whole line to hide this
        `
        <div class="tool toolUnClicked" id="locationLogger">
            <span onclick=" locationLogger.toggle()">Location Logger</span>
            <span class="configureBtn" onclick="locationLogger.show()">Show Logs</span>
        </div>
		<div class="tool toolUnClicked" id="freeCam">
			<span onclick=freeCam.toggle() >Free Cam</span>
			<input type="number" placeholder=1 id="freeCamSpeed" onchange="freeCam.speed=Number(this.value)">
			<input style="width:35px;" type="number" placeholder="X" id="freeCamX">
			<input style="width:35px;" type="number" placeholder="Y" id="freeCamY">
		</div>
        <div class="tool toolUnClicked" onclick=" renderDistance.open()" id="renderDistance">Render Distance</div>
        <div class="tool toolUnClicked" onclick=" autoBreaker.toggle()" id="autoBreaker">Structure Mower</div>
		<div class="tool toolUnClicked" onclick=streamerMode.open() id="streamer">Streamer Mode</div>
		`+/*<div class="tool toolUnClicked" id="antiInt">
		<span  onclick=antiInt.toggle() >Anti Int</span>
		<label for="antiIntSpeed">Delay:</label>
		<input style="width:35px;" type="number" placeholder="20" id="antiIntSpeed" onchange="antiInt.delay=this.value" value=20>
		</div>*/`
	</div>`+
    `
    <div class='complexHr'>
            <span class="header">Bots</span>
    </div>
    <style id="travelersOnlineToolsCSS"></style>
    <div id="Tool Hot Bar" style="margin:auto;width:auto;height:`+(MOBILE.is?'210px':'140px')+`;">
        <div class="tool toolUnClicked" onclick=controller.toggle("xp") id="xp">Auto Xp</div>
        <div class="tool toolUnClicked" id="dig">
            <span onclick=controller.toggle("dig")>Auto Mine</span>
            <span onclick="mineBot.popup();" class="configureBtn">Configure</span>
        </div>
        <div class="tool toolUnClicked" id="travel">
            <div onclick=controller.toggle("travel") oncontextmenu=travelBot.popup() contextmenu="">Travel</div>
            <input type="number" id="x" placeholder="X" onchange="travelBot.changeDestinationX(this.value);travelBot.bresBOT.reset();" style="width:88px">
            <input type="number" id="y" placeholder="Y" onchange="travelBot.changeDestinationY(this.value);travelBot.bresBOT.reset();" style="width:88px">
        </div>
        <div class="tool toolUnClicked" id="treeBot">
            <span onclick=controller.toggle('treeBot')>
                Tree Mower
            </span>
            <label for="treeDefaultDir">Dir:</label>
            <select name="treeDefaultDir" id="treeDefaultDir" style="background:inherit;max-width:50px;" onchange="treeBot.defaultDir=this.value">\
                <option value="n">North</option>
                <option value="ne">North-East</option>
                <option value="e">East</option>
                <option value="se">South-East</option>
                <option value="s">South</option>
                <option value="sw">South-West</option>
                <option value="w">West</option>
                <option value="nw">North-West</option>
            </select>\
            <label for="treeAutoFence">Fences:</label>
            <input id="treeAutoFence" type="checkbox" onchange="treeBot.updateFence(this.checked)">
        </div>
        <div class="tool toolUnClicked" id="autoLoot">
            <span onclick=controller.toggle('autoLoot') >Event Raider</span>
            <span onclick="autoLoot.popup();" class="configureBtn">Configure</span>
        </div>
        <div class="tool toolUnClicked" id="bigXP">
            <div onclick=controller.toggle("bigXP")>Event Tag</div>
            <input type="number" id="bigXPX" placeholder="X" onchange="bigXPBot.changeDestinationX(this.value)" style="width:88px">
            <input type="number" id="bigXPY" placeholder="Y" onchange="bigXPBot.changeDestinationY(this.value)" style="width:88px">
        </div>
        <div class="tool toolUnClicked" id="wayPointTravel">
            <span onclick=controller.toggle("wayPointTravel")>Waypoint Travel</span>
            <span onclick="wayPointTravel.popup();" class="configureBtn">Configure</span>
        </div>
    </div><br>
    <div class='complexHr'>
            <span class="header">Resources</span>
    </div>
    <div id="Resource Hot Bar" style="margin:auto;width:auto;height:`+(MOBILE.is?'140px':'70px')+`;">
        <div class="tool toolUnClicked" onclick=popupMap() >Map Explorer</div>
        <div class="tool toolUnClicked" onclick=changelog.showChangelog() id="help">Changelog</div>
        `+//`<div class="tool toolUnClicked" onclick=chat.initial() id="chatButton">Chat</div>`+
        `<div class="tool toolUnClicked" onclick=popupHelp() id="help">Help</div>
        <div class="tool toolUnClicked" onclick=popupLeaderboard() id="help">Leader board</div>
        <div class="tool toolUnClicked" id="worldDownload">
            <span onclick=worldDownload.popup() >World Download</span>
            <span onclick="worldDownload.configure();" class="configureBtn">Configure</span>
		</div>
    </div>
    `
        /*<div class="tool toolUnClicked" onclick=autoReconnect.toggle() id="reconnect">Auto Reconnect</div>*/ // auto reconnect was removed in 1.0.4 R.I.P.
    ;
    insertedHTML.innerHTML=insertedHTML.innerHTML.replace(/\n/g,'');// switching all of these to regex brought better mobile compatibility because ios doesn't get replaceAll until 13.4 or something
    var target=document.getElementById('game-content').getElementsByClassName('mid-screencontainer scrollbar')[0];
    streamerMode.initialize();
    target.appendChild(insertedHTML);
    EQUIP.menuEl.style.width="420px";
    BUILD.boxEl.style.width="420px";
    POPUP.evBox.style.maxHeight="900px";// debatable but I like it so too bad
    document.getElementById('event-desc').style.maxHeight='650px';
    cycleAligner.initialize();
    globalThis.LightningClientInitialized=true;
    /*sideScreens=document.getElementsByClassName('side-screencontainer');// mobile stuff
    for(i=0;i<2;i++){
        sideScreens[i].style.top=document.querySelector("#game-content > div.mid-screencontainer.scrollbar").getBoundingClientRect().height+'px';
	}*/
	globalInjections();
	resetDarkMode();
	resizeHotBar();
};
init();
