TARGET	= btree
SRCS	= main.c btree.c store.c delete.c
OBJS	= ${SRCS:.c=.o}

all: ${TARGET}

${TARGET}: ${OBJS}
	gcc -o ${TARGET} ${OBJS}

.c.o: .depend
	gcc -c $<

-include .depend

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

