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

void
as(int a[], int size)
{
	int i;
	for (i = 0; i < size; i++) {
		root = store(root, &(a[i]));
	}
}


void
test1()
{
	int a[] = {
		60,
		10,
		29,
		92,
		3,
		8,
		14,
		25,
		85,
		32,
		72,
		36,
		40,
		50,
		90,
		63,
		68,
		77,
		80,
		96,
	};
	as(a, 20);
	dump(root, 0);

	s(72);
	s(50);
	s(80);
}

void
test11()
{
	delete(root, 50);
	delete(root, 68);
	delete(root, 85);
	dump(root, 0);
}

int
main(int argc, char *argv[])
{
	root = createbtree();
	test1();
	test11();
	deletebtree(root);

	return 0;
}

