/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#ifndef _COMMON_H
#define _COMMON_H

#ifdef _WIN32
#include "sys/stat.h"
#include <io.h>
#include "gettimeofday.h"
#define inline _inline 
#define strncasecmp(x,y,z) _strnicmp(x,y,z)
#define snprintf _snprintf
#define S_IRUSR _S_IWRITE
#else
#include <syslog.h>
#include <sys/time.h>
#include <unistd.h>
#endif
/* Have our own assert, so we are sure it does not get optimized away in
* a release build.
*/
#define ASSERT(expr)                                      \
 do {                                                     \
  if (!(expr)) {                                          \
    fprintf(stderr,                                       \
            "Assertion failed in %s on line %d: %s\n",    \
            __FILE__,                                     \
            __LINE__,                                     \
            #expr);                                       \
    abort();                                              \
  	    }                                                 \
     } while (0)


#endif


#include "hashmap.h"
#include "list.h"
#include "array.h"
#include <time.h>
#include <string.h>

#define USER_ID_LEN 40
char* generateId(void);