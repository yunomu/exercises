#include "btree_in.h"
#include "btree.h"

enum dir {
	DIR_NONE = 0,
	DIR_LEFT,
	DIR_RIGHT,
	DIR_LEFT_COMB,
	DIR_RIGHT_COMB
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
	struct bt_entry *entry,
	addr_t left_addr
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

	if (i == 0) {
		node->addr0 = left_addr;
	} else {
		entries[i - 1].addr = left_addr;
	}

	for (i = i; i < size - 1; i++) {
		entries[i] = entries[i + 1];
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
		if (pentries[i].addr == node_addr) {
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

	if ((i + 1) >= parent->size) {
		*neighbour = tmp;
		return DIR_LEFT_COMB;
	}
	freenode(tmp);

	*pentry = pentries + i + 1;

right:
	tmp = getnode((*pentry)->addr);
	if ((node->size + tmp->size) >= NODE_SIZE_MAX) {
		*neighbour = tmp;
		return DIR_RIGHT;
	}

	*neighbour = tmp;
	return DIR_RIGHT_COMB;
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
	addr_t left_addr;

	tmp = *pentry;
	if (dir == DIR_LEFT) {
		mov = &(neighbour->entries[neighbour->size - 1]);
		tmp.addr = node->addr0;
		left_addr = mov->addr;
	} else if (dir == DIR_RIGHT) {
		mov = &(neighbour->entries[0]);
		tmp.addr = neighbour->addr0;
		left_addr = ADDR_NULL;
	} else {
		/* not reached */
		return;
	}

	pentry->record = mov->record;
	deleteentry(neighbour, mov, ADDR_NULL);
	storeentry(node, &tmp, left_addr);
}

static addr_t
combine(
	struct bt_node *node,
	struct bt_node *parent,
	enum dir dir,
	struct bt_node *neighbour,
	struct bt_entry *pentry
)
{
	struct bt_entry *entries, tmp;
	int i;
	addr_t left_addr, ret;

	tmp = *pentry;

	if (dir == DIR_LEFT_COMB) {
		left_addr = ADDR_NULL;
		ret = neighbour->addr;
		tmp.addr = node->addr0;
	} else if (dir == DIR_RIGHT_COMB) {
		left_addr = node->addr0;
		ret = pentry->addr;
		tmp.addr = neighbour->addr0;
	} else {
		/* not reached */
		return;
	}

	entries = node->entries;
	for (i = 0; i < node->size; i++) {
		storeentry(neighbour, &(entries[i]), ADDR_NULL);
	}
	storeentry(neighbour, &tmp, left_addr);

	return ret;
}

int
delete(
	BTREE* btree,
	key_t key
)
{
	struct bt_entry *entry;
	struct bt_node *node;
	addr_t left_addr;

	searchnode(btree->root, key, &entry, &node);
	if (!entry) {
		freenode(node);
		return -1;
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

	left_addr = ADDR_NULL;
	while (1) {
		struct bt_node *parent, *nnode;
		struct bt_entry *pentry;
		enum dir dir;

		deleteentry(node, entry, left_addr);
		if (node->size >= NODE_SIZE_MIN) {
			save(node);
			freenode(node);
			return 0;
		}
		if (node->parent == ADDR_NULL) {
			addr_t root;
			if (node->size == 0) {
				root = node->addr0;
				deletenode(node);
				node = getnode(root);
				node->parent = ADDR_NULL;
			} else {
				root = btree->root;
			}
			save(node);
			freenode(node);
			btree->root = root;
			return 0;
		}

		parent = getnode(node->parent);
		dir = getneighbournode(node, parent, &nnode, &pentry);
		if (dir == DIR_NONE) {
			/* error */
			freenode(node);
			freenode(nnode);
			freenode(parent);
			return -1;
		}
		if ((dir != DIR_LEFT_COMB) && (dir != DIR_RIGHT_COMB)) {
			underflow(node, parent, dir, nnode, pentry);
			save(node); freenode(node);
			save(nnode); freenode(nnode);
			save(parent); freenode(parent);
			return 0;
		}

		left_addr = combine(node, parent, dir, nnode, pentry);
		deletenode(node);
		freenode(nnode);
		node = parent;
		entry = pentry;
	}
}
