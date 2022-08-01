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
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { Alert } from 'components/bootstrap';
import { Icon } from 'components/common';
import { DocumentationLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';

const ESClusterStatus = styled(Alert)`
  margin-top: 10px;
  margin-bottom: 5px;
`;

const IndexerClusterHealthSummary = ({ health, name }: {
  health: {
    status: string,
    shards: {
      active: string,
      initializing: string,
      relocating: string,
      unassigned: string
    }
  },
  name?: {
    name: string
  }
}) => {
  const formattedHealthStatus = health.status.toLowerCase();

  const alertClassForHealth = () => {
    switch (formattedHealthStatus) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'danger';
      default: return 'success';
    }
  };

  const formattedTextForHealth = useMemo(() => {
    const text = `Elasticsearch 状态为 ${health.status}.`;
    switch (formattedHealthStatus) {
      case 'green': return 'Elasticsearch 状态为 健康';
      case 'yellow':return <strong>Elasticsearch 状态为 不健康</strong>;
      case 'red': return <strong> Elasticsearch 状态为 不可用</strong>;
      default: return text;
    }
  }, [formattedHealthStatus, name]);

  const iconNameForHealth = () => {
    switch (formattedHealthStatus) {
      case 'green': return 'check-circle';
      case 'yellow': return 'exclamation-triangle';
      case 'red': return 'ambulance';
      default: return 'check-circle';
    }
  };

  return (
    <ESClusterStatus bsStyle={alertClassForHealth()}>
      <Icon name={iconNameForHealth()} /> &nbsp;{formattedTextForHealth}{' '}
      分片:{' '}
      {health.shards.active} 个活跃的分片,{' '}
      {health.shards.initializing} 个初始化中的分片,{' '}
      {health.shards.relocating} 个重新分配的分片,{' '}
      {health.shards.unassigned} 个未分配的分片,{' '}
      <DocumentationLink page={DocsHelper.PAGES.CLUSTER_STATUS_EXPLAINED} text="这代表什么意思?" />
    </ESClusterStatus>
  );
};

IndexerClusterHealthSummary.defaultProps = {
  name: undefined,
};

IndexerClusterHealthSummary.propTypes = {
  health: PropTypes.object.isRequired,
  name: PropTypes.object,
};

export default IndexerClusterHealthSummary;
