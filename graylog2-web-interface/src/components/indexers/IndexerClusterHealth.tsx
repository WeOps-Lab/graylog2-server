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
import React from 'react';
import { useQueries } from 'react-query';

import { Spinner } from 'components/common';
import { Row, Col } from 'components/bootstrap';
import { DocumentationLink, SmallSupportLink } from 'components/support';
import DocsHelper from 'util/DocsHelper';
import { IndexerClusterHealthSummary } from 'components/indexers';
import type FetchError from 'logic/errors/FetchError';
import ApiRoutes from 'routing/ApiRoutes';
import fetch from 'logic/rest/FetchProvider';
import * as URLUtils from 'util/URLUtils';

import IndexerClusterHealthError from './IndexerClusterHealthError';

const GET_INDEXER_CLUSTER_HEALTH = 'indexerCluster.health';
const GET_INDEXER_CLUSTER_NAME = 'indexerCluster.name';

const getIndexerClusterHealth = () => {
  const url = URLUtils.qualifyUrl(ApiRoutes.IndexerClusterApiController.health().url);

  return fetch('GET', url);
};

const getIndexerClusterName = () => {
  const url = URLUtils.qualifyUrl(ApiRoutes.IndexerClusterApiController.name().url);

  return fetch('GET', url);
};

const useLoadHealthAndName = () => {
  const options = { refetchInterval: 5000, retry: 0 };
  const [
    { data: healthData, isFetching: healthIsFetching, error: healthError, isSuccess: healthIsSuccess, isRefetching: healthIsRefetching },
    { data: nameData, isFetching: nameIsFetching, error: nameError, isSuccess: nameIsSuccess, isRefetching: nameIsRefetching },
  ] = useQueries([
    { queryKey: GET_INDEXER_CLUSTER_HEALTH, queryFn: getIndexerClusterHealth, ...options },
    { queryKey: GET_INDEXER_CLUSTER_NAME, queryFn: getIndexerClusterName, ...options },
  ]);

  return ({
    health: healthData,
    name: nameData,
    error: (healthError || nameError) as FetchError,
    loading: (healthIsFetching || nameIsFetching) && !healthIsRefetching && !nameIsRefetching,
    isSuccess: healthIsSuccess && nameIsSuccess,
  });
};

const IndexerClusterHealth = () => {
  const { health, name, loading, error, isSuccess } = useLoadHealthAndName();

  return (
    <Row className="content">
      <Col md={12}>
        <h2>Elasticsearch集群</h2>

        <SmallSupportLink>
          Elasticsearch的集群状态.
          在<DocumentationLink page={DocsHelper.PAGES.CONFIGURING_ES} text="DataInsight文档" />查看更多信息.
        </SmallSupportLink>
        {isSuccess && <IndexerClusterHealthSummary health={health} name={name} />}
        {loading && <p><Spinner /></p>}
        {error && <IndexerClusterHealthError error={error} />}
      </Col>
    </Row>
  );
};

export default IndexerClusterHealth;
