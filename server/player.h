/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#ifndef __PLAYER_H
#define __PLAYER_H
#include "common.h"
#include "cJSON.h"
#include "game_handler.h"


cJSON *build_player_json_movment(struct per_session_data__apigataway *_pss);
cJSON *build_player_json_registrator(struct per_session_data__apigataway *_pss);
#endif