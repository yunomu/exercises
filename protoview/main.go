package main

import (
	"bufio"
	"bytes"
	"container/list"
	"encoding/binary"
	"errors"
	"flag"
	"io"
	"log"
	"math/bits"
	"os"
)

var (
	inFile = flag.String("in", "-", "Input File")
)

func init() {
	flag.Parse()
	log.SetOutput(os.Stderr)
}

var (
	ErrUnknownWireType    = errors.New("unknown wire type")
	ErrDeprecatedWireType = errors.New("deprecated wire type")
)

type Parser struct {
	r *bufio.Reader
}

func NewParser(r io.Reader) *Parser {
	return &Parser{
		r: bufio.NewReader(r),
	}
}

type Field struct {
	Tag   int
	Value interface{}
}

func (p *Parser) varint(tag int) (*Field, error) {
	l := list.New()
	for {
		b, err := p.r.ReadByte()
		if err != nil {
			return nil, err
		}

		l.PushFront(b & 0x7f)

		if bits.LeadingZeros8(b) != 0 {
			break
		}
	}

	var v int64
	for e := l.Front(); e != nil; e = e.Next() {
		v = v<<7 + int64(e.Value.(byte))
	}

	return &Field{Tag: tag, Value: v}, nil
}

func (p *Parser) lengthDelimited(tag int) (*Field, error) {
	l, err := p.varint(0)
	if err != nil {
		return nil, err
	}

	buf := make([]byte, l.Value.(int64))
	if _, err := io.ReadFull(p.r, buf); err != nil {
		return nil, err
	}

	return &Field{Tag: tag, Value: buf}, nil
}

func (p *Parser) bit64(tag int) (*Field, error) {
	buf := make([]byte, 8)
	if _, err := io.ReadFull(p.r, buf); err != nil {
		return nil, err
	}

	return &Field{Tag: tag, Value: binary.LittleEndian.Uint64(buf)}, nil
}

func (p *Parser) bit32(tag int) (*Field, error) {
	buf := make([]byte, 4)
	if _, err := io.ReadFull(p.r, buf); err != nil {
		return nil, err
	}

	return &Field{Tag: tag, Value: binary.LittleEndian.Uint32(buf)}, nil
}

func (p *Parser) Parse() error {
	for {
		b, err := p.r.ReadByte()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return err
		}

		wireType := b & 0x3
		field := int(b >> 3)

		switch wireType {
		case 0:
			v, err := p.varint(field)
			if err != nil {
				return err
			}

			log.Println("varint:", v)
		case 1:
			v, err := p.bit64(field)
			if err != nil {
				return err
			}

			log.Println("64-bit:", v)
		case 2:
			v, err := p.lengthDelimited(field)
			if err != nil {
				return err
			}

			bs := v.Value.([]byte)
			log.Println("length-delimited(string|packed repeated):", bs, string(bs))
			p1 := NewParser(bytes.NewReader(bs))
			if err := p1.Parse(); err != nil {
				log.Println("parse", err)
			}
		case 3:
			// start group (deprecated)
			return ErrDeprecatedWireType
		case 4:
			// end group (deprecated)
			return ErrDeprecatedWireType
		case 5:
			v, err := p.bit32(field)
			if err != nil {
				return err
			}

			log.Println("32-bit:", v)
		default:
			log.Println("Unknown", "wire_type:", wireType, "field:", field)
			return ErrUnknownWireType
		}
	}
}

func main() {
	var in io.Reader = os.Stdin
	if *inFile != "-" {
		f, err := os.Open(*inFile)
		if err != nil {
			log.Fatalln(err)
		}
		defer f.Close()
		in = f
	}

	p := NewParser(in)

	err := p.Parse()
	if err != nil {
		log.Fatalln(err)
	}
}
