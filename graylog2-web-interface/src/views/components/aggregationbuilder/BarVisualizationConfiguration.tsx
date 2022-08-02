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
import PropTypes from 'prop-types';

import {HoverForHelp} from 'components/common';
import Select from 'views/components/Select';
import type {BarMode} from 'views/logic/aggregationbuilder/visualizations/BarVisualizationConfig';
import BarVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/BarVisualizationConfig';

type Props = {
  onChange: (config: BarVisualizationConfig) => void,
  config: BarVisualizationConfig,
};

type BarModeOption = {
  label: string,
  value: BarMode,
};

class BarVisualizationConfiguration extends React.Component<Props> {
  static propTypes = {
    onChange: PropTypes.func,
    config: PropTypes.object,
  };

  static defaultProps = {
    onChange: () => {
    },
    config: BarVisualizationConfig.create('group'),
  };

  static options = {
    group: {
      label: '分组',
      help: '每个系列在图表中由其自己的条形表示.',
    },
    stack: {
      label: '堆栈',
      help: '所有系列相互堆叠，形成一个条形图',
    },
    relative: {
      label: '相对值',
      help: '所有系列相互堆叠，形成一张图表。但负数列低于零.',
    },
    overlay: {
      label: '覆盖',
      help: '所有系列都作为条形放置在彼此之上。为了能够看到条形，不透明度降低到 75%。'
        + ' 建议在不超过 3 个系列的情况下使用此选项。',
    },
  };

  _onChange: (barmode: BarModeOption) => void = (barmode: BarModeOption) => {
    const {onChange, config} = this.props;
    const newConfig = config.toBuilder().barmode(barmode.value).build();

    onChange(newConfig);
  };

  _wrapOption: (value: BarMode) => BarModeOption = (value) => {
    const option = BarVisualizationConfiguration.options[value];

    return {label: option.label, value: value};
  };

  render() {
    const modes = Object.keys(BarVisualizationConfiguration.options);
    const options = modes.map(this._wrapOption);
    const {config} = this.props;

    return (
      <>
        <span>Mode:</span>
        <HoverForHelp title="条形图模式帮助">
          <ul>
            {modes.map((mode) => (
              <li key={mode}><h4>{BarVisualizationConfiguration.options[mode].label}</h4>
                {BarVisualizationConfiguration.options[mode].help}
              </li>
            ))}
          </ul>
        </HoverForHelp>
        <Select placeholder="无：点击添加列"
                onChange={this._onChange}
                options={options}
                value={this._wrapOption(config.barmode)}/>
      </>
    );
  }
}

export default BarVisualizationConfiguration;
