#include <stdlib.h>

#include "btree.h"


/*
 * dk and mem alloc
 */
struct bt_node *
createnode()
{
	struct bt_node *ret;
	ret = (struct bt_node *) malloc(BLOCK_SIZE);
	ret->size = 0;
	ret->addr = (addr_t) ret;
	ret->parent = ADDR_NULL;
	ret->addr0 = ADDR_NULL;
	return ret;
}

/*
 * dk and mem free
 */
void
deletenode(
	struct bt_node *node
)
{
	if (node->addr0 != ADDR_NULL) {
		int i;
		for (i = 0; i < node->size; i++) {
			free((void *) node->entries[i].addr);
		}
	}

	free(node);
}

/*
 * dk read and mem alloc
 */
struct bt_node *
getnode(
	addr_t addr
)
{
	return (struct bt_node *) addr;
}

/*
 * dk write
 */
void
save(
	struct bt_node *node
)
{
	/* nop */
}

/*
 * mem free
 */
void
freenode(
	struct bt_node *node
)
{
	/* nop */
}

int
compare(
	key_t key,
	record_t *record
)
{
	return r2k(record) - key;
}

addr_t
createbtree()
{
	return (addr_t) createnode();
}

int
searchnode(
	addr_t btree,
	key_t key,
	record_t **record, /* output */
	struct bt_node **node /* output */
)
{
	struct bt_node *n = getnode(btree);
	int i, size;
	addr_t addr;
	struct bt_entry *entries;
	
	entries = n->entries;
	size = n->size;
	for (i = 0; i < size; i++) {
		record_t *r = &(entries[i].record);
		int cmp = compare(key, r);

		if (cmp == 0) {
			*record = r;
			*node = n;
			return 0;
		}

		if (cmp > 0) break;
	}

	if (i == 0) {
		addr = n->addr0;
	} else {
		addr = entries[i - 1].addr;
	}

	if (addr == ADDR_NULL) {
		*record = (record_t *) 0;
		*node = (struct bt_node *) 0;
		return -1;
	}

	freenode(n);
	return searchnode(addr, key, record, node);
}

record_t *
search(
	addr_t btree,
	key_t key
)
{
	record_t *record;
	struct bt_node *node;
	int result;

	result = searchnode(btree, key, &record, &node);
	if (result) return (record_t *) 0;

	return record;
}

