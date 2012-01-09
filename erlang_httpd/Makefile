MODULES		= httpd counter

.SUFFIXES: .erl .beam

.erl.beam:
	erlc -W $<

all:	${MODULES:%=%.beam}

clean:
	rm -f *.beam

