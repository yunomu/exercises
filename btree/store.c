#include "btree.h"

void
storeentry(
	struct bt_node *node,
	struct bt_entry *entry,
	addr_t left_addr
)
{
	int i;
	key_t key = r2k(&(entry->record));
	struct bt_entry tmp1 = *entry;
	struct bt_entry *entries = node->entries;

	for (i = 0; i < node->size; i++) {
		record_t *r = &(entries[i].record);
		if (compare(key, r) > 0) break;
	}

	if (left_addr != ADDR_NULL) {
		if (i == 0) {
			node->addr0 = left_addr;
		} else {
			entries[i - 1].addr = left_addr;
		}
	}

	node->size += 1;

	for (; i < node->size; i++) {
		struct bt_entry tmp2 = entries[i];
		entries[i] = tmp1;
		tmp1 = tmp2;
	}

	save(node);
}

static void
updatechild(
	struct bt_node *parent,
	addr_t childaddr
)
{
	struct bt_node *child;

	child = getnode(childaddr);
	child->parent = parent->addr;
	save(child);
	freenode(child);
}

static void
splitnode(
	struct bt_node *node,
	struct bt_entry *new_entry, /* input and output */
	struct bt_node **left, /* output */
	struct bt_node **right /* output */
)
{
	int size = node->size + 1;
	int i, j, m, n;
	struct bt_entry *tmp[size], mid_entry, *entries = node->entries;
	struct bt_node *lnode, *rnode;

	for (i = 0; i < node->size; i++) {
		struct bt_entry *e = &(entries[i]);

		if (compare(r2k(&(new_entry->record)), &(e->record)) > 0) break;
		tmp[i] = e;
	}
	tmp[i] = new_entry;
	n = j = i;
	for (i = i + 1; i < size; i++) {
		tmp[i] = &(entries[j]);
		j++;
	}

	lnode = node;
	rnode = createnode();

	lnode->parent = rnode->parent = node->parent;
	m = size / 2;
	mid_entry = *(tmp[m]);
	rnode->addr0 = mid_entry.addr;

	j = m + 1;
	for (i = 0; i < m; i++, j++) {
		rnode->entries[i] = *(tmp[j]);
	}
	rnode->size = m;
	if (n < m) {
		lnode->size = m - 1;
		storeentry(lnode, new_entry, ADDR_NULL);
	} else {
		lnode->size = m;
	}

	if (rnode->addr0 != ADDR_NULL) {
		updatechild(rnode, rnode->addr0);
		for (i = 0; i < rnode->size; i++) {
			updatechild(rnode, rnode->entries[i].addr);
		}
	}

	new_entry->record = mid_entry.record;
	new_entry->addr = rnode->addr;

	*left = lnode;
	*right = rnode;
}

int
store(
	BTREE* btree,
	record_t *record
)
{
	key_t key = r2k(record);
	struct bt_node *node;
	struct bt_entry new_entry;
	addr_t root = btree->root, left_addr;

	{
		struct bt_entry *result;
		searchnode(root, key, &result, &node);
		if (result) return -1; /* error */
	}

	new_entry.record = *record;
	new_entry.addr = ADDR_NULL;

	root = btree->root;
	left_addr = ADDR_NULL;
	while (1) {
		struct bt_node *left, *right;

		if (node->size < NODE_SIZE_MAX) {
			storeentry(node, &new_entry, left_addr);
			btree->root = root;
			return 0;
		}

		splitnode(node, &new_entry, &left, &right);

		left_addr = left->addr;
		if (node->parent != ADDR_NULL) {
			node = getnode(node->parent);
		} else {
			node = createnode();
			left->parent = right->parent = node->addr;
			root = node->addr;
		}

		save(left);
		save(right);
		freenode(left);
		freenode(right);
	}
}

