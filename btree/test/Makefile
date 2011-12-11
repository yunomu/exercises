TARGET	= test
SRCS	= test.c
SLIBS	= libbtree.o
LIBDIR	= ..
LIBS	= ${addprefix ${LIBDIR}/,${SLIBS}}
OBJS	= ${SRCS:.c=.o}

all: ${TARGET}

${TARGET}: ${OBJS} ${LIBS}
	gcc -o ${TARGET} ${OBJS} ${LIBS}

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

