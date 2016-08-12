var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket; 

var MsgProtocolContainer =  function() 
{
	this.msgProtocol = new MsgProtocol();
	this.msgProtocolGems = new MsgProtocol();
}
var WebSocketNode = cc.Node.extend({
	    m_wsiSendBinary:null,
	    m_loginObj:null,
	    m_GameLayer:null,
	    m_msgProtocolContainer:null,
	    ctor:function () {
	        this._super();	
	        this.winsize = cc.winSize;
	        this.m_msgProtocolContainer = new MsgProtocolContainer();        
	    },
	    init: function () {
	       this.m_wsiSendBinary = new WebSocket("ws://127.0.0.1:7681/wsapi");
	       this.m_wsiSendBinary.binaryType = "arraybuffer";
	       this.m_wsiSendBinary.onopen = function(evt) {
	           cc.log("Send Binary WS was opened.");
	       };

	       this.m_wsiSendBinary.onmessage = (function(evt) {
			   var binaryUint8 = new Uint8Array(evt.data);
			   var binaryStr = '';
			   for (var i = 0; i < binaryUint8.length; i++) {
			        binaryStr += String.fromCharCode(binaryUint8[i]);
			   }
 	          // cc.log(binaryStr);
 	           this.handleServerResponse(binaryStr);


 	       this.m_wsiSendBinary.onerror = function(evt) {
 	       	   //this.m_loginObj.serverofflineLabel = 180;
	           cc.log("m_wsiSendBinary Error was fired");
	            if (cc.sys.isObjectValid(self)) {
	               //self._errorStatus.setString("an error was fired");
	               cc.log("an error was fired");
	           } else {
	               cc.log("WebSocket test layer was destroyed!");
	           }
	       };

	       this.m_wsiSendBinary.onclose = function(evt) {
	           cc.log("m_wsiSendBinary websocket instance closed.");
	           self.m_wsiSendBinary = null;
	       };
	           
	       }).bind(this);

	      
	        return true;
    	},
    	getMsgProtocol:function()
    	{
    		return this.m_msgProtocolContainer;
    	},
    	handleServerResponse:function(binaryStr)
    	{
				var ResponseFromServer = Decode(binaryStr);
				 
				//cc.log(Encode(ResponseFromServer));
					switch(ResponseFromServer.status)
					{
						case 1:
						{
							//cc.log(ResponseFromServer.player_id);
							this.m_msgProtocolContainer.msgProtocol.player_id = ResponseFromServer.player_id;
							if(ResponseFromServer.hasOwnProperty("players"))
							{
								this.m_msgProtocolContainer.msgProtocol.players = ResponseFromServer.players;
							}
							this.m_loginObj.switchToGame();
							break;
						}
						case 3:
						{
							this.m_GameLayer.syncPlayerActions(ResponseFromServer);
							break;
						}
						case 4:
						{
							this.m_GameLayer.AddOtherPlayerOnRegister(ResponseFromServer);
							break;
						} 
						case 5:
						{
							this.m_GameLayer.updateOtherPlayerOnMovment(ResponseFromServer);
							break;
						} 
						case 6:
						{
							this.m_GameLayer.deletePlayer(ResponseFromServer);
							break;
						} 
						case 7:
						{
							this.m_msgProtocolContainer.msgProtocolGems.simple_gems = ResponseFromServer.simple_gems;
							this.m_msgProtocolContainer.msgProtocolGems.bomb_gems = ResponseFromServer.bomb_gems;
							this.m_msgProtocolContainer.msgProtocolGems.status = ResponseFromServer.status;
							this.m_msgProtocolContainer.msgProtocolGems.player_id = ResponseFromServer.player_id;
							this.m_msgProtocolContainer.msgProtocolGems.utc_timestemp = ResponseFromServer.utc_timestemp;
							break;
						} 					 
					}
		 		
    	},
	    _stringConvertToArray:function (strData) {
	        if (!strData)
	        {
	            return null;
	        }

	        var arrData = new Uint16Array(strData.length);
	        for (var i = 0; i < strData.length; i++) {
	            arrData[i] = strData.charCodeAt(i);
	        }
	        return arrData;
	    },
	    _stringConvertToUint8Array:function (strData) {
	    	 
		    // View the byte buffer as an array of 8-bit unsigned integers
		    var arrData = new Uint8Array(strData.length);
		    for (var i=0;i<strData.length;++i) {
		        arrData[i] = strData.charCodeAt(i);
		    }
		    // Log the binary array
		    //cc.log("SEND ARRAY BUFFER: " + arrData.buffer);
		    return arrData;
	    },

	    sendMassage: function(reqJson,_obj)
	    {
	    	this.setObjByStatus(_obj,reqJson,reqJson.status);

	        if (this.m_wsiSendBinary.readyState == WebSocket.OPEN)
	        {
	           // cc.log("Send Binary WS is waiting...");
	            var buf = Encode(reqJson);
	            //cc.log("FROM CLIENT:"+buf);
	            //console.log("PLAYER SEND:"+reqJson.player_name+" x:"+reqJson.player_x);
				//cc.log("PLAYER SEND X:"+reqJson.player_name+" x:"+reqJson.player_x);
				//cc.log("PLAYER SEND Y:"+reqJson.player_name+" y:"+reqJson.player_y);
	            var binary = this._stringConvertToUint8Array(buf);
	            if(reqJson.status==2)
		    	{
		    		var buf1 = Encode(reqJson);
	       			 cc.log("FROM CLIENT reqJson.status==2:"+buf1);
		    	}
		    	else if(reqJson.status==8)
		    	{
					 var buf1 = Encode(reqJson);
	       			 cc.log("FROM CLIENT reqJson.status==8:"+buf1);
		    	}
	            this.m_wsiSendBinary.send(binary.buffer);
	        }
	        else
	        {
	            var warningStr = "send binary websocket instance wasn't ready...try again in few seconds";
	            cc.log(warningStr);
	            this.init();
	           
	             
	        }
	    },
	    setObjByStatus: function(_obj,_reqJson,_status)
	    {
	    	switch(_status)
	    	{
	    		case 0 :
	    		{
	    			this.m_msgProtocolContainer.msgProtocol.player_name = _reqJson.player_name;
	    			
					this.m_msgProtocolContainer.msgProtocol.end_player_pos_x=this.winsize.width / 2;
					this.m_msgProtocolContainer.msgProtocol.end_player_pos_y=this.winsize.height / 2;
	    			this.m_loginObj = _obj;
	    			break;
	    		}
	    		case 2 :
	    		{
	    			this.m_msgProtocolContainer.msgProtocol.player_x = _reqJson.player_x;
	    			this.m_msgProtocolContainer.msgProtocol.player_y = _reqJson.player_y;
	    			this.m_msgProtocolContainer.msgProtocol.player_seq = _reqJson.player_seq;
	    			this.m_msgProtocolContainer.msgProtocol.status = _reqJson.status;
	    			this.m_GameLayer = _obj;
	    			break;
	    		}
	    		case 100 :
	    		{
	    			this.m_GameLayer = _obj;
	    			break;
	    		}

	    	}
	    }

});

