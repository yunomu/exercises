#include "btree.h"

static struct bt_node *
searchstorednode(
	struct bt_node *node,
	key_t key
)
{
	int i;
	struct bt_entry *entries;

	if (node->addr0 == ADDR_NULL) {
		return node;
	}

	entries = node->entries;
	for (i = 0; i < node->size; i++) {
		record_t *r = &(entries[i].record);
		if (compare(key, r) > 0) break;
	}

	if (i == 0) {
		node = (struct bt_node *) node->addr0;
	} else {
		node = (struct bt_node *) entries[i - 1].addr;
	}
	return searchstorednode(node, key);
}

static void
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

	if (i == 0) {
		node->addr0 = left_addr;
	} else {
		entries[i - 1].addr = left_addr;
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
splitnode(
	struct bt_node *node,
	struct bt_entry *new_entry, /* input/output */
	struct bt_node **left, /* output */
	struct bt_node **right /* output */
)
{
	int size = node->size + 1;
	int i, j, m;
	struct bt_entry *tmp[size], mid_entry, *entries = node->entries;

	for (i = 0; i < size; i++) {
		struct bt_entry *e = &(entries[i]);

		if (compare(r2k(&(new_entry->record)), &(e->record)) > 0) break;
		tmp[i] = e;
	}
	tmp[i] = new_entry;
	j = i;
	for (i = i + 1; i < size; i++) {
		tmp[i] = &(entries[j]);
		j++;
	}

	*left = node;
	*right = createnode();
	(*right)->parent = node->parent;
	m = size / 2;
	mid_entry = *(tmp[m]);
	(*right)->addr0 = mid_entry.addr;

	for (i = 0; i < m; i++) {
		(*left)->entries[i] = *(tmp[i]);
	}
	j = i + 1;
	for (i = 0; i < m; i++) {
		(*right)->entries[i] = *(tmp[j]);
		j++;
	}
	(*left)->size = (*right)->size = m;

	save(*left);
	save(*right);

	new_entry->record = mid_entry.record;
	new_entry->addr = (*right)->addr;
}

addr_t
store(
	addr_t btree,
	record_t *record
)
{
	key_t key = r2k(record);
	struct bt_node *n, *root = getnode(btree);
	struct bt_entry new_entry;
	addr_t left_addr = ADDR_NULL;

	n = searchstorednode(root, key);

	new_entry.record = *record;
	new_entry.addr = ADDR_NULL;

	while (1) {
		struct bt_node *left, *right, *tmp;

		if (n->size < NODE_SIZE_MAX) {
			storeentry(n, &new_entry, left_addr);
			return (addr_t) root;
		}

		splitnode(n, &new_entry, &left, &right);

		left_addr = n->addr;
		tmp = n;
		if (n->parent != ADDR_NULL) {
			n = getnode(n->parent);
		} else {
			n = createnode();
			left->parent = right->parent = n->addr;
			root = n;
		}
		freenode(tmp);
	}
}

