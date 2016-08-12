/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include "Gem.h"
Array *gems_array = NULL;
//create game gems to send , the way it positioned in the array have to be
//first the X position and then the Y position 
cJSON *build_gems_scatter_json(struct per_session_data__apigataway *_pss)
{
	cJSON *root_respose = cJSON_CreateObject();
	cJSON_AddNumberToObject(root_respose, "status", 7);
	cJSON_AddNumberToObject(root_respose, "utc_timestemp", (double)_pss->utc_timestemp);
	cJSON_AddStringToObject(root_respose, "player_id", _pss->player_id);
	int array_size = arraySize(gems_array);
	int i = 0;
	cJSON * simple_gems = cJSON_CreateArray();
	cJSON * bomb_gems = cJSON_CreateArray();
	while (i < array_size)
	{
		struct gem_data *gems_array_tmp = arrayGet(gems_array, i);

		if (gems_array_tmp->type == SIMPLE)
		{
			cJSON_AddItemToArray(simple_gems, cJSON_CreateNumber(gems_array_tmp->x));
			cJSON_AddItemToArray(simple_gems, cJSON_CreateNumber(gems_array_tmp->y));
		}
		else if (gems_array_tmp->type == BOMB)
		{
			cJSON_AddItemToArray(bomb_gems, cJSON_CreateNumber(gems_array_tmp->x));
			cJSON_AddItemToArray(bomb_gems, cJSON_CreateNumber(gems_array_tmp->y));
		}
		i++;
	}
	cJSON_AddItemToObject(root_respose, "simple_gems", simple_gems);
	cJSON_AddItemToObject(root_respose, "bomb_gems", bomb_gems);

	return root_respose;
}
//gem eat and score increment acknowledgment 
//verify which gems are gone and report to other players ,verify what is the score
cJSON *build_gems_score_json(struct per_session_data__apigataway *_pss)
{
	cJSON * simple_gems = cJSON_CreateArray();
	cJSON * bomb_gems = cJSON_CreateArray();
	cJSON *root_respose = cJSON_CreateObject();
	 
	 
	cJSON_AddNumberToObject(root_respose, "status", _pss->status);
	cJSON_AddNumberToObject(root_respose, "utc_timestemp", (double)_pss->utc_timestemp);
	cJSON_AddStringToObject(root_respose, "player_id", _pss->player_id);
	cJSON_AddNumberToObject(root_respose, "score", _pss->score);
    cJSON_AddNumberToObject(root_respose, "collision_status", _pss->collision_status);
    
	int simple_gems_len = arraySize(_pss->simple_gems);
	int bomb_gems_len = arraySize(_pss->bomb_gems);
	 
	int is = 0;
	while (is < simple_gems_len) {
		struct gem_data *gems_array_tmp = arrayGet(_pss->simple_gems, is);
		int x = gems_array_tmp->x;
		int y = gems_array_tmp->y;
		cJSON_AddItemToArray(simple_gems, cJSON_CreateNumber(x));
		cJSON_AddItemToArray(simple_gems, cJSON_CreateNumber(y));
		is++;
	}

	int ib = 0;
	while (ib < bomb_gems_len) {
		struct gem_data *gems_array_tmp = arrayGet(_pss->bomb_gems, ib);
		int x = gems_array_tmp->x;
		int y = gems_array_tmp->y;
		cJSON_AddItemToArray(bomb_gems, cJSON_CreateNumber(x));
		cJSON_AddItemToArray(bomb_gems, cJSON_CreateNumber(y));
		ib++;
 		 
	}

	cJSON_AddItemToObject(root_respose, "simple_gems", simple_gems);
	cJSON_AddItemToObject(root_respose, "bomb_gems", bomb_gems);
	char* resp_json = cJSON_Print(root_respose);
	lwsl_notice("Response to client from server status 9: %s \n", resp_json);

	return root_respose;
}