/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include "game_handler.h"
//#include "private-libwebsockets.h"
#include <uv.h>

int debug_level = 7;
struct lws_context *context;
#define MAX_ECHO_PAYLOAD 1024
static uv_timer_t timer_handle;
static int timer_cb_called;
static uv_once_t once = UV_ONCE_INIT;
static int once_cb_called = 0;
static int repeat_close_cb_called = 0;
static int once_close_cb_called = 0;
static int repeat_cb_called = 0;





static struct lws_protocols protocols[] = {	 
	{
		"wsapi",
		callback_wsapi,
		sizeof(struct per_session_data__apigataway),
		MAX_ECHO_PAYLOAD,
	},
	 
	{ NULL, NULL, 0, 0 } /* terminator */
};

void signal_cb(uv_signal_t *watcher, int signum)
{
	lwsl_err("Signal %d caught, exiting...\n", watcher->signum);
	switch (watcher->signum) {
	case SIGTERM:
	case SIGINT:
		break;
	default:
		signal(SIGABRT, SIG_DFL);
		abort();
		break;
	}
	lws_libuv_stop(context);
}


 

int main(int argc, char **argv)
{
	struct lws_context_creation_info info;
	const char *iface = NULL;
	int opts = 0;
 	uv_loop_t* loop = NULL;

	/* tell the library what debug level to emit and to send it to syslog */
	lws_set_log_level(debug_level, lwsl_emit_syslog);
	lwsl_notice("About to start server\n");

	memset(&info, 0, sizeof info);
	info.port = 7681;
	info.iface = NULL;
	info.protocols = protocols;
	info.extensions = NULL;
	info.ssl_cert_filepath = NULL;
	info.ssl_private_key_filepath = NULL;
	info.gid = -1;
	info.uid = -1;
	info.max_http_header_pool = 1;
	info.timeout_secs = 5;
	info.options = opts | LWS_SERVER_OPTION_LIBUV;

	context = lws_create_context(&info);
	if (context == NULL) {
		lwsl_err("libwebsocket init failed\n");
		return -1;
	}

	lws_uv_sigint_cfg(context, 1, signal_cb);
	if (lws_uv_initloop(context,NULL /*loop*/, 0)) {
		lwsl_err("lws_uv_initloop failed\n");

		goto bail;
	}

	lwsl_notice("server started\n");
	lws_libuv_run(context, 0);

bail:
	lws_context_destroy(context);
	lwsl_notice("server exited cleanly\n");


	return 0;
}