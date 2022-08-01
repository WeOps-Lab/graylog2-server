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
import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';

import { MultiSelect } from 'components/common';
import { Col, ControlLabel, FormGroup, HelpBlock, Row } from 'components/bootstrap';
// TODO: This should be moved to a general place outside of `views`
import { defaultCompare } from 'views/logic/DefaultCompare';
import useFieldTypes from 'views/logic/fieldtypes/useFieldTypes';
import { ALL_MESSAGES_TIMERANGE } from 'views/Constants';

import AggregationConditionsForm from './AggregationConditionsForm';

import commonStyles from '../common/commonStyles.css';

type EventDefinitionConfig = {
  group_by: Array<string>,
  streams: Array<string>,
};

type EventDefinition = {
  config: EventDefinitionConfig,
};

type Props = {
  eventDefinition: EventDefinition,
  validation: {},
  aggregationFunctions: Array<{}>,
  onChange: (key: string, newValue: any) => void,
};

const AggregationForm = ({ aggregationFunctions, eventDefinition, validation, onChange }: Props) => {
  const { data: allFieldTypes } = useFieldTypes(eventDefinition?.config?.streams ?? [], ALL_MESSAGES_TIMERANGE);
  // Memoize function to only format fields when they change. Use joined fieldNames as cache key.
  const formattedFields = useMemo(() => (allFieldTypes ?? [])
    .sort((ftA, ftB) => defaultCompare(ftA.name, ftB.name))
    .map((fieldType) => ({
      label: `${fieldType.name} – ${fieldType.value.type.type}`,
      value: fieldType.name,
    })), [allFieldTypes]);

  const propagateConfigChange = useCallback((update: Partial<EventDefinitionConfig>) => {
    const nextConfig = { ...eventDefinition.config, ...update };

    onChange('config', nextConfig);
  }, [eventDefinition.config, onChange]);

  const handleGroupByChange = useCallback((selected: string) => {
    const nextValue = selected === '' ? [] : selected.split(',');
    propagateConfigChange({ group_by: nextValue });
  }, [propagateConfigChange]);

  return (
    <fieldset>
      <h2 className={commonStyles.title}>聚合</h2>
      <p>
        使用函数聚合与上面定义的筛选器匹配的消息.您可以选择按相同的字段值筛选结果。
      </p>
      <Row>
        <Col lg={7}>
          <FormGroup controlId="group-by">
            <ControlLabel>分组字段 <small className="text-muted">(可选)</small></ControlLabel>
            <MultiSelect id="group-by"
                         matchProp="label"
                         onChange={handleGroupByChange}
                         options={formattedFields}
                         ignoreAccents={false}
                         value={lodash.defaultTo(eventDefinition.config.group_by, []).join(',')}
                         allowCreate />
            <HelpBlock>
              选择DataInsight应用于在筛选结果具有相同值时对其进行分组的字段.
              {' '}<b>示例:</b><br />
              假设您创建了一个过滤器，其中包含网络中所有失败的登录尝试，则DataInsight可能会在总的登录尝试失败次数超过5次时
              发出告警.添加 <code>username</code> 作为分组字段,那么DataInsight将会在
              <em>每个 <code>username</code></em> 登录次数超过5次时发出告警.
            </HelpBlock>
          </FormGroup>
        </Col>
      </Row>

      <hr />

      <AggregationConditionsForm eventDefinition={eventDefinition}
                                 validation={validation}
                                 formattedFields={formattedFields}
                                 aggregationFunctions={aggregationFunctions}
                                 onChange={propagateConfigChange} />
    </fieldset>
  );
};

AggregationForm.propTypes = {
  eventDefinition: PropTypes.object.isRequired,
  validation: PropTypes.object.isRequired,
  aggregationFunctions: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AggregationForm;
