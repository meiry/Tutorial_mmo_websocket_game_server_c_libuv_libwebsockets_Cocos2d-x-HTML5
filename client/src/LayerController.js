var websocketMng = null;
var LayerController = cc.Layer.extend({
	winsize:null,
    ctor:function () {
	   this._super();
       this.winsize = cc.winSize;	    
       return true;
    },
	onEnter:function () {
		this._super();
		websocketMng = new WebSocketNode();	
		 websocketMng.init();
		var logInlayer = new LogInlayer(websocketMng);
        var gameLayer = new GameLayer(websocketMng);
        var layer = new cc.LayerMultiplex(logInlayer,gameLayer);
        this.addChild(layer, 0);
	}
});

var LayerControllerScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layerController = new LayerController();
        this.addChild(layerController);
    }
});