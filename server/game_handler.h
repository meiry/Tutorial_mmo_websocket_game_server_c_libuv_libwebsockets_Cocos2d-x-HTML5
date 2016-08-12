/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#ifndef GAME_HANDLER_H
#define GAME_HANDLER_H

#include <uv.h>
#include "lws_config.h"
#include <stdio.h>
#include <stdlib.h>
#include <getopt.h>
#include <signal.h>
 
#include <sys/stat.h>
#include <fcntl.h>
#include <assert.h>
#include "libwebsockets.h"
#include "cJSON.h"
#include "common.h"
#include "Gem.h"
#include "player.h"

#define MAX_ECHO_PAYLOAD 1024
#define PLAYER_NAME_LEN 20

#define SEQ_LEN 100

//typedef enum { SIMPLE, BOMB } gem_types;

struct per_session_data__apigataway {
	int recive_all_from_client;
	unsigned char request_from_client_buf[LWS_PRE + MAX_ECHO_PAYLOAD];
	unsigned int len;
	unsigned int index;
	char *player_id;
	char *player_name;
	int status;
	int date_int;
	int binary;
	long long utc_timestemp;
	char* player_x_r[SEQ_LEN];
	char* player_y_r[SEQ_LEN];
	char* player_seq[SEQ_LEN];
	Array *simple_gems;
	Array *bomb_gems;
	char* end_player_pos_x;
	char* end_player_pos_y;
	int player_seq_index;
	//int stop_player;
	bool done_srv_update;
	struct lws *player_wsi;
	cJSON *user_json_respose;
	int counter;
	int score;
    int collision_status;
    long long collision_utc_timestemp;

};


struct session_holder_data {
	char* current_session_player_id;
	struct per_session_data__apigataway * session_holder;
	bool found;
	Array* players_session_holder;

};

//struct gem_data {
//	gem_types type;
//	int x;
//	int y;
//	bool collide_with_player;
//};

extern int callback_wsapi(struct lws *wsi, enum lws_callback_reasons reason,
void *user, void *in, size_t len);
struct session_holder_data * set_session_holder_data(bool(*cp)(void*, void*, void*),
												struct per_session_data__apigataway *_pss);
//cJSON *build_user_json_registrator(struct per_session_data__apigataway *_pss);
//cJSON *build_gems_json(struct per_session_data__apigataway *_pss);
//cJSON *build_user_json_movment(struct per_session_data__apigataway *_pss);
void send_response_to_current_player(struct per_session_data__apigataway *_pss);
void send_response(cJSON *_root_respose, struct per_session_data__apigataway *_other_p_session,
												struct per_session_data__apigataway *_pss);
bool generate_random_gems();
static connection_num_as_id;
extern Hashmap *users_map_main;
//extern Array *gems_array;

#endif