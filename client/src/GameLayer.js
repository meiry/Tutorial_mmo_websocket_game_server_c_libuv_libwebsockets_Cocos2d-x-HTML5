var spriteFrameCache = cc.spriteFrameCache;
var spriteFrameCacheGems = cc.spriteFrameCache;
var TAG_PLAYER_NODE = 2;
var TAG_GEM_NODE = 1;
var TAG_BOMBOMB_NODE = 1;
var ZORDER_PLAYER_NODE = 4;
var ZORDER_GEM_NODE = 1;
var player = null;
var players ={};
var gems = [] ;
var endPlayerPos = null;
var distance  = null;
var directionX = null;
var directionY = null;
var startY = null;
var startX = null;
var speed = 300; 
var distance = null;
var m_websocketMng = null;
var counter_from_server_tmp =0;
var gemBomb = null;
var scoreLabel = null;

var GameLayer = cc.LayerColor.extend({
    sprite:null,
	winsize:null,
	player_seq:0,
	otherPlayersMoved:false,
	 
    ctor:function (_websocketMng) {
	   m_websocketMng = _websocketMng;
	   this._super(cc.color(0, 128, 255, 255));
       this.winsize = cc.director.getVisibleSize(); //cc.winSize;
        
       var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                 
                var touchLocation = touch.getLocation();
				 
				if(player!=null)
				{
					//float can't maintain its value "as is" , so it will be saved as string 
					//http://stackoverflow.com/questions/588004/is-floating-point-math-broken
					endPlayerPos = touchLocation;
					player.setEndPosX(endPlayerPos.x);
					player.setEndPosY(endPlayerPos.y);
					distance  = Math.sqrt(Math.pow((endPlayerPos.x - player.x),2) + Math.pow((endPlayerPos.y - player.y),2) );
					directionX = (endPlayerPos.x - player.x) / distance;
					directionY = (endPlayerPos.y - player.y) / distance;
					if(isNaN(directionX) || isNaN(directionY) )
					{
						directionY = directionX = 0;
					}
					startY = player.y;
					startX = player.x;
					player.startAnim();
					player.setMoving(true);						 

				}                    
                return true;
                
            },
            onTouchMoved: function (touch, event) {
                //this.setPosition(this.getPosition() + touch.getDelta());
            },
            onTouchEnded: function (touch, event) {
                
                
            }
       });
       cc.eventManager.addListener(listener, this);
       this.schedule(this.gameLoop); 
	  
    },
        
    
	onEnter:function () {
		this._super();
		
		var visibleOrigin = cc.director.getVisibleOrigin(); 
		scoreLabel = new cc.LabelTTF("0", "Arial",80);
		var scoreLabelcontentSize = scoreLabel.getContentSize();
        this.addChild(scoreLabel,20);
        scoreLabel.setPosition(cc.p(visibleOrigin.x + scoreLabelcontentSize.width, visibleOrigin.y + winsize.height - scoreLabelcontentSize.height)); 


		var msgProtocolContainer = m_websocketMng.getMsgProtocol();
		spriteFrameCache.addSpriteFrames(res.char_anim_plist,res.char_anim_png);
		player = Player.initSpriteFrame(spriteFrameCache.getSpriteFrame(this.getImageByState(states.PLAYER_B)),
																		states.PLAYER_B,
																		msgProtocolContainer.msgProtocol.player_name,
																		msgProtocolContainer.msgProtocol.player_id); 
		player.setXY(this.winsize.width / 2,this.winsize.height / 2);			 
		this.addChild(player,ZORDER_PLAYER_NODE,TAG_PLAYER_NODE);
		//check if players exists
		if(msgProtocolContainer.msgProtocol.hasOwnProperty("players"))
		{
			for (var i = 0; i < msgProtocolContainer.msgProtocol.players.length; i++) { 
   				 this.AddOtherPlayerOnRegister(msgProtocolContainer.msgProtocol.players[i]);
			}
		}
		//handle gems if they exists
		if(msgProtocolContainer.hasOwnProperty("msgProtocolGems"))
		{
			this.scatterGems(msgProtocolContainer.msgProtocolGems);
		}
		//set this object to websocketMng so it can delegate back to here function calls
		m_websocketMng.setObjByStatus(this,null,100);

	},
	scatterGems:function(_msgProtocolGems)
	{
		if(_msgProtocolGems.hasOwnProperty("simple_gems"))
		{
			for (var i = 0; i < _msgProtocolGems.simple_gems.length; i++) { 
   				 this.AddBasicGemsToGame(_msgProtocolGems.simple_gems[i],
   				 						 _msgProtocolGems.simple_gems[++i]);
   				 
			}
		}
		if(_msgProtocolGems.hasOwnProperty("bomb_gems"))
		{
			for (var i = 0; i < _msgProtocolGems.bomb_gems.length; i++) { 
   				 this.AddBombGemsToGame(_msgProtocolGems.bomb_gems[i],
   				 						_msgProtocolGems.bomb_gems[++i]);
   				 
			}
		}
	},
	AddBasicGemsToGame:function(_basicGem_x,_basicGem_y)
	{
		var gem1Basic = Gem.initSprite(null,states_gems.SIMPLE);
		this.addChild(gem1Basic,ZORDER_GEM_NODE,TAG_GEM_NODE);
		gem1Basic.x = _basicGem_x;
		gem1Basic.y = _basicGem_y;		 
		gems.push(gem1Basic);
		//cc.log("gem1:"+gem1.x+"  "+gem1.y); 
	},
	AddBombGemsToGame:function(_bombGem_x,_bombGem_y)
	{

		spriteFrameCacheGems.addSpriteFrames(res.gem_b_anim_plist,res.gem_b_anim_png);
		gemBomb = Gem.initSprite(spriteFrameCacheGems.getSpriteFrame(this.getImageByState(states.BOMB)),states_gems.BOMB); 
		this.addChild(gemBomb,ZORDER_PLAYER_NODE,TAG_BOMBOMB_NODE);
		gemBomb.x = _bombGem_x;
		gemBomb.y = _bombGem_y;
		gems.push(gemBomb);
		//cc.log("gemBomb:"+gemBomb.x+"  "+gemBomb.y);
	},
	AddOtherPlayerOnRegister:function(_ResponseFromServer) {
		var otherPlayer = Player.initSpriteFrame(spriteFrameCache.getSpriteFrame(this.getImageByState(states.PLAYER_B)),
																		states.PLAYER_B,
																		_ResponseFromServer.player_name,
																		_ResponseFromServer.player_id); 
		var x_ = parseFloat(_ResponseFromServer.end_player_pos_x);
		var y_ = parseFloat(_ResponseFromServer.end_player_pos_y);
		//otherPlayer.setXY(this.winsize.width / 2,this.winsize.height / 2);	
		otherPlayer.setXY(x_,y_);	
		var otherplayer_id = otherPlayer.getId();
		players[otherplayer_id.toString()] = otherPlayer;
		//cc.log(Object.keys(players).length);		 
		this.addChild(otherPlayer,1,TAG_PLAYER_NODE);
		  
	},
	deletePlayer:function(_ResponseFromServer)
	{
		var p = players[_ResponseFromServer.player_id.toString()];
		this.removeChild(p);
		delete players[_ResponseFromServer.player_id.toString()];
	},
	updateOtherPlayerOnMovment:function(_ResponseFromServer)
	{	
	/*	
		var p = players[_ResponseFromServer.player_id.toString()];
		p.pushToResponsesList(_ResponseFromServer);	
		if(p.player_x_r.length == 0 && p.getAnimStatus() == false)
		{
			p.startAnim();
		}
		p.player_x_r = p.player_x_r.concat(_ResponseFromServer.player_x_r);
		p.player_y_r = p.player_y_r.concat(_ResponseFromServer.player_y_r);

		p.simple_gems = _ResponseFromServer.simple_gems;
		p.bomb_gems = _ResponseFromServer.bomb_gems;
		p.status = _ResponseFromServer.status;
		p.player_id = _ResponseFromServer.player_id;
		p.utc_timestemp = _ResponseFromServer.utc_timestemp;
		p.score = _ResponseFromServer.score;
		p.collision_status  = _ResponseFromServer.collision_status;
	*/	 
		var p = players[_ResponseFromServer.player_id.toString()];
		players[_ResponseFromServer.player_id.toString()].pushToResponsesList(_ResponseFromServer);	
		if(players[_ResponseFromServer.player_id.toString()].player_x_r.length == 0 && players[_ResponseFromServer.player_id.toString()].getAnimStatus() == false)
		{
			players[_ResponseFromServer.player_id.toString()].startAnim();
		}
		players[_ResponseFromServer.player_id.toString()].player_x_r = players[_ResponseFromServer.player_id.toString()].player_x_r.concat(_ResponseFromServer.player_x_r);
		players[_ResponseFromServer.player_id.toString()].player_y_r = players[_ResponseFromServer.player_id.toString()].player_y_r.concat(_ResponseFromServer.player_y_r);
		if(parseInt(_ResponseFromServer.collision_status) == 9)
		{
			players[_ResponseFromServer.player_id.toString()].simple_gems = _ResponseFromServer.simple_gems;
			players[_ResponseFromServer.player_id.toString()].bomb_gems = _ResponseFromServer.bomb_gems;
			players[_ResponseFromServer.player_id.toString()].status = _ResponseFromServer.status;
			players[_ResponseFromServer.player_id.toString()].player_id = _ResponseFromServer.player_id;
			players[_ResponseFromServer.player_id.toString()].utc_timestemp = _ResponseFromServer.utc_timestemp;
			players[_ResponseFromServer.player_id.toString()].score = _ResponseFromServer.score;
			players[_ResponseFromServer.player_id.toString()].collision_status  = _ResponseFromServer.collision_status;
			console.log("players["+_ResponseFromServer.player_id.toString()+"].collision_status:"+players[_ResponseFromServer.player_id.toString()].collision_status);
		}
		counter_from_server_tmp++;
	},
	updateScoreAndGems:function(_player)
	{
		var simple_gems = _player.simple_gems;
		var bomb_gems = _player.bomb_gems;
		 
		
		for(var i =0 ; simple_gems.length;i++)
		{
			this.searchAndRemoveSimpleGems(simple_gems[i],simple_gems[++i]);
		}
		
	},
	searchAndRemoveSimpleGems:function(_simple_gems_x,_simple_gems_y)
	{
		for(var i=0;i<gems.length;i++)
		{
			 
			var xx = gems[i].x;
            var yy = gems[i].y;
            
       		 if(_simple_gems_x == xx && _simple_gems_y == yy)
       		 {
       		 	//remove from game layer 
	       		this.removeChild(gems[i]);
	       		//remove from gems array repo
				gems.splice(i, 1);
				break;
       		 }
 			 
		}

	},
	gameLoop:function (delta) {
		//http://gamedev.stackexchange.com/questions/23447/moving-from-ax-y-to-bx1-y1-with-constant-speed
		//handle other players movment 
		if(Object.keys(players).length>0 )
		{
			for(var i=0;i<Object.keys(players).length;i++)
			{	
				
				var playerKey = Object.keys(players)[i].toString();
				if(players[playerKey].getResponsesList()==null)
				{
					continue;
				}
				//cc.log("playerKey:"+players[playerKey].player_name+" "+players[playerKey].serverResponsesList.length+" "+players[playerKey].player_id);					
				if(players[playerKey].getResponsesList().length == 0)
				{
					continue;
				}
				//get the first response from server 
				var stopAnim = 0;
				var playersResponsesListLen  = players[playerKey].getResponsesList().length;
				 
				if(players[playerKey].player_x_r.length > 0)
				{
					var x_ = parseFloat(players[playerKey].player_x_r.shift());
					var y_ = parseFloat(players[playerKey].player_y_r.shift());
					//console.log("FROM GAMELOOP:"+players[playerKey].player_name+" x:"+x_);
					//console.log("FROM GAMELOOP:"+players[playerKey].player_name+" y:"+y_);
					console.log("players[playerKey].player_name:"+players[playerKey].player_name+"  players["+playerKey+"].collision_status:"+players[playerKey].collision_status);
					players[playerKey].move(x_,y_);
					if(players[playerKey].collision_status == 9)
					{
						//this.updateScoreAndGems(players[playerKey]);
						 cc.log("players[playerKey].collision_status");
						//players[playerKey].collision_status = 0;
					}
				}
				
			}
		}

		if(player.getMoving() == true)
		{
			var x = directionX * speed * delta;
			var y = directionY * speed * delta;
			//console.log("PLAYER:"+player.player_name+" x:"+x);
			//console.log("PLAYER:"+player.player_name+" y:"+y);
			player.move(x,y);
			var playerRect2 = player.getTheBoundingBox2(); 
			//cc.log("Player x:"+playerRect2.x+" y:"+playerRect2.y);
			//client adds a sequence number to each request
			//client send move state 
			var msgProtocolObj = new MsgProtocol();
			//IMportent as deleta time is part of the calculation of each client , we need to send  direction * speed
			//player_x and player_y will be used only for player prediction validation                         
			msgProtocolObj.player_x = x.toString();
			msgProtocolObj.player_y = y.toString();
			msgProtocolObj.player_seq = this.player_seq.toString();
			msgProtocolObj.status = 2;
			msgProtocolObj.collision_status =0;
			msgProtocolObj.player_id = player.getId();
			//keep track of the end move or the player 
			msgProtocolObj.end_player_pos_x=endPlayerPos.x.toString();
			msgProtocolObj.end_player_pos_y=endPlayerPos.y.toString();
			msgProtocolObj.stop_player
			//keep track of the player movement for client side prediction and Synchronization 
			//player.movmet_sequence_history.push(MsgProtocol);
			//As hashmap
			player.movmet_sequence_history[msgProtocolObj.player_seq] = msgProtocolObj;
			//send the  predicted movment to the server
			//m_websocketMng.sendMassage(msgProtocolObj,this);
			//this.player_seq++;

			//var isCollision = player.BorderCollisionDetection(this.winsize);	
			//Clollison 
			 
            
            var playerRect2 = player.getTheBoundingBox2();  
             
            var gemsToDelMap = [] ;
            var xx ,yy = 0; 
			for(var i=0;i<gems.length;i++)
			{
				var gemRect = gems[i].getBoundingBox();      
				if ( cc.rectIntersectsRect(gemRect,playerRect2 ) )
				//if(cc.rectContainsPoint(playerRect2, cc.p(gemRect.x,gemRect.y)))
                {
                	   cc.log("cc.intersectsRect(gemRect,playerRect2 )");
 	                   if(gems[i].state == states_gems.SIMPLE)
 	                   {
 	                   		//inc the player score when it hit the gem
 	                   		if(xx != gems[i].x && yy != gems[i].y)
 	                   		{
	 	                   		xx = gems[i].x;
	 	                   		yy = gems[i].y;
	 	                   		//cc.log("inside rectIntersectsRect:xx:"+xx+"  yy:"+yy);
	 	                   		//cc.log("inside rectIntersectsRect"+gems[i].getPosition().x+"  "+gems[i].getPosition().y);
	 	                   		player.score++;
	 	                   		gemsToDelMap[i.toString()] = gems[i];
	 	                   		scoreLabel.setString(player.score); 
	 	                   		//remove from game layer 
	 	                   		this.removeChild(gems[i]);
	 	                   		//remove from gems array repo
								gems.splice(i, 1);
								//inc the for loop 
								i++;

 	                   		}
 	                   }
                }   
			}
			if(Object.keys(gemsToDelMap).length>0)
			{
				this.handleGemCollided(gemsToDelMap,msgProtocolObj);
			}
			//handle game window border 
			if((Math.sqrt(Math.pow(player.x-startX,2)+Math.pow(player.y-startY,2)) >= distance) )
			{
				player.setMoving(false);	
				player.stopAnim();
				msgProtocolObj.stop_player = 1;
				//m_websocketMng.sendMassage(msgProtocolObj,this);
			} 
			m_websocketMng.sendMassage(msgProtocolObj,this);
			//console.log("PLAYER:"+msgProtocolObj+" y:"+y);
			this.player_seq++;

		}
    }, //End Game Loop
    //Handle the player and the gems collided and send to the server 
    handleGemCollided:function(_gemsToDelMap,_msgProtocolObj)
    {
    	if(Object.keys(_gemsToDelMap).length>0 )
		{

			//var msgProtocolObj = new MsgProtocol();
			//IMportent as deleta time is part of the calculation of each client , we need to send  direction * speed
			//player_x and player_y will be used only for player prediction validation  	
			_msgProtocolObj.player_name =player.player_name ;
			_msgProtocolObj.player_id= player.player_id;
			_msgProtocolObj.utc_timestemp= getUTCTimestamp();
			_msgProtocolObj.simple_gems = [];
			_msgProtocolObj.bomb_gems = [];
			_msgProtocolObj.score = player.score;	 
			_msgProtocolObj.collision_status =8;
			//Extract the gems to send to the server , the keys are the positions the server set to the gems 
			for(var i=0;i<Object.keys(_gemsToDelMap).length;i++)
			{	
				var gemsToDelKey = Object.keys(_gemsToDelMap)[i].toString();
				var gemX = _gemsToDelMap[gemsToDelKey].x;
				var gemY = _gemsToDelMap[gemsToDelKey].y;
				if(_gemsToDelMap[gemsToDelKey].type == states_gems.SIMPLE)
				{
					_msgProtocolObj.simple_gems.push(gemX);	
					_msgProtocolObj.simple_gems.push(gemY);	
				}
				if(_gemsToDelMap[gemsToDelKey].type == states_gems.BOMB)
				{
					_msgProtocolObj.bomb_gems.push(gemX);
					_msgProtocolObj.bomb_gems.push(gemY);
				}
			}
			 
			//var buf = Encode(msgProtocolObj);
	        //cc.log("FROM CLIENT SCORE:"+buf);
			//m_websocketMng.sendMassage(msgProtocolObj,this);
		}
    },
    syncPlayerActions:function(_ResponseFromServer)
    {
    	var fraud = true;
    	var i =0;
    	//handel the client prediction and the server response .
    	//1. check the last seq element first if it is in the client history 	

    	var srv_player_seq_len = _ResponseFromServer.player_seq.length;
    	var srv_player_seq_elm = _ResponseFromServer.player_seq[srv_player_seq_len-1];
    	//create new copy of player so it not be affected from the main player instace which get updated in the game loop 
	    var PlayerCopy = player;
	    //cc.log("Create new PlayerCopy");
    	//check if there is seq tag in the client history hash
    	if(srv_player_seq_elm in PlayerCopy.movmet_sequence_history)
    	{
    		//get the msg_protocol from client by the seq name from server 
    		var cln_msg_protocol = PlayerCopy.movmet_sequence_history[srv_player_seq_elm];
    		//check if there is match 
    		var srv_player_player_x_r_elm = _ResponseFromServer.player_x_r[srv_player_seq_len-1];
    		var srv_player_player_y_r_elm = _ResponseFromServer.player_y_r[srv_player_seq_len-1];
    		if(cln_msg_protocol.player_x == srv_player_player_x_r_elm && 
    					cln_msg_protocol.player_y == srv_player_player_y_r_elm)
    		{
    			//If it got to this point this mean that the history from this point and back needs to be cleaned 
    			fraud = false;
    			PlayerCopy = null;
    			//cc.log("Delete PlayerCopy");    		
    		}
    	}
    },
	getImageByState:function(stateimg) {
		//cc.log("stateimg:"+stateimg);
		switch(stateimg)
		{			
			case states.PLAYER_B:
			{					 
				return "l0_sprite_b_1.png";
			}
			case states.PLAYER_Y:
			{					 
				return "l0_sprite_y_1.png";
			}
			case states.PLAYER_R:
			{					 
				return "l0_sprite_r_1.png";
			}
			case states.BOMB:
			{					 
				return "sprite_gem_b0.png";
			}
		}
	}
});


