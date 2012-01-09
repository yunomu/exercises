MODULES		= httpd counter request_parser

.SUFFIXES: .erl .beam

.erl.beam:
	erlc -W $<

all:	${MODULES:%=%.beam}

clean:
	rm -f *.beam

