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
	cd ${TESTDIR} && ${MAKE} clean

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

test: ${TARGET} ${TEST}
	./${TEST}

${TEST}:
	cd ${TESTDIR} && ${MAKE}

