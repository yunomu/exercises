package cloudwatch

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"

	_ "github.com/yunomu/excercises/cloudwatch/lib/chartjs"
)

func GetMetricData(
	ctx context.Context,
	client *cloudwatch.Client,
	params *cloudwatch.GetMetricDataInput,
) ([]types.MetricDataResult, error) {
	paginator := cloudwatch.NewGetMetricDataPaginator(client, params)
	var ret []types.MetricDataResult
	for paginator.HasMorePages() {
		out, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, err
		}

		ret = append(ret, out.MetricDataResults...)
	}

	return ret, nil
}
