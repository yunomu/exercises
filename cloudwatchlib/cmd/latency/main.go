package main

import (
	"flag"
	"log"
	"os"
)

func init() {
	flag.Parse()
	log.SetOutput(os.Stderr)
}

func main() {
	log.Println("start")
}
