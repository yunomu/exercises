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
		79,
	};
	as(a, 21);
	dump(root, 0);

	s(72);
	s(50);
	s(80);
}

static void
d(key_t key)
{
	printf("delete: %d\n", key);
	delete(root, key);
}

void
test11()
{
	d(50);
	d(68);
	d(85);
	dump(root, 0);
}

void
test2()
{
	int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17};
	as(a, 17);
	dump(root, 0);
}

void
test3()
{
	int a[] = {17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
	as(a, 17);
	dump(root, 0);
}

int
main(int argc, char *argv[])
{
	printf("--- test2()\n");
	root = createbtree();
	test2();
	deletebtree(root);

	printf("--- test3()\n");
	root = createbtree();
	test3();
	deletebtree(root);

	printf("--- test1()\n");
	root = createbtree();
	test1();
	test11();
	deletebtree(root);

	return 0;
}

