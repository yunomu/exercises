package requestloghandler

import (
	"bytes"
	"io"
	"io/ioutil"
	"net/http"
	"time"
)

type logWriter struct {
	w      http.ResponseWriter
	status int
	size   int64
}

var _ http.ResponseWriter = (*logWriter)(nil)

// Header calls underlying writer.
func (l *logWriter) Header() http.Header {
	return l.w.Header()
}

// Write writes b to underlying writer and counts written size.
func (l *logWriter) Write(b []byte) (int, error) {
	size, err := l.w.Write(b)
	l.size += int64(size)
	return size, err
}

// WriteHeader writes s to underlying writer and retains the status.
func (l *logWriter) WriteHeader(s int) {
	l.w.WriteHeader(s)
	l.status = s
}

// Flush implements http.Flusher.
func (l *logWriter) Flush() {
	if f, ok := l.w.(http.Flusher); ok {
		f.Flush()
	}
}

type requestLogger struct {
	handler      http.Handler
	logger       Logger
	excludePaths []string
}

type RequestLoggerOption func(*requestLogger)

func AddExcludePath(path string) RequestLoggerOption {
	return func(l *requestLogger) {
		l.excludePaths = append(l.excludePaths, path)
	}
}

func SetLogger(logger Logger) RequestLoggerOption {
	return func(l *requestLogger) {
		l.logger = logger
	}
}

func contains(ss []string, t string) bool {
	for _, s := range ss {
		if s == t {
			return true
		}
	}
	return false
}

func RequestLogger(h http.Handler, opts ...RequestLoggerOption) http.Handler {
	l := &requestLogger{
		handler: h,
		logger:  &DefaultLogger{},
	}
	for _, f := range opts {
		f(l)
	}

	return l
}

func (l *requestLogger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var body string
	if !contains(l.excludePaths, r.URL.Path) {
		buf := new(bytes.Buffer)
		if _, err := buf.ReadFrom(r.Body); err != nil {
			l.logger.Error("buf.ReadFrom(body)", err)
			l.handler.ServeHTTP(w, r)
			return
		}

		body = buf.String()
		r.Body = ioutil.NopCloser(io.Reader(buf))
	}

	lw := &logWriter{w: w, status: http.StatusOK}
	t1 := time.Now().UTC()
	l.handler.ServeHTTP(lw, r)
	t2 := time.Now().UTC()

	l.logger.RequestInfo(r.URL.String(), r.Method, body, t2.Sub(t1), lw.status, lw.size)
}
