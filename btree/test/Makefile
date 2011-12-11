TARGET		= test
SRCS		= test.c
LIBS		= btree
LIBDIR		= ..
LIBFILES	= ${addsuffix .so,${addprefix ${LIBDIR}/lib,${SLIBS}}}
OBJS		= ${SRCS:.c=.o}

all: ${TARGET}

${TARGET}: ${OBJS} ${LIBFILES}
	gcc -o ${TARGET} ${OBJS} -L.. -l${LIBS}

.c.o: .depend
	gcc -c $<

-include .depend

${LIBFILES}:
	cd ../ && ${MAKE}

clean:
	rm -f ${TARGET} ${OBJS}

depend:
	rm -f .depend
	gcc -MM ${SRCS} >> .depend

