#include <stdio.h>

#include <btree_in.h>
#include <btree.h>

static void
dump_in(
	addr_t addr,
	int d
)
{
	struct bt_node *node = (struct bt_node *) addr;
	int i;

	printf("%d: ", d);
	for (i = 0; i < node->size; i++) {
		printf("%d ", node->entries[i].record);
	}
	printf("\n");

	if (node->addr0 == ADDR_NULL) return;

	dump_in(node->addr0, d+1);
	for (i = 0; i < node->size; i++) {
		dump_in(node->entries[i].addr, d+1);
	}
}

void
dump(BTREE* btree)
{
	dump_in(btree->root, 0);
}
