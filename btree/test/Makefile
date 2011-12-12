TARGET		= test
SRCS		= test.c
LIBS		= btree
LIBDIR		= ..
OBJS		= ${SRCS:.c=.o}

all: ${TARGET}

${TARGET}: ${OBJS}
	gcc -o ${TARGET} ${OBJS} -L.. -l${LIBS}

.c.o: .depend
	gcc -c $<

-include .depend

lib:
	cd ${LIBDIR}/ && ${MAKE}

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

