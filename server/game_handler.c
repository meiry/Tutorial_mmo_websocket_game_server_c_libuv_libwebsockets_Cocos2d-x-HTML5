/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include "game_handler.h"
#include "simplog.h"
extern int debug_level;
connection_num_as_id = 0;
Hashmap *users_map_main = NULL;
//Array *gems_array = NULL;
uv_timer_t timeout_watcher;
static bool str_eq(void *key_a, void *key_b)
{
	return !strcmp((const char *)key_a, (const char *)key_b);
}
/* use djb hash unless we find it inadequate */
static int str_hash_fn(void *str)
{
	uint32_t hash = 5381;
	char *p;

	for (p = str; p && *p; p++)
	{
		hash = ((hash << 5) + hash) + *p;
	}
	return (int)hash;
}
static int c = 0;
//generate random gems in the game 
bool generate_random_gems(int num_of_gems, gem_types gem_type)
{
	if (gems_array == NULL)
	{
		gems_array = arrayCreate();
	}
	int array_size = arraySize(gems_array);
	//960, 640 
			
	for (int i = array_size; i < (array_size+num_of_gems); i++)
	{
		struct gem_data *gemdata = malloc(sizeof * gemdata);
		//r = (rand() % (max + 1 - min)) + min
		int rw = (rand() % (900 + 1 - 50)) + 50; //returns a pseudo-random integer between x resolution size 0 -> width
		int rh = (rand() % (600 + 1 - 50)) + 50;    //returns a pseudo-random integer between x resolution size 0 -> height
		lwsl_notice("c:%d type:%d width %d height %d\n", c, gem_type, rw, rh);
		gemdata->type = gem_type;
		gemdata->x = rw;
		gemdata->y = rh;
		gemdata->collide_with_player = false;
		arrayAdd(gems_array, gemdata);
		c++;
	}
	return true;
}

struct session_holder_data * set_session_holder_data(bool(*cp)(void*, void*, void*),
														struct per_session_data__apigataway *_pss)
{
	struct session_holder_data *session_holder_data_tmp = malloc(sizeof * session_holder_data_tmp);
	session_holder_data_tmp->found = false;
	session_holder_data_tmp->current_session_player_id = _pss->player_id;
	session_holder_data_tmp->players_session_holder = arrayCreate();
	hashmapForEach(users_map_main, cp, session_holder_data_tmp);
	return session_holder_data_tmp;
}

