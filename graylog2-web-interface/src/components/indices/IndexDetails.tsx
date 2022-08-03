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
import React, { useEffect } from 'react';

import HideOnCloud from 'util/conditional/HideOnCloud';
import { Col, Row, Button } from 'components/bootstrap';
import { Spinner } from 'components/common';
import { IndexRangeSummary, ShardMeter, ShardRoutingOverview } from 'components/indices';
import type { IndexInfo } from 'stores/indices/IndicesStore';
import type { IndexRange } from 'stores/indices/IndexRangesStore';
import { IndexRangesActions } from 'stores/indices/IndexRangesStore';
import { IndicesActions } from 'stores/indices/IndicesStore';

type Props = {
  index: IndexInfo,
  indexName: string,
  indexRange: IndexRange,
  indexSetId: string,
  isDeflector: boolean,
};

const IndexDetails = ({ index, indexName, indexRange, indexSetId, isDeflector }: Props) => {
  useEffect(() => {
    IndicesActions.subscribe(indexName);

    return () => {
      IndicesActions.unsubscribe(indexName);
    };
  }, [indexName]);

  if (!index || !index.all_shards) {
    return <Spinner />;
  }

  const _onRecalculateIndex = () => {
    if (window.confirm(`确定重新计算索引 ${indexName} 的索引范围？`)) {
      IndexRangesActions.recalculateIndex(indexName).then(() => {
        IndicesActions.list(indexSetId);
      });
    }
  };

  const _onCloseIndex = () => {
    if (window.confirm(`确定关闭索引 ${indexName}?`)) {
      IndicesActions.close(indexName).then(() => {
        IndicesActions.list(indexSetId);
      });
    }
  };

  const _onDeleteIndex = () => {
    if (window.confirm(`确定删除索引 ${indexName}?`)) {
      IndicesActions.delete(indexName).then(() => {
        IndicesActions.list(indexSetId);
      });
    }
  };

  const _formatActionButtons = () => {
    if (isDeflector) {
      return (
        <span>
          <Button bsStyle="warning" bsSize="xs" disabled>当前可写索引不能被关闭</Button>{' '}
          <Button bsStyle="danger" bsSize="xs" disabled>当前可写索引不能被删除</Button>
        </span>
      );
    }

    return (
      <span>
        <Button bsStyle="warning" bsSize="xs" onClick={_onRecalculateIndex}>重新计算索引范围</Button>{' '}
        <Button bsStyle="warning" bsSize="xs" onClick={_onCloseIndex}>关闭索引</Button>{' '}
        <Button bsStyle="danger" bsSize="xs" onClick={_onDeleteIndex}>删除索引</Button>
      </span>
    );
  };

  return (
    <div className="index-info">
      <IndexRangeSummary indexRange={indexRange} />{' '}

      <HideOnCloud>
        {index.all_shards.segments} 段,{' '}
        {index.all_shards.open_search_contexts} 打开的上下文,{' '}
        {index.all_shards.documents.deleted} 删除的消息
        <Row style={{ marginBottom: '10' }}>
          <Col md={4} className="shard-meters">
            <ShardMeter title="主分片耗时" shardMeter={index.primary_shards} />
          </Col>
          <Col md={4} className="shard-meters">
            <ShardMeter title="总耗时" shardMeter={index.all_shards} />
          </Col>
        </Row>
        <ShardRoutingOverview routing={index.routing} indexName={indexName} />
      </HideOnCloud>
      <hr style={{ marginBottom: '5', marginTop: '10' }} />

      {_formatActionButtons()}
    </div>
  );
};

IndexDetails.propTypes = {
  index: PropTypes.object.isRequired,
  indexName: PropTypes.string.isRequired,
  indexRange: PropTypes.object.isRequired,
  indexSetId: PropTypes.string.isRequired,
  isDeflector: PropTypes.bool.isRequired,
};

export default IndexDetails;
