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
import { isEmpty } from 'lodash';
import uuid from 'uuid/v4';

import type { AggregationWidgetConfigBuilder } from 'views/logic/aggregationbuilder/AggregationWidgetConfig';
import type AggregationWidgetConfig from 'views/logic/aggregationbuilder/AggregationWidgetConfig';
import type { TimeConfigType, ValuesConfigType } from 'views/logic/aggregationbuilder/Pivot';
import Pivot from 'views/logic/aggregationbuilder/Pivot';

import GroupingsConfiguration from './GroupingsConfiguration';

import type { AggregationElement } from '../AggregationElementType';
import type {
  BaseGrouping,
  DateGrouping,
  GroupByFormValues,
  GroupingDirection,
  ValuesGrouping,
  WidgetConfigFormValues,
} from '../WidgetConfigForm';

type GroupByError = {
  field?: string,
  limit?: string,
  interval?: string,
};

const validateDateGrouping = (grouping: DateGrouping): GroupByError => {
  const groupByError = {} as GroupByError;

  if (!grouping.field?.field) {
    groupByError.field = '必填字段.';
  }

  if (grouping.interval.type === 'auto') {
    if (!grouping.interval.scaling) {
      groupByError.interval = '需要缩放.';
    }

    if (grouping.interval.scaling && (grouping.interval.scaling <= 0 || grouping.interval.scaling >= 10)) {
      groupByError.interval = '必须大于 0 且小于或等于 10';
    }
  }

  if (grouping.interval.type === 'timeunit') {
    if (!grouping.interval.value) {
      groupByError.interval = '值是必需的.';
    }

    if (grouping.interval.value && grouping.interval.value <= 0) {
      groupByError.interval = '必须大于 0.';
    }
  }

  return groupByError;
};

const validateValuesGrouping = (grouping: ValuesGrouping): GroupByError => {
  const groupByError: GroupByError = {};

  if (!grouping.field?.field) {
    groupByError.field = '必填字段.';
  }

  if (!grouping.limit) {
    groupByError.limit = '限制是必需的.';
  }

  if (grouping.limit && grouping.limit <= 0) {
    groupByError.limit = '必须大于 0.';
  }

  return groupByError;
};

const hasErrors = <T extends {}>(errors: Array<T>): boolean => {
  return errors.filter((error) => Object.keys(error).length > 0).length > 0;
};

const validateGrouping = (grouping: GroupByFormValues): GroupByError => {
  if ('interval' in grouping) {
    return validateDateGrouping(grouping);
  }

  return validateValuesGrouping(grouping);
};

const validateGroupBy = (values: WidgetConfigFormValues) => {
  const emptyErrors = {};

  if (!values.groupBy) {
    return emptyErrors;
  }

  const { groupings } = values.groupBy;
  const groupByErrors = groupings.map(validateGrouping);

  return hasErrors(groupByErrors) ? { groupBy: { groupings: groupByErrors } } : emptyErrors;
};

const addRandomId = <GroupingType extends BaseGrouping>(baseGrouping: Omit<GroupingType, 'id'>) => ({
  ...baseGrouping,
  id: uuid(),
});

const datePivotToGrouping = (pivot: Pivot, direction: GroupingDirection): DateGrouping => {
  const { field, config } = pivot;

  const { interval } = config as TimeConfigType;

  return addRandomId<DateGrouping>({
    direction,
    field: { field, type: 'time' },
    interval,
  });
};

const valuesPivotToGrouping = (pivot: Pivot, direction: GroupingDirection): ValuesGrouping => {
  const { field, config } = pivot;
  const { limit } = config as ValuesConfigType;

  return addRandomId<ValuesGrouping>({
    direction,
    field: { field, type: 'values' },
    limit,
  });
};

const pivotToGroupings = (pivot: Pivot, direction: GroupingDirection): GroupByFormValues => {
  if (pivot.type === 'time') {
    return datePivotToGrouping(pivot, direction);
  }

  if (pivot.type === 'values') {
    return valuesPivotToGrouping(pivot, direction);
  }

  throw new Error(`小部件不支持枢轴类型 "${pivot.type}"`);
};

const pivotsToGrouping = (config: AggregationWidgetConfig) => {
  const transformedRowPivots = config.rowPivots.map((pivot) => pivotToGroupings(pivot, 'row'));
  const transformedColumnPivots = config.columnPivots.map((pivot) => pivotToGroupings(pivot, 'column'));

  return [...transformedRowPivots, ...transformedColumnPivots];
};

const groupingToPivot = (grouping: GroupByFormValues) => {
  const pivotConfig = 'interval' in grouping ? { interval: grouping.interval } : { limit: grouping.limit };

  return new Pivot(grouping.field.field, grouping.field.type, pivotConfig);
};

const groupByToConfig = (groupBy: WidgetConfigFormValues['groupBy'], config: AggregationWidgetConfigBuilder) => {
  const rowPivots = groupBy.groupings.filter((grouping) => grouping.direction === 'row').map(groupingToPivot);
  const columnPivots = groupBy.groupings.filter((grouping) => grouping.direction === 'column').map(groupingToPivot);
  const { columnRollup } = groupBy;

  return config
    .rowPivots(rowPivots)
    .columnPivots(columnPivots)
    .rollup(columnRollup);
};

export const createEmptyGrouping: () => ValuesGrouping = () => addRandomId<ValuesGrouping>({
  direction: 'row',
  field: {
    field: undefined,
    type: 'values',
  },
  limit: 15,
});

const GroupByElement: AggregationElement = {
  sectionTitle: '分组',
  title: '分组',
  key: 'groupBy',
  order: 1,
  allowCreate: () => true,
  onCreate: (formValues: WidgetConfigFormValues): WidgetConfigFormValues => ({
    ...formValues,
    groupBy: {
      columnRollup: formValues.groupBy ? formValues.groupBy.columnRollup : true,
      groupings: [
        ...(formValues.groupBy?.groupings ?? []),
        createEmptyGrouping(),
      ],
    },
  }),
  onRemove: ((index, formValues) => {
    const newFormValues = { ...formValues };
    const newGroupings = formValues.groupBy?.groupings.filter((value, i) => (index !== i));

    return ({
      ...newFormValues,
      groupBy: {
        columnRollup: newFormValues.groupBy.columnRollup ?? true,
        groupings: newGroupings,
      },
    });
  }),
  fromConfig: (config: AggregationWidgetConfig) => {
    const groupings = pivotsToGrouping(config);

    if (isEmpty(groupings)) {
      return undefined;
    }

    return {
      groupBy: {
        columnRollup: config.rollup,
        groupings,
      },
    };
  },
  toConfig: (formValues: WidgetConfigFormValues, configBuilder: AggregationWidgetConfigBuilder) => groupByToConfig(formValues.groupBy, configBuilder),
  component: GroupingsConfiguration,
  validate: validateGroupBy,
};

export default GroupByElement;
