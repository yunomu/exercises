package main

import (
	"flag"
	"log"
	"os"
	"syscall"
	"time"
)

func init() {
	flag.Parse()
	log.SetOutput(os.Stderr)
}

func main() {
	fd, err := syscall.Open("test", syscall.O_CREAT|syscall.O_RDONLY, 0644)
	if err != nil {
		log.Fatalf("os.Open: %v", err)
	}
	defer os.Remove("test")
	defer syscall.Close(fd)

	syscall.Flock(fd, syscall.LOCK_EX)

	time.Sleep(5 * time.Second)
}
