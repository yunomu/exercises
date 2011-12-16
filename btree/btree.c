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

BTREE*
createbtree()
{
	BTREE *ret;
	ret = (BTREE*) malloc(sizeof (BTREE));
	ret->root = (addr_t) createnode();
	return ret;
}

void
deletebtree(
	BTREE* btree
)
{
	struct bt_node *node = getnode(btree->root);

	if (node->addr0 != ADDR_NULL) {
		int i;
		for (i = 0; i < node->size; i++) {
			free((void *) node->entries[i].addr);
		}
	}

	free(node);
	free(btree);
}

/* XXX */
void
searchnode(
	addr_t btree,
	key_t key,
	struct bt_entry **entry, /* output */
	struct bt_node **node /* output */
)
{
	int i;
	addr_t addr;
	struct bt_node *n = getnode(btree);
	struct bt_entry *entries = n->entries;

	for (i = 0; i < n->size; i++) {
		struct bt_entry *e = &(entries[i]);
		int cmp = compare(key, &(e->record));

		if (cmp == 0) {
			*entry = e;
			*node = n;
			return;
		}

		if (cmp > 0) break;
	}

	if (i == 0) {
		addr = n->addr0;
	} else {
		addr = entries[i - 1].addr;
	}

	if (addr == ADDR_NULL) {
		*entry = (struct bt_entry *) 0;
		*node = n;
		return;
	}

	freenode(n);

	searchnode(addr, key, entry, node);
	return;
}

record_t *
search(
	BTREE* btree,
	key_t key
)
{
	struct bt_entry *entry;
	struct bt_node *node;
	record_t *ret;

	searchnode(btree->root, key, &entry, &node);
	if (entry) {
		ret = (record_t *) malloc(sizeof (record_t));
		*ret = entry->record; /* memcopy */
	} else {
		ret = (record_t *) 0;
	}

	freenode(node);
	return ret;
}

