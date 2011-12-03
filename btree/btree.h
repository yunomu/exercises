#ifndef __BTREE_H__
#define __BTREE_H__

#define BLOCK_SIZE 256
#define ADDR_NULL 0

#define NODE_SIZE_MIN 2
#define NODE_SIZE_MAX (NODE_SIZE_MIN * 2)

typedef unsigned long addr_t;
typedef int record_t;
typedef record_t key_t;

struct bt_entry {
	record_t record;
	addr_t addr;
};

struct bt_node {
	int size;
	addr_t addr;
	addr_t parent;
	addr_t addr0;
	struct bt_entry entries[0];
};


static __inline__ key_t
r2k(record_t *record)
{
	return *record;
}

struct bt_node *createnode();
void deletenode(struct bt_node *);
void freenode(struct bt_node *);
int compare(key_t, record_t *);
struct bt_node *getnode(addr_t);
void save(struct bt_node *);
int searchnode(addr_t, key_t, record_t **, struct bt_node **);

addr_t createbtree();
record_t *search(addr_t, key_t);
addr_t store(addr_t, record_t *);
void delete(addr_t, key_t);

#endif /* __BTREE_H__ */
