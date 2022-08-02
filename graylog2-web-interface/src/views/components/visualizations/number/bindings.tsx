/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import * as React from 'react';

import type { VisualizationType } from 'views/types';
import NumberVisualization from 'views/components/visualizations/number/NumberVisualization';
import NumberVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/NumberVisualizationConfig';

type NumberVisualizationConfigFormValues = {
  trend: boolean,
  trend_preference: 'LOWER' | 'NEUTRAL' | 'HIGHER',
};

const singleNumber: VisualizationType<typeof NumberVisualization.type, NumberVisualizationConfig, NumberVisualizationConfigFormValues> = {
  type: NumberVisualization.type,
  displayName: '单值',
  component: NumberVisualization,
  config: {
    fromConfig: (config: NumberVisualizationConfig | undefined) => ({ trend: config?.trend, trend_preference: config?.trendPreference }),
    toConfig: ({ trend = false, trend_preference }: NumberVisualizationConfigFormValues) => NumberVisualizationConfig.create(trend, trend_preference),
    fields: [{
      name: 'trend',
      title: '趋势',
      type: 'boolean',
      description: '显示此值的趋势信息.',
      helpComponent: () => (
        <>
          <p>
            如果用户启用趋势，当前值下方会显示一个单独的框，指示变化的方向
            通过图标以及当前值与前一个值之间的绝对和相对差异。
          </p>

          <p>
            之前的值是在后台执行两次搜索计算出来的，除此之外完全一致
            时间范围。第一次搜索的时间范围与为此查询/此小部件配置的时间范围相同，
            第二个是相同的时间范围，但时间范围长度的偏移量转移到过去。
          </p>
        </>
      ),
    }, {
      name: 'trend_preference',
      title: '趋势',
      type: 'select',
      options: [['越小越好', 'LOWER'], ['普通', 'NEUTRAL'], ['越大越好', 'HIGHER']],
      required: true,
      isShown: (formValues: NumberVisualizationConfigFormValues) => formValues?.trend === true,
    }],
  },
};

export default singleNumber;
