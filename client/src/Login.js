 
 var loginSprite = null;
 var m_websocketMng = null;
 var winsize = null;

 var LogInlayer = cc.Layer.extend({
    
    ctor:function (_websocketMng) {
       this._super();
       m_websocketMng = _websocketMng;
       winsize = cc.winSize;       
       return true;
    },
    onEnter:function () {
        this._super();
        loginSprite = Login.initSprite();
        loginSprite.x = winsize.width / 2;
        loginSprite.y = winsize.height / 2;
        this.addChild(loginSprite, 0);
    }
});

var Login = cc.Sprite.extend({
    Editbox:null,
    EditBoxText:null,
    serverofflineLabel:0,
	ctor: function(){
        this._super();

        
    },
	onEnter:function () {
		this._super();
		this.initWithTexture(cc.textureCache.addImage(res.blank_png));
        this.setTextureRect(cc.rect(0,0,500,400));
        this.setAnchorPoint(0.5, 0.5);
        this.setColor(cc.color(0, 50,111,50));	
        this.setXY(cc.winSize.width/2,cc.winSize.height/2);
          // Create the textfield
      	this.Editbox = new cc.EditBox(cc.size(180,50), new cc.Scale9Sprite(res.yellow_edit_png));
      	this.Editbox.setFont("Ariel",25);
        this.Editbox.setPlaceholderFontColor(cc.color(255, 0, 0));
        this.Editbox.setPlaceHolder("Enter Name:");
        this.Editbox.x = this.getContentSize().width/2;
        this.Editbox.y = this.getContentSize().height/2;
        this.Editbox.setDelegate(this);
        this.Editbox.setFontColor(cc.color(5, 4, 10));
        this.Editbox.setMaxLength(20);

        var LogIn_item = new cc.MenuItemFont("LogIn", this.onMenuLogInCallback,this);
        var menu = new cc.Menu(LogIn_item);
        menu.x = this.getContentSize().width/2;
        menu.y = (this.getContentSize().height/2) - this.Editbox.getContentSize().height;



        this.addChild(menu,1);
        this.addChild(this.Editbox,1);


        this.serverofflineLabel = new cc.LabelTTF("Server is down\ntry again in few seconds", "Arial",60);
        this.serverofflineLabel.x = cc.winSize.width/2;
        this.serverofflineLabel.y = (cc.winSize.height/2) - 200;
         
       
        this.parent.addChild(this.serverofflineLabel,3);
        this.serverofflineLabel.opacity = 0; 

	},
    editBoxTextChanged: function (editBox, text) {
        this.EditBoxText = text;
    },
    onMenuLogInCallback:function(sender){

        //send player name the server 
      this.serverofflineLabel.opacity = 0; 
      var msgProtocolObj = new MsgProtocol();
      msgProtocolObj.player_name = this.EditBoxText; 
      msgProtocolObj.end_player_pos_x=(winsize.width / 2).toString();
      msgProtocolObj.end_player_pos_y=(winsize.height / 2).toString();
      msgProtocolObj.status = 0;
      m_websocketMng.sendMassage(msgProtocolObj,this);
        
    },
    switchToGame:function()
    {
       this.parent.parent.switchTo(1);    
    },
	setXY:function (x,y) {
	    this.x	= x;
	    this.y	= y;
    }
});

Login.initSprite = function () {
    var login = new Login();
    return login;
};