#include <stdio.h>
#include <stdlib.h>

#include "../btree.h"

void
dump(
	addr_t btree,
	int d
)
{
	struct bt_node *node = (struct bt_node *) btree;
	int i;

	printf("%d: ", d);
	for (i = 0; i < node->size; i++) {
		printf("%d ", node->entries[i].record);
	}
	printf("\n");

	if (node->addr0 == ADDR_NULL) return;

	dump(node->addr0, d+1);
	for (i = 0; i < node->size; i++) {
		dump(node->entries[i].addr, d+1);
	}
}

addr_t root;

void
s(key_t key)
{
	record_t *record = search(root, key);
	if (record) {
		printf("search: %d -> %d\n", key, *record);
	} else {
		printf("search: %d -> notfound\n", key);
	}
	free(record);
}

int
main(int argc, char *argv[])
{
	int i;

	if (argc == 1) {
		printf("Usage: %s int [int...]\n", argv[0]);
		return -1;
	}

	root = createbtree();

	for (i = 1; i < argc; i++) {
		record_t record = atoi(argv[i]);
		root = store(root, &record);
	}

	dump(root, 0);

	s(72);
	s(50);
	s(80);

	delete(root, 85);
	dump(root, 0);

	deletenode((struct bt_node *) root);

	return 0;
}

