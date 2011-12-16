#include <stdio.h>

#include <btree.h>

BTREE* btree;

void
s(key_t key)
{
	record_t *record = search(btree, key);
	if (record) {
		printf("search: %d -> %d\n", key, *record);
	} else {
		printf("search: %d -> notfound\n", key);
	}
}

void
as(int a[], int size)
{
	int i;
	for (i = 0; i < size; i++) {
		store(btree, &(a[i]));
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
		78,
		5,
		34,
	};
	as(a, 24);
	dump(btree);

	s(72);
	s(50);
	s(80);
}

static void
d(key_t key)
{
	printf("delete: %d\n", key);
	delete(btree, key);
}

void
test11()
{
	printf("--- test11\n");
	d(50);
	d(68);
	dump(btree);
}

void
test12()
{
	printf("--- test12\n");
	d(85);
	dump(btree);
}

void
test13()
{
	printf("--- test131\n");
	d(92);
	dump(btree);
	printf("--- test132\n");
	d(60);
	dump(btree);
	printf("--- test133\n");
	d(25);
	dump(btree);
	printf("--- test134\n");
	d(10);
	dump(btree);
}

void
test14()
{
	printf("--- test14\n");
	d(63);
	dump(btree);
}

void
test2()
{
	int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17};
	as(a, 17);
	dump(btree);
}

void
test3()
{
	int a[] = {17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
	as(a, 17);
	dump(btree);
}

int
main(int argc, char *argv[])
{
	printf("--- test2()\n");
	btree = createbtree();
	test2();
	deletebtree(btree);

	printf("--- test3()\n");
	btree = createbtree();
	test3();
	deletebtree(btree);

	printf("--- test1()\n");
	btree = createbtree();
	test1();
	test11();
	test12();
	test13();
	test14();
	deletebtree(btree);

	return 0;
}

