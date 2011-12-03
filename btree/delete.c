#include "btree.h"

static record_t *
nextrecord(
	struct bt_node *node
)
{
	
}

void
delete(
	addr_t btree,
	key_t key
)
{
	record_t *record;
	struct bt_node *node;
	int result;

	result = searchnode(btree, key, &record, &node);
	if (result) return;

	if (node->addr0 != ADDR_NULL) {
		record_t *next;
	}
}
