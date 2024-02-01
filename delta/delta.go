package delta

func Encode(xs []byte) []byte {
	ret := make([]byte, len(xs))

	var pred byte
	for i, x := range xs {
		ret[i] = x - pred
		pred = x
	}

	return ret
}

func Decode(ys []byte) []byte {
	ret := make([]byte, len(ys))

	var pred byte
	for i, y := range ys {
		x := y + pred
		ret[i] = x
		pred = x
	}

	return ret
}
