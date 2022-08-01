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
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';

import FilterAggregationFormContainer from './FilterAggregationFormContainer';
import FilterAggregationForm from './FilterAggregationForm';
import FilterAggregationSummary from './FilterAggregationSummary';

PluginStore.register(new PluginManifest({}, {
  eventDefinitionTypes: [
    {
      type: 'aggregation-v1',
      displayName: '过滤 & 聚合',
      sortOrder: 0, // Sort before conditions working on events
      description: '从消息中通过过滤和聚合来创建事件.事件可以作为关联规则的输入.',
      formComponent: FilterAggregationFormContainer,
      summaryComponent: FilterAggregationSummary,
      defaultConfig: FilterAggregationForm.defaultConfig,
    },
  ],
}));