void send_response(cJSON *_root_respose,struct per_session_data__apigataway *_other_p_session,
													struct per_session_data__apigataway *_pss)
{
	unsigned char response_to_other_client[LWS_PRE + 1024];
	unsigned char *p_response_to_other_client = &response_to_other_client[LWS_PRE];
	char* resp_json = cJSON_Print(_root_respose);
	int n = sprintf((char *)p_response_to_other_client, "%s", resp_json);
    lwsl_notice("send_response to client [%s]  %s\n", _other_p_session->player_name, resp_json);
    LOG_PRINT("send_response to client [%s]  %s\n", _other_p_session->player_name, resp_json);
	//lwsl_notice("[%s] send response to client [%s] from server on registrator: %s \n", _pss->player_name, _other_p_session->player_name, p_response_to_other_client);
	//LOG_PRINT("[%s] send response to client [%s] from server on registrator: %s \n", _pss->player_name, _other_p_session->player_name, p_response_to_other_client);
	//each player has its own copy of libwebsockets (lws in short ) wsi , whitch is the player channel + session pointer 
	int m = lws_write(_other_p_session->player_wsi, p_response_to_other_client, n, LWS_WRITE_BINARY);
	if (m < n) {
		lwsl_err("ERROR %d writing to di socket on registrator\n", sizeof(response_to_other_client));
		LOG_PRINT("ERROR %d writing to di socket on movment\n", sizeof(response_to_other_client));
	}
}
//preper inform about this user which is dead ( disconnected from the game ) 
static bool user_is_dead_cp(void* key, void* value, void* context)
{
	struct session_holder_data *session_holder_data_tmp =
		(struct session_holder_data *)context;
	//It is not the current user 
	//lwsl_notice("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	if (strcmp(key, session_holder_data_tmp->current_session_player_id) != 0)
	{
		//set the holder 
		arrayAdd(session_holder_data_tmp->players_session_holder, (struct per_session_data__apigataway *)value);
	}
	return true;
}
//check and handle other users
static bool check_other_users_cp(void* key, void* value, void* context)
{
	struct session_holder_data *session_holder_data_tmp =
		(struct session_holder_data *)context;
	//It is not the current user 
	//lwsl_notice("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	if (strcmp(key, session_holder_data_tmp->current_session_player_id) != 0)
	{
		//set the holder 
		arrayAdd(session_holder_data_tmp->players_session_holder, (struct per_session_data__apigataway *)value);
	}
	return true;
}
//check and handle other movments
static bool check_other_users_movment_cp(void* key, void* value, void* context)
{
	struct session_holder_data *session_holder_data_tmp =
		(struct session_holder_data *)context;
	//It is not the current user 
	//lwsl_notice("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	//LOG_PRINT("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	if (strcmp(key, session_holder_data_tmp->current_session_player_id) != 0)
	{
		//set the holder 
		arrayAdd(session_holder_data_tmp->players_session_holder, (struct per_session_data__apigataway *)value);
	}
	return true;
}
//check and handle other score update
static bool check_other_users_gemscore_cp(void* key, void* value, void* context)
{
	struct session_holder_data *session_holder_data_tmp =
		(struct session_holder_data *)context;
	//It is not the current user 
	//lwsl_notice("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	//LOG_PRINT("key: '%s' current_session_player_id: '%s'\n", (char *)key, (char *)session_holder_data_tmp->current_session_player_id);
	if (strcmp(key, session_holder_data_tmp->current_session_player_id) != 0)
	{
		//set the holder 
		arrayAdd(session_holder_data_tmp->players_session_holder, (struct per_session_data__apigataway *)value);
	}
	return true;
}

