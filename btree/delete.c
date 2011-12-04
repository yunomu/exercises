#include "btree.h"

static void
nextentry(
	addr_t childaddr,
	struct bt_entry **entry, /* output */
	struct bt_node **node /* output */
)
{
	struct bt_node *n;
	addr_t addr = childaddr;

	while (1) {
		n = getnode(addr);
		if (n->addr0 == ADDR_NULL) {
			*entry = &(n->entries[0]);
			*node = n;
			return;
		}
		addr = n->addr0;
		freenode(n);
	}
}

void
delete(
	addr_t btree,
	key_t key
)
{
	struct bt_entry *entry;
	struct bt_node *node;

	searchnode(btree, key, &entry, &node);
	if (!entry) {
		freenode(node);
		return;
	}

	if (node->addr0 != ADDR_NULL) {
		struct bt_entry *nentry;
		struct bt_node *nnode;

		nextentry(node->addr0, &nentry, &nnode);
		entry->record = nentry->record; /* replace */

		save(node);
		freenode(node);

		node = nnode;
		entry = nentry;
	}

	freenode(node); /* stub */
}
