package cloudwatch

import (
	"testing"

	"time"

	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
)

func TestConv(t *testing.T) {
	in := []types.MetricDataResult{
		{
			Timestamps: []time.Time{time.Unix(2, 0), time.Unix(4, 0)},
			Values:     []float64{2, 4},
		},
		{
			Timestamps: []time.Time{time.Unix(4, 0), time.Unix(8, 0)},
			Values:     []float64{4, 6},
		},
	}
	var start, end, period int64 = 0, 10 * 1e3, 2 * 1e3
	out := Conv(in, start, end, period)

	if act, exp := len(out.Timestamps), int((end-start)/period); exp != act {
		t.Fatalf("len(Timestamps)=%v expected=%v", act, exp)
	}

	if vl, il := len(out.Values), len(in); vl != il {
		t.Fatalf("mismatch number of values: exp=%v act=%v", il, vl)
	}

	for i, vs := range out.Values {
		if vl, tl := len(vs), len(out.Timestamps); vl != tl {
			t.Errorf("error values[%d] len: exp=%d act=%d", i, tl, vl)
		}

		for j, v := range vs {
			switch {
			case i == 0 && j == 1:
				if v == nil {
					t.Errorf("unexpected value: values[%d][%d]=nil", i, j)
				} else if *v != 2 {
					t.Errorf("unexpected value: values[%d][%d]=%v", i, j, *v)
				}
			case i == 0 && j == 2:
				if v == nil {
					t.Errorf("unexpected value: values[%d][%d]=nil", i, j)
				} else if *v != 4 {
					t.Errorf("unexpected value: values[%d][%d]=%v", i, j, *v)
				}
			case i == 1 && j == 2:
				if v == nil {
					t.Errorf("unexpected value: values[%d][%d]=nil", i, j)
				} else if *v != 4 {
					t.Errorf("unexpected value: values[%d][%d]=%v", i, j, *v)
				}
			case i == 1 && j == 4:
				if v == nil {
					t.Errorf("unexpected value: values[%d][%d]=nil", i, j)
				} else if *v != 6 {
					t.Errorf("unexpected value: values[%d][%d]=%v", i, j, *v)
				}
			default:
				if v != nil {
					t.Errorf("unexpected value: values[%d][%d]=%v", i, j, *v)
				}
			}
		}
	}
}
