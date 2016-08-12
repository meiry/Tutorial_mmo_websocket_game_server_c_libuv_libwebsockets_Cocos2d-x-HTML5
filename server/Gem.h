/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#ifndef __GEM_H
#define __GEM_H
#include "common.h"
#include "cJSON.h"
#include "game_handler.h"

typedef enum { SIMPLE, BOMB } gem_types;

struct gem_data {
	gem_types type;
	int x;
	int y;
	bool collide_with_player;
};

cJSON *build_gems_scatter_json(struct per_session_data__apigataway *_pss);
cJSON *build_gems_score_json(struct per_session_data__apigataway *_pss); 

extern Array *gems_array;

#endif