#include <stdio.h>

#include "btree.h"

void
dump(
	addr_t btree
)
{
	struct bt_node *node = (struct bt_node *) btree;
	int i;

	for (i = 0; i < node->size; i++) {
		printf("%d ", node->entries[i].record);
	}
	printf("\n");

	if (node->addr0 == ADDR_NULL) return;

	dump(node->addr0);
	for (i = 0; i < node->size; i++) {
		dump(node->entries[i].addr);
	}
}

addr_t root;

void
s(record_t record)
{
	root = store(root, &record);
}

int
main()
{
	key_t key;

	root = createbtree();

	s(1);
	s(3);
	s(5);
	s(9);
	s(2);
	s(7);
	s(11);
	s(8);

	dump(root);

	key = 5;
	printf("search: %d -> %d\n", key, *(search(root, key)));
	key = 3;
	printf("search: %d -> %d\n", key, *(search(root, key)));
	key = 9;
	printf("search: %d -> %d\n", key, *(search(root, key)));

	deletenode((struct bt_node *) root);

	return 0;
}

