package main

import (
	"flag"
	"io"
	"log"
	"os"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"

	testpb "github.com/yunomu/exercises/protoview/test"
)

func init() {
	flag.Parse()
	log.SetOutput(os.Stderr)
}

func main() {
	unmarshaler := &jsonpb.Unmarshaler{
		AllowUnknownFields: true,
	}

	var in io.Reader = os.Stdin
	p := &testpb.Person{}
	if err := unmarshaler.Unmarshal(in, p); err != nil {
		log.Fatalln(err)
	}

	var out io.Writer = os.Stdout
	bs, err := proto.Marshal(p)
	if err != nil {
		log.Fatalln(err)
	}

	if _, err := out.Write(bs); err != nil {
		log.Fatalln(err)
	}
}
