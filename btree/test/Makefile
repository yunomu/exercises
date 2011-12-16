TARGET		= test
SRCS		= test.c dump.c
LIBS		= btree
LIBDIR		= ..
OBJS		= ${SRCS:.c=.o}

all: ${TARGET}

${TARGET}: ${OBJS}
	gcc -o ${TARGET} ${OBJS} -L${LIBDIR} -l${LIBS}

.c.o: .depend
	gcc -c $< -I${LIBDIR}

-include .depend

lib:
	cd ${LIBDIR}/ && ${MAKE}

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -M ${SRCS} -I${LIBDIR} >> .depend

