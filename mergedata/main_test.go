package main

import (
	"testing"
)

func TestMergeValues(t *testing.T) {
	tss := [][]int64{
		{2, 4, 5},
		{1, 3, 5},
	}
	vss := [][]float64{
		{20, 40, 50},
		{10, 30, 60},
	}
	expectedTs := []int64{1, 2, 3, 4, 5}
	var v1, v2, v3, v4, v5, v6 float64 = 10, 20, 30, 40, 50, 60
	expectedVss := [][]*float64{
		{nil, &v2, nil, &v4, &v5},
		{&v1, nil, &v3, nil, &v6},
	}

	mts, rss := MergeValues(tss, vss)
	t.Logf("Timestamps: %v", mts)
	if len(mts) != len(expectedTs) {
		t.Fatalf("num of timestamp is mismatch")
	}
	for i, ts := range mts {
		if ets := expectedTs[i]; ets != ts {
			t.Errorf("timestamp is mismatch: exp=%v actual=%v", ets, ts)
		}
	}

	for i, rs := range rss {
		for j, r := range rs {
			if v := expectedVss[i][j]; !(v == nil && r == nil || *v == *r) {
				t.Errorf("value is mismatch: (%v, %v) exp=%v act=%v", i, j, *v, *r)
			}
		}
	}
}
