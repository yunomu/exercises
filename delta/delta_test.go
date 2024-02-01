package delta

import (
	"testing"

	"bytes"
)

func FuzzEncode(f *testing.F) {
	f.Fuzz(func(t *testing.T, orig []byte) {
		decoded := Decode(Encode(orig))
		if bytes.Compare(orig, decoded) != 0 {
			t.Errorf("before: %q, after: %q", orig, decoded)
		}
	})
}
