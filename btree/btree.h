#ifndef __BTREE_H__
#define __BTREE_H__

#include "btree_types.h"

typedef struct btree BTREE;

BTREE* createbtree(void);
void deletebtree(BTREE*);
record_t *search(BTREE*, key_t);
int store(BTREE*, record_t *);
int delete(BTREE*, key_t);

#endif /* __BTREE_H__ */
