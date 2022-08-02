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
import React, { useCallback } from 'react';
import { capitalize } from 'lodash';

import { Input } from 'components/bootstrap';
import { HoverForHelp } from 'components/common';
import Select from 'views/components/Select';
import NumberVisualizationConfig from 'views/logic/aggregationbuilder/visualizations/NumberVisualizationConfig';

type Props = {
  onChange: (config: NumberVisualizationConfig) => void,
  config: NumberVisualizationConfig,
};

const MAPPING = {
  'Lower': '低',
  'Neutral': '无',
  'Higher': '高'
}

const _makeOption = (value) => ({ label: MAPPING[capitalize(value)], value });
const trendPreferenceOptions = ['LOWER', 'NEUTRAL', 'HIGHER'].map(_makeOption);

const NumberVisualizationConfiguration = ({ config = NumberVisualizationConfig.empty(), onChange }: Props) => {
  const changeTrend = useCallback(({ target: { checked } }) => onChange(config.toBuilder().trend(checked).build()), [config, onChange]);
  const changeTrendPreference = useCallback(({ value }) => onChange(config.toBuilder().trendPreference(value).build()), [config, onChange]);
  const trendingHelp = (
    <HoverForHelp title="趋势">
      <p>
        如果用户启用趋势，则在当前值下方会显示一个单独的框，指示更改的方向
        通过图标以及当前值与上一个值之间的绝对和相对差异。
      </p>

      <p>
        前一个值是通过在后台执行两次搜索来计算的，除了
        时间范围。第一次搜索的时间范围与为此查询/此小部件配置的时间范围相同，
        第二个是相同的时间范围，但是时间范围长度的偏移量移到了过去。
      </p>
    </HoverForHelp>
  );

  return (
    <>
      <Input key="trend"
             id="trend"
             type="checkbox"
             name="trend"
             label={<span>显示趋势 {trendingHelp}</span>}
             defaultChecked={config.trend}
             onChange={changeTrend}
             help="显示此数值的趋势信息." />

      <Input id="trend_preference" label="趋势配置" help="选择哪个趋势方向为正色">
        <Select isDisabled={!config.trend}
                isClearable={false}
                isSearchable={false}
                options={trendPreferenceOptions}
                onChange={changeTrendPreference}
                value={_makeOption(config.trendPreference)} />
      </Input>
    </>
  );
};

export default NumberVisualizationConfiguration;
