
var Gem = cc.Sprite.extend({
	state:null,
	gem_x:0,
	gem_y:0,
	animation:null,
	animationRepeatForeverAction:null,
	ANIMATION_ACTION_TAG:111,
	ANIMATION_REPEAT_FOREVER_TAG:112,
	animationStarted:false,
	type:null,
	ctor: function(frameName,state){
		this._super();
		this.state = state;
		this.type = state;
		this.frameName = frameName;
       
    },
    onEnter:function () {
		this._super();
		if(this.frameName==null)
		{
			var BASICes = this.getImageNameByState(this.state);	
			this.initWithTexture(cc.textureCache.addImage(BASICes));  			
        }
        else
        {
        	this.initWithSpriteFrame(this.frameName); 
        	this.setAnimByState(this.state);
        }
        this.getTexture().setTexParameters(gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		this.setScale(2);	       
        this.setAnchorPoint(0.5, 0.5);		
	},
	getImageNameByState:function(stateimg) {
			switch(stateimg)
			{				
				case states_gems.SIMPLE:
				{							 	 
					return res.gem_r_png;
				}
				case states_gems.BOMB:
				{					 
					return res.gem_b_anim_png;
				}
			}
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
	setAnimByState:function(state)
	{		 
		var charType = this.getImageByState(state);
		var animFrames = [];
        var str = "";
        var frame;
        // /sprite_BOMB0.png
        for (var i = 0; i < 3; i++) {     	 
            str = "sprite_gem_"+charType+i+ ".png";
            
            frame = spriteFrameCacheGems.getSpriteFrame(str);
            animFrames.push(frame);
        }
		this.animation = new cc.Animation(animFrames,0.2);
		this.animation.tag = this.ANIMATION_ACTION_TAG;
		this.animationRepeatForeverAction = cc.animate(this.animation).repeatForever(); 
		this.animationRepeatForeverAction.tag = this.ANIMATION_REPEAT_FOREVER_TAG;
	},
	getImageByState:function(stateimg) {
			switch(stateimg)
			{				
				case states_gems.SIMPLE:
				{					 
					return "r";
				}
				case states_gems.BOMB:
				{					 
					return "b";
				}
				 
			}
	} 
	
});

Gem.initSprite = function (frameName,states) {
	 
    var gem = new Gem(frameName,states);
    return gem;
};