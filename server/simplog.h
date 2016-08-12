/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/
void log_print(char* filename, int line, char *fmt, ...);
#define LOG_PRINT(...) log_print(__FILE__, __LINE__, __VA_ARGS__ )
