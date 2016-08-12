/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include <stdio.h>
#include <stdarg.h>
#include <time.h>
#include <string.h>
#include <stdlib.h>
#include "simplog.h"
#include "common.h"
#define LOGFILE "libuv_libwebsocket_cocos2dx_server.txt" 
FILE *fp;
static int SESSION_TRACKER; //Keeps track of session

char* print_time()
{
	int size = 0;
	time_t t;
	char *buf;

	t = time(NULL); /* get current calendar time */

	char *timestr = asctime(localtime(&t));
	timestr[strlen(timestr) - 1] = 0;  //Getting rid of \n

	size = strlen(timestr) + 1 + 2; //Additional +2 for square braces
	buf = (char*)malloc(size);

	memset(buf, 0x0, size);
	snprintf(buf, size, "[%s]", timestr);

	return buf;
}
void log_print(char* filename, int line, char *fmt, ...)
{
	va_list         list;
	char            *p, *r;
	int             e;

	if (SESSION_TRACKER > 0)
		fp = fopen(LOGFILE, "a+");
	else
		fp = fopen(LOGFILE, "w");

	fprintf(fp, "%s ", print_time());
	fprintf(fp, "[%s][line: %d] ", filename, line);
	va_start(list, fmt);

	for (p = fmt; *p; ++p)
	{
		if (*p != '%')//If simple string
		{
			fputc(*p, fp);
		}
		else
		{
			switch (*++p)
			{
				/* string */
			case 's':
			{
				r = va_arg(list, char *);

				fprintf(fp, "%s", r);
				continue;
			}

			/* integer */
			case 'd':
			{
				e = va_arg(list, int);

				fprintf(fp, "%d", e);
				continue;
			}

			default:
				fputc(*p, fp);
			}
		}
	}
	va_end(list);
	fputc('\n', fp);
	SESSION_TRACKER++;
	fclose(fp);
}