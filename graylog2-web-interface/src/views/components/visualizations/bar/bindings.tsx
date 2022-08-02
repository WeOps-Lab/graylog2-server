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
import BarVisualization from 'views/components/visualizations/bar/BarVisualization';
import BarVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/BarVisualizationConfig';
import { hasAtLeastOneMetric } from 'views/components/visualizations/validations';

type BarVisualizationConfigFormValues = {
  barmode: 'group' | 'stack' | 'relative' | 'overlay',
};

const DEFAULT_BARMODE = 'group';

const validate = hasAtLeastOneMetric('Bar chart');

const barChart: VisualizationType<typeof BarVisualization.type, BarVisualizationConfig, BarVisualizationConfigFormValues> = {
  type: BarVisualization.type,
  displayName: '柱状图',
  component: BarVisualization,
  config: {
    createConfig: () => ({ barmode: DEFAULT_BARMODE }),
    fromConfig: (config: BarVisualizationConfig | undefined) => ({ barmode: config?.barmode ?? DEFAULT_BARMODE }),
    toConfig: (formValues: BarVisualizationConfigFormValues) => BarVisualizationConfig.create(formValues.barmode),
    fields: [{
      name: 'barmode',
      title: '模式',
      type: 'select',
      options: [['分组', 'group'], ['堆叠', 'stack'], ['相对', 'relative'], ['覆盖', 'overlay']],
      required: true,
      helpComponent: () => {
        const options = {
          group: {
            label: '分组',
            help: '每个系列在图表中由其自己的条形表示.',
          },
          stack: {
            label: '堆叠',
            help: '所有系列相互堆叠，形成一个条形图.',
          },
          relative: {
            label: '相对',
            help: '所有系列相互堆叠，形成一张图表。但负数列低于零.',
          },
          overlay: {
            label: '覆盖',
            help: '所有系列都作为条形放置在彼此之上。为了能够看到条形，不透明度降低到 75%。'
              + ' 建议在不超过 3 个系列的情况下使用此选项。',
          },
        };

        return (
          <ul>
            {Object.values(options).map(({ label, help }) => (
              <li key={label}>
                <h4>{label}</h4>
                {help}
              </li>
            ))}
          </ul>
        );
      },
    }],
  },
  capabilities: ['event-annotations'],
  validate,
};

export default barChart;
