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

static void
deleteentry(
	struct bt_node *node,
	struct bt_entry *entry
)
{
	struct bt_entry *entries, tmp;
	int i, size;

	entries = node->entries;
	size = node->size;
	for (i = 0; i < size; i++) {
		if (entry == &(entries[i])) {
			break;
		}
	}
	for (i = i + 1; i < size; i++) {
		entries[i - 1] = entries[i];
	}
	node->size = size - 1;
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

		nextentry(entry->addr, &nentry, &nnode);
		entry->record = nentry->record; /* replace */

		save(node);
		freenode(node);

		node = nnode;
		entry = nentry;
	}

	while (1) {
		deleteentry(node, entry);
		if ((node->size >= NODE_SIZE_MIN) || (node->parent == ADDR_NULL)) {
			return;
		}

	}
}
