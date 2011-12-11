TARGET	= test
SRCS	= test.c
LIBS	= ../libbtree.o
OBJS	= ${SRCS:.c=.o} ${LIBS}

all: ${TARGET}

${TARGET}: ${OBJS}
	gcc -o ${TARGET} ${OBJS}

.c.o: .depend
	gcc -c $<

-include .depend

${LIBS}:
	cd ../ && ${MAKE}

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

