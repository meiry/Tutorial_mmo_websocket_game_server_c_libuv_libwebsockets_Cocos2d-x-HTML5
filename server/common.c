/*******************************************************
Copyright (C) 2016 meiry242@gmail.com
This file is part of http://www.gamedevcraft.com .
Author : Meir yanovich
********************************************************/

#include "common.h"
char* generateId(void)
{
	srand(clock());
	char *GUID = (char *)malloc(USER_ID_LEN * sizeof(char));
	//char GUID[USER_ID_LEN];
	int t = 0;
	char *szTemp = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	char *szHex = "0123456789ABCDEF-";
	int nLen = strlen(szTemp);
	for (t = 0; t<nLen + 1; t++)
	{
		int r = rand() % 16;
		char c = ' ';
		switch (szTemp[t])
		{
		case 'x': { c = szHex[r]; } break;
		case 'y': { c = szHex[r & 0x03 | 0x08]; } break;
		case '-': { c = '-'; } break;
		case '4': { c = '4'; } break;
		}
		GUID[t] = (t < nLen) ? c : 0x00;
	}
	return GUID;
}