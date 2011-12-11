#include "btree.h"

enum dir {
	DIR_NONE = 0,
	DIR_LEFT,
	DIR_RIGHT
};

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

static enum dir
getneighbournode(
	struct bt_node *node,
	struct bt_node *parent,
	struct bt_node **neighbour, /* output */
	struct bt_entry **pentry /* output */
)
{
	addr_t node_addr = node->addr;
	int i;
	struct bt_entry *pentries;
	struct bt_node *tmp;

	pentries = parent->entries;

	if (node_addr == parent->addr0) {
		*pentry = pentries;
		i = 0;
		goto right;
	}

	for (i = 0; i < parent->size; i++) {
		if (pentries->addr == node_addr) {
			*pentry = pentries + i;
			break;
		}
	}
	/*
	if (i >= parent->size) {
		return DIR_NONE;
	}
	*/

left:
	if (i == 0) {
		tmp = getnode(parent->addr0);
	} else {
		tmp = getnode(pentries[i - 1].addr);
	}
	if ((node->size + tmp->size) >= NODE_SIZE_MAX) {
		*neighbour = tmp;
		return DIR_LEFT;
	}
	freenode(tmp);

right:
	tmp = getnode(pentries[i].addr);
	if ((node->size + tmp->size) >= NODE_SIZE_MAX) {
		*neighbour = tmp;
		return DIR_RIGHT;
	}
	freenode(tmp);

	return DIR_NONE;
}

static void
underflow(
	struct bt_node *node,
	struct bt_node *parent,
	enum dir dir,
	struct bt_node *neighbour,
	struct bt_entry *pentry
)
{
	struct bt_entry tmp, *mov;

	tmp = *pentry;
	if (dir == DIR_LEFT) {
		mov = &(neighbour->entries[neighbour->size - 1]);
	} else if (dir == DIR_RIGHT) {
		mov = &(neighbour->entries[0]);
	} else {
		/* not reached */
		return;
	}

	pentry->record = mov->record;
	deleteentry(neighbour, mov);
	storeentry(node, &tmp, ADDR_NULL);
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
		struct bt_node *parent, *nnode;
		struct bt_entry *pentry;
		enum dir dir;

		deleteentry(node, entry);
		if ((node->size >= NODE_SIZE_MIN) || (node->parent == ADDR_NULL)) {
			save(node);
			freenode(node);
			return;
		}

		parent = getnode(node->parent);
		dir = getneighbournode(node, parent, &nnode, &pentry);
		if (dir != DIR_NONE) {
			underflow(node, parent, dir, nnode, pentry);
			save(node); freenode(node);
			save(nnode); freenode(nnode);
			save(parent); freenode(parent);
			return;
		}

		/* combine phase */
		return;
	}
}
