package chartjs

import (
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
)

type Output struct {
	Ids        []string
	Timestamps []int64
	Values     [][]*float64
}

func Conv(results []types.MetricDataResult, startTs, endTs int64, period int64) *Output {
	ret := &Output{
		Values: make([][]*float64, len(results)),
	}

	vmaps := make([]map[int64]float64, len(results))
	for j, result := range results {
		vmaps[j] = make(map[int64]float64)
		for i, t := range result.Timestamps {
			vmaps[j][t.Unix()*1e3] = result.Values[i]
		}
	}

	for t := startTs; t < endTs; t = t + period {
		ret.Timestamps = append(ret.Timestamps, t)
		for i, vmap := range vmaps {
			var v *float64
			v_, ok := vmap[t]
			if ok {
				v = &v_
			}
			ret.Values[i] = append(ret.Values[i], v)
		}
	}

	return ret
}
