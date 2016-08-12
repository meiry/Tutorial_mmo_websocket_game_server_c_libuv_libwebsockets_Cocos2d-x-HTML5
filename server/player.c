/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include "player.h"
#include "simplog.h"

cJSON *build_player_json_registrator(struct per_session_data__apigataway *_pss)
{
	cJSON *root_respose = cJSON_CreateObject();
	cJSON_AddStringToObject(root_respose, "player_id", _pss->player_id);
	cJSON_AddNumberToObject(root_respose, "status", 1);
	cJSON_AddStringToObject(root_respose, "player_name", _pss->player_name);
	cJSON_AddStringToObject(root_respose, "end_player_pos_x", _pss->end_player_pos_x);
	cJSON_AddStringToObject(root_respose, "end_player_pos_y", _pss->end_player_pos_y);
	cJSON_AddNumberToObject(root_respose, "utc_timestemp", (double)_pss->utc_timestemp);
	//lwsl_notice("players register:%s\n", cJSON_Print(root_respose));
	return root_respose;
}

//build the response for user movment
cJSON *build_player_json_movment(struct per_session_data__apigataway *_pss)
{
	cJSON *root_respose = cJSON_CreateObject();
	cJSON_AddNumberToObject(root_respose, "score", _pss->score);
	cJSON_AddStringToObject(root_respose, "player_id", _pss->player_id);
	cJSON_AddNumberToObject(root_respose, "status", 3);
    cJSON_AddNumberToObject(root_respose, "collision_status", _pss->collision_status);
	//cJSON_AddNumberToObject(root_respose, "stop_player", _pss->stop_player);
	cJSON_AddStringToObject(root_respose, "player_name", _pss->player_name);
	cJSON_AddStringToObject(root_respose, "end_player_pos_x", _pss->end_player_pos_x);
	cJSON_AddStringToObject(root_respose, "end_player_pos_y", _pss->end_player_pos_y);
	cJSON_AddNumberToObject(root_respose, "utc_timestemp", (double)_pss->utc_timestemp);
	cJSON* player_seq = cJSON_CreateStringArray(_pss->player_seq, _pss->player_seq_index);
	cJSON_AddItemToObject(root_respose, "player_seq", player_seq);
	cJSON* player_x_r = cJSON_CreateStringArray(_pss->player_x_r, _pss->player_seq_index);
	cJSON_AddItemToObject(root_respose, "player_x_r", player_x_r);
	cJSON* player_y_r = cJSON_CreateStringArray(_pss->player_y_r, _pss->player_seq_index);
	cJSON_AddItemToObject(root_respose, "player_y_r", player_y_r);
	lwsl_notice("build_player_json_movment:%s\n", cJSON_Print(root_respose));
	LOG_PRINT("build_player_json_movment:%s\n", cJSON_Print(root_respose));
	return root_respose;
}
