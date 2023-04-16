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

import DeletionRetentionStrategyConfiguration from './DeletionRetentionStrategyConfiguration';
import DeletionRetentionStrategySummary from './DeletionRetentionStrategySummary';
import ClosingRetentionStrategyConfiguration from './ClosingRetentionStrategyConfiguration';
import ClosingRetentionStrategySummary from './ClosingRetentionStrategySummary';
import NoopRetentionStrategyConfiguration from './NoopRetentionStrategyConfiguration';
import NoopRetentionStrategySummary from './NoopRetentionStrategySummary';
import BackupStrategyConfiguration from './BackupStrategyConfiguration';
import BackupStrategySummary from './BackupStrategySummary';

PluginStore.register(new PluginManifest({}, {
  indexRetentionConfig: [
    {
      type: 'org.graylog2.indexer.retention.strategies.DeletionRetentionStrategy',
      displayName: '删除索引',
      configComponent: DeletionRetentionStrategyConfiguration,
      summaryComponent: DeletionRetentionStrategySummary,
    },
    {
      type: 'org.graylog2.indexer.retention.strategies.ClosingRetentionStrategy',
      displayName: '关闭索引',
      configComponent: ClosingRetentionStrategyConfiguration,
      summaryComponent: ClosingRetentionStrategySummary,
    },
    {
      type: 'org.etherfurnace.strategy.strategies.DeleteAndBackupRetentionStrategy',
      displayName: '备份并删除',
      configComponent: BackupStrategyConfiguration,
      summaryComponent: BackupStrategySummary,
    },
    {
      type: 'org.graylog2.indexer.retention.strategies.NoopRetentionStrategy',
      displayName: '不做任何操作',
      configComponent: NoopRetentionStrategyConfiguration,
      summaryComponent: NoopRetentionStrategySummary,
    },
  ],
}));