//response to every 100ms game loop tick
static bool response_to_client_cp(void* key, void* value, void* context)
{
	bool doInvokeResponse = false;
	int hash_map_size = hashmapSize(users_map_main);	
	 
	if (hash_map_size > 0)
	{
		//when response is created there is need to define buffer to hold the response 
		//libwebsokets way there need for pedding left:LWS_PRE  
		struct per_session_data__apigataway *pss =
			(struct per_session_data__apigataway *)hashmapGet(users_map_main, (char *)key);
        char* resp_jsont = cJSON_Print(pss->user_json_respose);
        //lwsl_notice("INSIDE RESPONSE_TO_CLIENT_CP pss->user_json_respose: %s \n", resp_jsont);
        //LOG_PRINT("INSIDE RESPONSE_TO_CLIENT_CP pss->user_json_respose: %s \n", resp_jsont);
		//first on registretion the server scatter the gems 
		if (pss->status == 0 && pss->done_srv_update == true)
		{	 
			cJSON *root_respose = build_gems_scatter_json(pss);
			doInvokeResponse = true;
			pss->user_json_respose = root_respose;
			char* resp_json = cJSON_Print(pss->user_json_respose);
			lwsl_notice("Response to client gems from server: %s \n",resp_json);
			send_response_to_current_player(pss);
		}
		//response json by state of the user
		//state 1 registretion :
		if (pss->status == 0 && pss->done_srv_update == true)
		{
			//update it to 1 so registretion will invoked only once per conneting user
			pss->status =1;
			cJSON *root_respose = build_player_json_registrator(pss);
			doInvokeResponse = true;
			//check if there is other players that registed beside you
			int user_hash_size = hashmapSize(users_map_main);
			//lwsl_notice("response_to_client_cp : user_hash_size: %d \n", user_hash_size);
			if (user_hash_size > 1)
			{
				struct session_holder_data *session_holder_data_tmp = set_session_holder_data(check_other_users_cp, pss);
				//now we have the others users which we need to update the current user 				
				//preper the other players session structures 
				cJSON* players;
				int i = 0;
				int size = arraySize(session_holder_data_tmp->players_session_holder);
				if (size > 0)
				{
					players = cJSON_CreateArray();
					while (i < size) {
						struct per_session_data__apigataway *other_p_session = arrayGet(session_holder_data_tmp->players_session_holder, i);
						//build json of player 
						cJSON* player = build_player_json_registrator(other_p_session);
						cJSON_InsertItemInArray(players, i, player);
						//send current player to other players 
						//change only for this response the json to: "4 : other player"
						int status = cJSON_GetObjectItem(root_respose, "status")->valueint;
						//BUG in cJSON need to update also valuedouble when updating valueint
						//https://sourceforge.net/p/cjson/discussion/998969/thread/813ba29b/
						cJSON_GetObjectItem(root_respose, "status")->valueint = 4; 
						cJSON_GetObjectItem(root_respose, "status")->valuedouble = 4;
						//send to client 
						send_response(root_respose,other_p_session,pss);
						//set back the original status
						cJSON_GetObjectItem(root_respose, "status")->valueint = status;
						cJSON_GetObjectItem(root_respose, "status")->valuedouble = status;
						// Move to next.
						i++;
						
					}
					cJSON_AddItemToObject(root_respose, "players", players);
					arrayFree(session_holder_data_tmp->players_session_holder);
					free(session_holder_data_tmp);
				}
			}
			pss->user_json_respose = root_respose;			
		}
		else if (pss->status == 2 &&  pss->done_srv_update == true) //movment state
		{
           
			pss->status =3; //aprove movment state 
			//for current session 
			doInvokeResponse = true;
			cJSON *root_respose = build_player_json_movment(pss);
            //lwsl_notice("RESPONSE START pss->request_from_client_buf Movment 2: %s \n", pss->request_from_client_buf);
            //LOG_PRINT("RESPONSE START pss->request_from_client_buf Movmente 2: %s \n", pss->request_from_client_buf);
            if (pss->collision_status == 8)
            {
                //gem eat and score increment acknowledgment
                pss->collision_status = 9;
                root_respose = build_gems_score_json(pss);
                lwsl_notice("RESPONSE MIDELL pss->collision_status: %d \n", pss->collision_status);
                LOG_PRINT("RESPONSE MIDELL pss->collision_status: %d \n", pss->collision_status);
            }
            //lwsl_notice("RESPONSE pss->request_from_client_buf Movment 2: %s \n", pss->request_from_client_buf);
            //LOG_PRINT("RESPONSE pss->request_from_client_buf Movmente 2: %s \n", pss->request_from_client_buf);
			int user_hash_size = hashmapSize(users_map_main);
			//lwsl_notice("response_to_client_cp : user_hash_size: %d \n", user_hash_size);
			if (user_hash_size > 1)
			{
				//create tmp game users session data holder 
				struct session_holder_data *session_holder_data_tmp = set_session_holder_data(check_other_users_movment_cp, pss);
				int i = 0;
				//check if there are more users then current player 
				int size = arraySize(session_holder_data_tmp->players_session_holder);
				if (size > 0)
				{					
					while (i < size) 
					{
						struct per_session_data__apigataway *other_p_session = arrayGet(session_holder_data_tmp->players_session_holder, i);
						//send current player to other players 
						//change the status only for this response the json status param to: "4 : other player"
						int status = cJSON_GetObjectItem(root_respose, "status")->valueint;
						//BUG in cJSON need to update also valuedouble when updating valueint
						//https://sourceforge.net/p/cjson/discussion/998969/thread/813ba29b/
						cJSON_GetObjectItem(root_respose, "status")->valueint = 5;
						cJSON_GetObjectItem(root_respose, "status")->valuedouble = 5;
						char* resp_json = cJSON_Print(root_respose);
						//send to client
						send_response(root_respose, other_p_session, pss);
						//set back the original status
						cJSON_GetObjectItem(root_respose, "status")->valueint = status;
						cJSON_GetObjectItem(root_respose, "status")->valuedouble = status;
						// Move to next.
						i++;
					}
					//clean 
					arrayFree(session_holder_data_tmp->players_session_holder);
					free(session_holder_data_tmp);
				}
			}
			//save the letest response 
			pss->user_json_respose = root_respose;
		}       
		//now invoke to the current session of the current player
		if (doInvokeResponse)
		{
			send_response_to_current_player(pss);
		}
	}
	return true;
}
//send respomse to current session player
void send_response_to_current_player(struct per_session_data__apigataway *_pss)
{
	unsigned char response_to_client[LWS_PRE + 1024];
	unsigned char *p_response_to_clientout = &response_to_client[LWS_PRE];
	char* resp_json = cJSON_Print(_pss->user_json_respose);
	int n = sprintf((char *)p_response_to_clientout, "%s", resp_json);
	//lwsl_notice("Response to client from server: %s \n", p_response_to_clientout);
	//LOG_PRINT("Response to client from server: %s \n", p_response_to_clientout);
	//each player has its own copy of libwebsockets (lws in short ) wsi , witch is the player channel + session pointer 
	int m = lws_write(_pss->player_wsi, p_response_to_clientout, n, LWS_WRITE_BINARY);
	if (m < n) {
		lwsl_err("ERROR %d writing to di socket\n", sizeof(response_to_client));
		LOG_PRINT("ERROR %d writing to di socket\n", sizeof(response_to_client));
	}
	//reset values for next tick in the game loop 
	memset(_pss->player_seq, 0, sizeof(_pss->player_seq));
	_pss->player_seq_index = 0;
    _pss->collision_status = 0;
}
//scatter the gems 
void scatter_gems()
{
	generate_random_gems(1, SIMPLE);
	//generate_random_gems(3, BOMB);
}
//all sessions to the game will be invoked via this function 
//this function is the GAME LOGIC 
static void game_loop_cb(uv_timer_t* handle
#if UV_VERSION_MAJOR == 0
	, int status
#endif
	) {
	 
	ASSERT(handle != NULL);
	ASSERT(1 == uv_is_active((uv_handle_t*)handle));
	 
	int after = hashmapSize(users_map_main);
	if (hashmapSize(users_map_main)>0)
	{
		hashmapForEach(users_map_main, &response_to_client_cp, users_map_main);
	}

}
//main ws api function , which is called each time client invoke API 
int callback_wsapi(struct lws *wsi, enum lws_callback_reasons reason,
					void *user, void *in, size_t len)
{
	if (users_map_main == NULL)
	{
		users_map_main = hashmapCreate(10, str_hash_fn, str_eq);
	}
	//char *resp_json;
	unsigned char response_to_client[LWS_PRE + 1024];
	struct per_session_data__apigataway *pss =
		(struct per_session_data__apigataway *)user;
	unsigned char *p_response_to_clientout = &response_to_client[LWS_PRE];
	int n;
	
 	switch (reason) {
		case LWS_CALLBACK_PROTOCOL_INIT:
		{
			srand((unsigned int)time(NULL));
			//Scatter gems
			scatter_gems();
			uv_timer_init(lws_uv_getloop(lws_get_context(wsi), 0),&timeout_watcher);
			//every 100ms
			uv_timer_start(&timeout_watcher, game_loop_cb, 1000, 100);
			break;
		}
		case LWS_CALLBACK_ESTABLISHED:
		{
			pss->recive_all_from_client = 0;
			pss->player_wsi = malloc(sizeof pss->player_wsi);
			pss->player_wsi = wsi;
			pss->player_seq_index = 0;
			pss->score = 0;
			pss->bomb_gems = arrayCreate();
			pss->simple_gems = arrayCreate();
			connection_num_as_id++;
			break;
		}
		case LWS_CALLBACK_SERVER_WRITEABLE:
		{
				//get request from client and parse json 			 
				//lwsl_notice("pss->request_from_client_buf 2: %s \n", pss->request_from_client_buf);
				cJSON * root = cJSON_Parse(pss->request_from_client_buf);
				int status = cJSON_GetObjectItem(root, "status")->valueint;
				switch (status) {
					case 0: //Registration
					{	
						pss->done_srv_update = false;
						pss->player_name = cJSON_GetObjectItem(root, "player_name")->valuestring;
						pss->status = status;
						pss->player_id = generateId();
						pss->utc_timestemp = (long long)time(NULL);
						char* end_player_pos_x = cJSON_GetObjectItem(root, "end_player_pos_x")->valuestring;
						char* end_player_pos_y = cJSON_GetObjectItem(root, "end_player_pos_y")->valuestring;
						pss->end_player_pos_x = end_player_pos_x;
						pss->end_player_pos_y = end_player_pos_y;
						pss->done_srv_update = true;						
						//set the user in the users repostory on succesfull registretion
						hashmapPut(users_map_main, pss->player_id, pss);
						int after = hashmapSize(users_map_main);
						lwsl_notice("Registration : hashmapSize size :%d ,  \n", after);
						break;
					}
					case 2: //Movment
					{	
						//MEIRY need to update hashmap
                        lwsl_notice("pss->request_from_client_buf Movment : %s \n", pss->request_from_client_buf);
                        LOG_PRINT("pss->request_from_client_buf Movmente : %s \n", pss->request_from_client_buf);
						pss->done_srv_update = false;
                        int collision_status = cJSON_GetObjectItem(root, "collision_status")->valueint;
                        pss->collision_status = collision_status;
						pss->counter++;
						//lwsl_notice("Movment : pss->player_seq_index :%d ,  \n", pss->player_seq_index);
						char* player_x = cJSON_GetObjectItem(root, "player_x")->valuestring;
						char* player_y = cJSON_GetObjectItem(root, "player_y")->valuestring;
						//lwsl_notice("Movmentplayer_x:%s\n", player_x);
						//lwsl_notice("Movmentplayer_y:%s\n", player_y);
						char* end_player_pos_x = cJSON_GetObjectItem(root, "end_player_pos_x")->valuestring;
						char* end_player_pos_y = cJSON_GetObjectItem(root, "end_player_pos_y")->valuestring;
						char* player_seq = cJSON_GetObjectItem(root, "player_seq")->valuestring;
						//int stop_player = cJSON_GetObjectItem(root, "stop_player")->valueint;
						int status = cJSON_GetObjectItem(root, "status")->valueint;
                        
						pss->player_x_r[pss->player_seq_index] = player_x;
						pss->player_y_r[pss->player_seq_index] = player_y;
						pss->player_seq[pss->player_seq_index] = player_seq;
						//lwsl_notice("Movment : pss->player_seq_index :%d ,  \n", pss->player_seq_index);
						pss->player_seq_index++;
						pss->status =2;  
                       
						pss->utc_timestemp = (long long)time(NULL); //for tracking
						pss->end_player_pos_x = end_player_pos_x;
						pss->end_player_pos_y = end_player_pos_y;
                        lwsl_notice("MIDEL pss->request_from_client_buf Movment : %s \n", pss->request_from_client_buf);
                        LOG_PRINT("MIDEL pss->request_from_client_buf Movmente : %s \n", pss->request_from_client_buf);
                        if (pss->collision_status == 8)
                        {
                            lwsl_notice("INSIDE 1 pss->request_from_client_buf Movment : %s \n", pss->request_from_client_buf);
                            LOG_PRINT("INSIDE 1 pss->request_from_client_buf Movmente : %s \n", pss->request_from_client_buf);
                            int score = cJSON_GetObjectItem(root, "score")->valueint;
                            cJSON *simple_gems = cJSON_GetObjectItem(root, "simple_gems");
                            for (int i = 0; i < cJSON_GetArraySize(simple_gems); i++)
                            {

                                struct gem_data *gemdata = malloc(sizeof * gemdata);
                                cJSON * itemX = cJSON_GetArrayItem(simple_gems, i);
                                ++i;
                                cJSON * itemY = cJSON_GetArrayItem(simple_gems, i);
                                gemdata->x = itemX->valueint;
                                gemdata->y = itemY->valueint;
                                gemdata->type = SIMPLE;
                                gemdata->collide_with_player = true;
                                arrayAdd(pss->simple_gems, gemdata);

                            }
                            cJSON *bomb_gems = cJSON_GetObjectItem(root, "bomb_gems");
                            for (int i = 0; i < cJSON_GetArraySize(bomb_gems); i++)
                            {
                                struct gem_data *gemdata = malloc(sizeof * gemdata);
                                cJSON * itemX = cJSON_GetArrayItem(bomb_gems, i);
                                ++i;
                                cJSON * itemY = cJSON_GetArrayItem(bomb_gems, i);
                                gemdata->x = itemX->valueint;
                                gemdata->y = itemY->valueint;
                                gemdata->type = BOMB;
                                gemdata->collide_with_player = true;
                                arrayAdd(pss->bomb_gems, gemdata);
                            }
                             
                            pss->score = score;
                            pss->collision_utc_timestemp = (long long)cJSON_GetObjectItem(root, "utc_timestemp")->valuedouble; //for tracking
                            lwsl_notice("INSIDE 2 pss->request_from_client_buf Movment : %s \n", pss->request_from_client_buf);
                            LOG_PRINT("INSIDE 2 pss->request_from_client_buf Movmente : %s \n", pss->request_from_client_buf);
                        }
                        lwsl_notice("END pss->request_from_client_buf Movment : %s \n", pss->request_from_client_buf);
                        LOG_PRINT("END pss->request_from_client_buf Movmente : %s \n", pss->request_from_client_buf);


						//pss->stop_player = stop_player;
						pss->done_srv_update = true;
					 
                        struct per_session_data__apigataway *pssTmp  = hashmapPut(users_map_main, pss->player_id, pss);
                        if(pssTmp->collision_status == 8)
                        {
                            lwsl_notice("INSIDE HASHMAPPUT  pssTmp->request_from_client_buf Movment : %s \n", pssTmp->request_from_client_buf);
                            LOG_PRINT("INSIDE HASHMAPPUT  pssTmp->request_from_client_buf Movmente : %s \n", pssTmp->request_from_client_buf);
                        }
						break;
					}
					
					default:
						lwsl_notice("Invalid status \n");
						 
				}				
			break;
		}
		case LWS_CALLBACK_RECEIVE:
		{
			if (len < 1)
			{
				break;
			}
			//lwsl_notice("Request from server: %s \n", (const char *)in);		
			pss->binary = lws_frame_is_binary(wsi);
 			//memcpy(&pss->request_from_client_buf[LWS_PRE], in, len);	
			memcpy(&pss->request_from_client_buf, in, len);
			//lwsl_notice("pss->request_from_client_buf: %s \n", pss->request_from_client_buf);
			pss->recive_all_from_client = 1;
			//Only invoke callback back to client when baby client is ready to eat 
			lws_callback_on_writable(wsi);
			break;
		}
			/*
			* this just demonstrates how to use the protocol filter. If you won't
			* study and reject connections based on header content, you don't need
			* to handle this callback
			*/
		case LWS_CALLBACK_FILTER_PROTOCOL_CONNECTION:
			//dump_handshake_info(wsi);
			/* you could return non-zero here and kill the connection */
			break;

			/*
			* this just demonstrates how to handle
			* LWS_CALLBACK_WS_PEER_INITIATED_CLOSE and extract the peer's close
			* code and auxiliary data.  You can just not handle it if you don't
			* have a use for this.
			*/
		case LWS_CALLBACK_WS_PEER_INITIATED_CLOSE:
		{
			lwsl_notice("LWS_CALLBACK_WS_PEER_INITIATED_CLOSE: len %d\n", len);
			for (n = 0; n < (int)len; n++)
			{
				lwsl_notice(" %d: 0x%02X\n", n, ((unsigned char *)in)[n]);
			}
	
			//update it to 6 which is this user is capot 
			pss->status =6;
			//we will use the registrator json , as only the status and the id is all it matters 			 
			int user_hash_size = hashmapSize(users_map_main);
			//lwsl_notice("response_to_client_cp : user_hash_size: %d \n", user_hash_size);
			if (user_hash_size > 1)
			{
				struct session_holder_data *session_holder_data_tmp = set_session_holder_data(user_is_dead_cp, pss);
				//now we have the others users which we need to update the current user 
				//preper the other players session structures 
				int i = 0;
				int size = arraySize(session_holder_data_tmp->players_session_holder);
				if (size > 0)
				{					 
					while (i < size)
					{
						struct per_session_data__apigataway *other_p_session = arrayGet(session_holder_data_tmp->players_session_holder, i);
						//send current player to other players 
						int status = cJSON_GetObjectItem(pss->user_json_respose, "status")->valueint;
						//BUG in cJSON need to update also valuedouble when updating valueint
						//https://sourceforge.net/p/cjson/discussion/998969/thread/813ba29b/
						cJSON_GetObjectItem(pss->user_json_respose, "status")->valueint = 6;
						cJSON_GetObjectItem(pss->user_json_respose, "status")->valuedouble = 6;
					
						send_response(pss->user_json_respose, other_p_session, pss);
						// Move to next.
						i++;
						
					}
					arrayFree(session_holder_data_tmp->players_session_holder);
					free(session_holder_data_tmp);
				}
			}
			//send to self 
			char* resp_json = cJSON_Print(pss->user_json_respose);
			int n = sprintf((char *)p_response_to_clientout, "%s", resp_json);
			//lwsl_notice("Response to client from server: %s \n", p_response_to_clientout);
			//LOG_PRINT("Response to client from server: %s \n", p_response_to_clientout);
			//each player has its own copy of libwebsockets (lws in short ) wsi , witch is the player channel + session pointer 
			int m = lws_write(pss->player_wsi, p_response_to_clientout, n, LWS_WRITE_BINARY);
			if (m < n) {
				lwsl_err("ERROR %d writing to di socket\n", sizeof(response_to_client));
				LOG_PRINT("ERROR %d writing to di socket\n", sizeof(response_to_client));

			}
			//handle user that disconnected 			
			//remove from users hash
			hashmapRemove(users_map_main, pss->player_id);
			int hash_map_size = hashmapSize(users_map_main);
			lwsl_notice("User %s disconnected: %s hashmap:%d \n", pss->player_name, pss->player_id, hash_map_size);
			LOG_PRINT("User %s disconnected: %s hashmap:%d \n", pss->player_name, pss->player_id, hash_map_size);

			//no players on the server reset gems 
			if (hash_map_size == 0)
			{
				if (gems_array != NULL)
				{
					int array_size = arraySize(gems_array);
					int i = 0;
					while (i < array_size) {
						lwsl_notice("clear count gem element ii:%d \n", i);
						struct gem_data* gd = arrayRemove(gems_array, i);
						int array_size1 = arraySize(gems_array);
						lwsl_notice("clear gem element ii:%d x:%d y:%d type:%d \n", i, gd->x, gd->y,gd->type);
						free(gd);
						array_size--;
					}
					//build again the gems 
					scatter_gems();
				}				
			}

			break;

		 }
 
		default:
			break;
	}

	return 0;
}