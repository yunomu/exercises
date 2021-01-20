package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"yunomu.net/httpd/lib/requestloghandler"
)

var (
	listen = flag.String("listen", "localhost", "bind")
	port   = flag.Int("port", 8080, "Port number")
	root   = flag.String("root", ".", "root")
	def    = flag.String("default", "", "default document")
)

func init() {
	flag.Parse()

	log.SetOutput(os.Stderr)
}

var suffixRule map[string]string

func init() {
	suffixRule = make(map[string]string)
	suffixRule[".html"] = "text/html"
	suffixRule[".wasm"] = "application/wasm"
}

type handler struct {
	root       string
	defaultDoc string
}

func (h *handler) directory(w http.ResponseWriter, path string) {
	files, err := ioutil.ReadDir(path)
	if err != nil {
		log.Printf("ReadDir ERROR: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "text/html")
	fmt.Fprintln(w, "<ul>")
	for _, file := range files {
		fname := file.Name()
		if file.IsDir() {
			fname = fname + "/"
		}
		fmt.Fprintf(w, "<li><a href=\"%s\">%s</a></li>\n", fname, fname)
	}
	fmt.Fprintln(w, "</ul>")
}

func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
		r.URL.Path = path
	}

	fi, err := os.Stat(h.root + path)
	switch {
	case h.defaultDoc != "" && (path == "/" || os.IsNotExist(err)):
		responseFile(w, h.defaultDoc)
		return
	case os.IsNotExist(err):
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintln(w, "NotFound")
		return
	case err != nil:
		log.Printf("Stat ERROR: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	default:
		// do nothing
	}
	if fi.IsDir() {
		h.directory(w, h.root+path)
		return
	}

	responseFile(w, h.root+path)
}

func responseFile(w http.ResponseWriter, file string) {
	f, err := os.Open(file)
	if err != nil {
		log.Printf("Open ERROR: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer f.Close()

	ext := filepath.Ext(f.Name())
	ctype, ok := suffixRule[ext]
	if !ok {
		ctype = "text/plain"
	}
	w.Header().Add("Content-Type", ctype)

	if _, err := io.Copy(w, f); err != nil {
		log.Printf("Write ERROR: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func main() {
	addr := fmt.Sprintf("%s:%d", *listen, *port)
	handler := &handler{
		root:       *root,
		defaultDoc: *def,
	}

	log.Printf("Run Web Server on http://%s", addr)
	if err := http.ListenAndServe(
		addr,
		requestloghandler.RequestLogger(handler),
	); err != nil {
		log.Fatalln(err)
	}
}
