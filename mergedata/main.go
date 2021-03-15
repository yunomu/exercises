package main

import (
	"sort"
)

type Int64Slice []int64

func (is Int64Slice) Len() int               { return len(is) }
func (is Int64Slice) Less(i int, j int) bool { return is[i] < is[j] }
func (is Int64Slice) Swap(i int, j int)      { is[i], is[j] = is[j], is[i] }

func Int64Uniq(is []int64) []int64 {
	m := map[int64]struct{}{}
	for _, i := range is {
		m[i] = struct{}{}
	}

	var ret []int64
	for i, _ := range m {
		ret = append(ret, i)
	}

	return ret
}

func MergeValues(tss [][]int64, vss [][]float64) ([]int64, [][]*float64) {
	var mergedTs []int64
	for _, ts := range tss {
		mergedTs = append(mergedTs, ts...)
	}
	mergedTs = Int64Uniq(mergedTs)
	sort.Sort(Int64Slice(mergedTs))

	vsMaps := make([]map[int64]float64, len(vss))
	for i, vs := range vss {
		vsMaps[i] = make(map[int64]float64)
		for j, v := range vs {
			vsMaps[i][tss[i][j]] = v
		}
	}

	var ret [][]*float64
	for i := 0; i < len(tss); i++ {
		ret = append(ret, make([]*float64, len(mergedTs)))
	}
	for i, t := range mergedTs {
		for j, vsMap := range vsMaps {
			v, ok := vsMap[t]
			if ok {
				ret[j][i] = &v
			}
		}
	}
	return mergedTs, ret
}

func main() {
}
