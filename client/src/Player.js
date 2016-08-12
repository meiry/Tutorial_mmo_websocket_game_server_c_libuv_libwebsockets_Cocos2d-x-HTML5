//var animation = null;
//var isMoving = false;
//var ANIMATION_ACTION_TAG = 111;
//var ANIMATION_REPEAT_FOREVER_TAG = 112;

var Player = cc.Sprite.extend({
	state:null,
	player_name:null,
	frameName:null,
	playerBase:null,
	player_id:null,
	movmet_sequence_history:null,
	player_x:0,
	player_y:0,
	endpos_x:0,
	endpos_y:0,
	stop_player:0,	
	player_x_r:null,
	player_y_r:null,
	ANIMATION_ACTION_TAG:111,
	ANIMATION_REPEAT_FOREVER_TAG:112,
	score:0,
	isDead:false,
	collision_status:0,
	simple_gems:[],
	bomb_gems:[],

	ctor: function(state,frameName,player_name,pid){
		this._super();
		this.player_name = player_name;
		this.state = state;
		this.frameName = frameName;
		this.player_id = pid;
		this.movmet_sequence_history = new Array(); 
		this.player_x_r = new Array(); 
		this.player_y_r = new Array(); 
		      
    },
    onEnter:function () {
		this._super();		
		this.opacity = 60; 
		this.playerBase = new PlayerBase(this.state,this.player_name,this.frameName,this.player_id);
	    this.playerBase.initWithSpriteFrame(this.frameName); 
		this.playerBase.getTexture().setTexParameters(gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		this.playerBase.setScale(6);	 
        this.addChild(this.playerBase);

        var nameLabel = new cc.LabelTTF(this.player_name, "Arial",20);
        nameLabel.x = this.playerBase.getBoundingBox().width / 2;
        nameLabel.y = this.playerBase.getBoundingBox().height;
        nameLabel.setAnchorPoint(0.5, 0.5);
        var playerBaseBoundingBoxWidth = this.playerBase.getBoundingBox().width
        var playerBaseBoundingBoxheight = this.playerBase.getBoundingBox().height
        this.addChild(nameLabel,1);
        this.initWithTexture(cc.textureCache.addImage(res.blank_png));
        this.setTextureRect(cc.rect(0,0,playerBaseBoundingBoxWidth,
        								playerBaseBoundingBoxheight));
        this.setAnchorPoint(0.5, 0.5);
        this.setColor(cc.color(0, 100,220,20));	
        this.playerBase.setXY(this.getBoundingBox().width/2,
        					  this.getBoundingBox().height/2);

      
	},
	getTheBoundingBox:function()
	{
		//simulate as the player sprite is on the main game layer 
		var pos = this.playerBase.convertToWorldSpace(cc.p(this.playerBase.x,this.playerBase.y)); 
		var rect = cc.rect(pos.x,pos.y,this.playerBase.getBoundingBox().width,this.playerBase.getBoundingBox().height); 
		return rect;
	},	
	getTheBoundingBox2:function()
	{
		//simulate as the player sprite is on the main game layer 
		var pos = this.convertToWorldSpace(cc.p(this.playerBase.x,this.playerBase.y)); 
		var rect = cc.rect(pos.x,pos.y,this.playerBase.getBoundingBox().width,this.playerBase.getBoundingBox().height); 
		return rect;
	},	
	getTheBoundingBox3:function()
	{
		//simulate as the player sprite is on the main game layer 
		var pos = cc.director.convertToGL(cc.p(this.playerBase.x,this.playerBase.y)); 
		var rect = cc.rect(pos.x,pos.y,this.playerBase.getBoundingBox().width,this.playerBase.getBoundingBox().height); 
		return rect;
	},	
	
	pushToResponsesList:function(_rlist)
	{
		this.playerBase.serverResponsesList.push(_rlist);
	},
	shiftToResponsesList:function()
	{
		return this.playerBase.serverResponsesList.shift();
	},
	getResponsesList:function()
	{
		return this.playerBase.serverResponsesList;
	},
	setEndPosX:function(endpos_x)
	{
		this.endpos_x = endpos_x;
	},
	setEndPosY:function(endpos_y)
	{
		this.endpos_y = endpos_y;
	},
	setId:function(_id)
	{
		this.playerBase.setId(_id);
	},
	getId:function()
	{
		//return this.playerBase.getId();
		return this.player_id;
	},
	move:function (x,y) 
	{
	    this.x	+= x;
	    this.y	+= y;
    },
    moveEx:function (x,y) 
	{
	    this.x	= x;
	    this.y	= y;
    },
    setPlayerXY:function (x,y) 
	{
	    this.player_x = x;
	    this.player_y = y;
    },
	setXY:function (x,y) 
	{
	    this.x	= x;
	    this.y	= y;
    },
    setMoving:function(bMove)
	{
		this.playerBase.setMoving(bMove);
	},
	getMoving:function()
	{
		return this.playerBase.getMoving();	
	},
	getLocationPoint: function () {
        return {x: this.x, y: this.y};
    },
    setAnimByState:function(state)
	{
		this.playerBase.setAnimByState(state);
	},
	getAnimStatus:function() 
	{
		 return this.playerBase.animationStarted;
		 
	},
	startAnim:function () 
	{
		 this.playerBase.startAnim();
		 
	},
	stopAnim:function () 
	{
		 this.playerBase.stopAnim(); 
		 
	}/*,
	BorderCollisionDetection:function(winsize) {
		return this.playerBase.BorderCollisionDetection(winsize);
	}*/,
	BorderCollisionDetection:function(winsize) {
		var offset = 40;
		var spriteWidth   = this.playerBase.getBoundingBox().width-offset;
		var spriteHeight  = this.playerBase.getBoundingBox().height-offset;
		if(this.x < 0 + (spriteWidth/2)) 
		{
			console.log("this.x < 0 + (spriteWidth/2):"+this.x+" <"+(0+(spriteWidth/2)));
			this.x = 0 + (spriteWidth/2);
			this.setMoving(false);
			this.stopAnim();
			return 1;
		}
		else if(this.x > winsize.width - (spriteWidth/2)) 
		{
			console.log("this.x > winsize.width - (spriteWidth/2):"+this.x+" >"+(winsize.width - (spriteWidth/2)));
			this.x = winsize.width - (spriteWidth/2);
			this.setMoving(false);
			this.stopAnim();
			return 1;
		}
		if(this.y < 0 + (spriteHeight/2))
		{
			console.log("this.y < 0 + (spriteHeight/2):"+this.y+" <"+(0 + (spriteHeight/2)));
			this.y = 0 + (spriteHeight/2);
			this.setMoving(false);
			this.stopAnim();
			return 1;
		}
		else if(this.y > winsize.height - (spriteHeight/2)) 
		{
			console.log("this.y > winsize.height - (spriteHeight/2):"+this.y+" >"+(winsize.height - (spriteHeight/2)));
			this.y = winsize.height - (spriteHeight/2);
			this.setMoving(false);
			this.stopAnim();
			return 1;
		}
		return 0;			
	}
	

});


var PlayerBase = cc.Sprite.extend({
    isMoving:false,
	animation:null,
	state:null,
	player_name:null,
	player_id:null,
	animationRepeatForeverAction:null,
	serverResponsesList:null,
	animationStarted:false,
	ctor: function(state,player_name,frameName,player_id){
		this._super();
		this.player_name = player_name;
		this.setId(player_id);
		this.setState(state);
		this.serverResponsesList = new Array();
        this.animationStarted = false;
        
    },
	onEnter:function () {
		this._super();
		this.setAnimByState(this.state);
		
	},
	
	setMoving:function(bMove)
	{
		this.isMoving = bMove;
	},
	getMoving:function()
	{
		return this.isMoving;	
	},
	startAnim:function () {
		 //this.stopAnim();
		 if(this.animationStarted != true)
		 {
		 	this.animationStarted = true;
		 	this.runAction(this.animationRepeatForeverAction);
		 }
	},
	stopAnim:function () {
		 this.stopActionByTag(this.ANIMATION_REPEAT_FOREVER_TAG); 
		 this.stopActionByTag(this.ANIMATION_ACTION_TAG); 
		 this.animationStarted = false;
	},
	BorderCollisionDetection:function(winsize) {
		var offset = 20;
		var spriteWidth   = this.getBoundingBox().width+offset;
		var spriteHeight  = this.getBoundingBox().height+offset;
		if(this.x < 0 + (spriteWidth)) 
		{
			this.x = 0 + (spriteWidth);
			this.isMoving = false;
			this.stopAnim();
			return true;
		}
		else if(this.x > winsize.width - (spriteWidth)) 
		{
			this.x = winsize.width - (spriteWidth);
			this.isMoving = false;
			this.stopAnim();
			return true;
		}
		if(this.y < 0 + (spriteHeight))
		{
			this.y = 0 + (spriteHeight);
			this.isMoving = false;
			this.stopAnim();
			return true;
		}
		else if(this.y > winsize.height - (spriteHeight)) 
		{
			this.y = winsize.height - (spriteHeight);
			this.isMoving = false;
			this.stopAnim();
			return true;
		}	
		return false;		
	},
	getId:function()
	{
		return this.player_id;
	},
	setId:function(id)
	{
		this.player_id = id;
	},
	setState:function(state)
	{
		this.state = state;
	},
    move:function (x,y) {
	    this.x	+= x;
	    this.y	+= y;
    },
	setXY:function (x,y) {
	    this.x	= x;
	    this.y	= y;
    },
	setAnimByState:function(state)
	{
		
		var charType = this.getImageByState(state);
		var animFrames = [];
        var str = "";
        var frame;
        for (var i = 1; i < 4; i++) {
            str = "l0_sprite_"+charType+"_"+i+ ".png";
            frame = spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }
		this.animation = new cc.Animation(animFrames,0.1);
		this.animation.tag = this.ANIMATION_ACTION_TAG;
		this.animationRepeatForeverAction = cc.animate(this.animation).repeatForever(); 
		this.animationRepeatForeverAction.tag = this.ANIMATION_REPEAT_FOREVER_TAG;
	},
	getImageByState:function(stateimg) {
			switch(stateimg)
			{				
				case states.PLAYER_B:
				{					 
					return "b";
				}
				case states.PLAYER_Y:
				{					 
					return "y";
				}
				case states.PLAYER_R:
				{					 
					return "r";
				}
			}
	}
});

Player.initSpriteFrame = function (frameName,states,player_name,pid) {
    var player = new Player(states,frameName,player_name,pid);
    return player;
};