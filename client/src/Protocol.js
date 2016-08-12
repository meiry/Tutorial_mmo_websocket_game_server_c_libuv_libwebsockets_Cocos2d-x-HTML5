var Encode = function(obj) {
       return JSON.stringify(obj);
   };
var Decode = function(obj) {
    return JSON.parse(obj);
};

var getUTCTimestamp = function()
{
	var now = new Date;
	var utc_timestamp = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() , 
      now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
	return utc_timestamp;
};


var states = {
    PLAYER_B:0,
    PLAYER_Y:1,
    PLAYER_R:2,
    BOMB:3
};
var states_gems = {
    SIMPLE:0,
    BOMB:1
    
};

/*
status's
0 : login
1 : login success acknowledgment
2 : send move request
3 : response move acknowledgment
4 : other player register
5 : other player movment
6 : delete user from client
7 : gem scatter
8 : gem eat and score increment 
9 : gem eat and score increment acknowledgment  
*/

// keep empty js object we will use js cool js feature called : dynamically named properties adding
//so when we send to the server we dont have to deal with the extra fields to send 
var MsgProtocol = function() {
	/*
	this.status=0;
	this.player_name ="";
	this.player_id= 0;
	this.player_x=0;
	this.player_y=0;
	this.player_seq=0;
	this.players =[];
	this.end_player_pos_x=0;
	this.end_player_pos_y=0;
	this.utc_timestemp=0;
	this.stop_player=0;
	this.simple_gems = [];
	this.bomb_gems = [];
	this.score = 0;
	this.isDead = false;
	this.collision_status =0;	 
	*/
};

var GemProtocol = function() {
	this.x = 0;
	this.y = 0;
	this.type = 0;
	this.collide_with_player = false;
};



 
 