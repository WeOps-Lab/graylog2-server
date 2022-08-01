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
import React from 'react';

import { Icon } from 'components/common';
import { Alert, Button } from 'components/bootstrap';
import { IndexRangeSummary } from 'components/indices';
import { IndicesActions } from 'stores/indices/IndicesStore';

class ClosedIndexDetails extends React.Component {
  static propTypes = {
    indexName: PropTypes.string.isRequired,
    indexRange: PropTypes.object,
  };

  _onReopen = () => {
    IndicesActions.reopen(this.props.indexName);
  };

  _onDeleteIndex = () => {
    if (window.confirm(`确定删除索引 ${this.props.indexName}?`)) {
      IndicesActions.delete(this.props.indexName);
    }
  };

  render() {
    const { indexRange } = this.props;

    return (
      <div className="index-info">
        <IndexRangeSummary indexRange={indexRange} />
        <Alert bsStyle="info"><Icon name="info-circle" /> 此索引被关闭或已备份.索引信息目前不可用,请先恢复并开启索引以查看详情.
        </Alert>

        <hr style={{ marginBottom: '5', marginTop: '10' }} />

        <Button bsStyle="warning" bsSize="xs" onClick={this._onReopen}>重新打开索引</Button>{' '}
        <Button bsStyle="danger" bsSize="xs" onClick={this._onDeleteIndex}>删除索引</Button>
      </div>
    );
  }
}

export default ClosedIndexDetails;
