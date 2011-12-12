TARGET	= libbtree.so
SRCS	= btree.c store.c delete.c
OBJS	= ${SRCS:.c=.o}
TESTDIR = test
TEST	= ${TESTDIR}/test

all: ${TARGET}

${TARGET}: ${OBJS}
	gcc -o ${TARGET} -shared ${OBJS}

.c.o: .depend
	gcc -c $<

-include .depend

.PHONY: test clean

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

test: ${TARGET} ${TEST}
	./${TEST}

test-clean:
	cd ${TESTDIR} && ${MAKE} clean

${TEST}:
	cd ${TESTDIR} && ${MAKE}

