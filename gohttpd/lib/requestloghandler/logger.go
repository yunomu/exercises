package requestloghandler

import (
	"log"
	"time"
)

type Logger interface {
	Error(msg string, err error)
	RequestInfo(url, method, body string, latency time.Duration, status int, size int64)
}

type DefaultLogger struct{}

var _ Logger = (*DefaultLogger)(nil)

func (l *DefaultLogger) Error(msg string, err error) {
	log.Printf("RequestLogger error %s: %v", msg, err)
}

func (l *DefaultLogger) RequestInfo(url, method, body string, latency time.Duration, status int, size int64) {
	log.Printf("Request: url=%s body=[%s] latency=%s status=%d size=%d", url, body, latency.String(), status, size)
}

type NopLogger struct{}

var _ Logger = (*NopLogger)(nil)

func (l *NopLogger) Error(string, error) {
}

func (l *NopLogger) RequestInfo(string, string, string, time.Duration, int, int64) {
}
