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
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Checkbox, Input } from 'components/bootstrap';
import type { Builder as HeatmapConfigBuilder } from 'views/logic/aggregationbuilder/visualizations/HeatmapVisualizationConfig';
import HeatmapVisualizationConfig, { COLORSCALES } from 'views/logic/aggregationbuilder/visualizations/HeatmapVisualizationConfig';

import Select from '../Select';

const StyledInput = styled(Input)`
  > label {
    font-weight: normal;
  }
`;

type Props = {
  onChange: (config: HeatmapVisualizationConfig) => void,
  config: HeatmapVisualizationConfig,
};

const _makeOption = (value) => ({ label: value, value });
const colorScalesOptions = COLORSCALES.map(_makeOption);

type Error = {
  zmin?: string,
  zmax?: string,
  defaultValue?: string,
}

const _validateConfig = (config: HeatmapVisualizationConfig, setErrors): boolean => {
  const { zMax, zMin, defaultValue } = config;
  const errors = {} as Error;

  if (zMin || zMax) {
    if (zMin >= zMax) {
      errors.zmin = '最小值大于最大值';
    }

    if (zMax <= zMin) {
      errors.zmin = '最大值小于最小值';
    }

    if (defaultValue) {
      if (defaultValue > zMax || defaultValue < zMin) {
        errors.defaultValue = '默认值超出最小值和最大值的范围';
      }
    }
  }

  setErrors(errors);

  return Object.keys(errors).length <= 0;
};

const _parseEvent = (event) => {
  const { value } = event.target;

  if (value === undefined) {
    return undefined;
  }

  return parseFloat(value);
};

const HeatmapVisualizationConfiguration = ({ config = HeatmapVisualizationConfig.empty(), onChange: onChangeFunc }: Props) => {
  const [errors, setErrors] = useState<Error>({});
  const onChange = useCallback((newConfig) => {
    if (_validateConfig(newConfig, setErrors)) {
      onChangeFunc(newConfig);
    }
  }, [onChangeFunc]);
  const modifyConfig = useCallback((fn: (HeatmapConfigBuilder) => HeatmapConfigBuilder) => {
    onChange(fn(config.toBuilder()).build());
  }, [config, onChange]);

  const _onColorScaleChange = useCallback(({ value }) => modifyConfig((builder: HeatmapConfigBuilder) => builder.colorScale(value)), [modifyConfig]);
  const _onReverseScaleChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.reverseScale(e.target.checked)), [modifyConfig]);
  const _onAutoScaleChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.autoScale(e.target.checked)), [modifyConfig]);
  const _onZminChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.zMin(_parseEvent(e))), [modifyConfig]);
  const _onZmaxChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.zMax(_parseEvent(e))), [modifyConfig]);
  const _onUseSmallestAsDefaultChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.useSmallestAsDefault(e.target.checked)), [modifyConfig]);
  const _onDefaultValueChange = useCallback((e) => modifyConfig((builder: HeatmapConfigBuilder) => builder.defaultValue(_parseEvent(e))), [modifyConfig]);

  return (
    <>
      <span>Color Scheme</span>
      <Select placeholder="选择颜色"
              onChange={_onColorScaleChange}
              options={colorScalesOptions}
              isClearable={false}
              value={_makeOption(config.colorScale)} />
      <Checkbox onChange={_onReverseScaleChange}
                checked={config.reverseScale}>
        取消缩放
      </Checkbox>
      <Checkbox onChange={_onAutoScaleChange}
                checked={config.autoScale}>
        自动缩放
      </Checkbox>
      <StyledInput type="number"
                   disabled={config.autoScale}
                   id="zmin"
                   onChange={_onZminChange}
                   value={config.zMin}
                   error={errors.zmin}
                   label="最小值" />
      <StyledInput type="number"
                   disabled={config.autoScale}
                   id="zmax"
                   value={config.zMax}
                   error={errors.zmax}
                   onChange={_onZmaxChange}
                   label="最大值" />
      <Checkbox onChange={_onUseSmallestAsDefaultChange}
                checked={config.useSmallestAsDefault}>
        使用最小作为默认值
      </Checkbox>
      <StyledInput type="number"
                   id="default_value"
                   error={errors.defaultValue}
                   disabled={config.useSmallestAsDefault}
                   onChange={_onDefaultValueChange}
                   label="默认值" />
    </>
  );
};

export default HeatmapVisualizationConfiguration;
