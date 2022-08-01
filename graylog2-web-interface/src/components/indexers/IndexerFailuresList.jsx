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

import {Alert, Table} from 'components/bootstrap';
import {Icon} from 'components/common';
import {IndexerFailure} from 'components/indexers';

class IndexerFailuresList extends React.Component {
  static propTypes = {
    failures: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  render() {
    if (this.props.failures.length === 0) {
      return (
        <Alert bsStyle="success"><Icon name="check-circle"/> 没有任何索引失败.</Alert>
      );
    }

    return (
      <div className="scrollable-table">
        <Table className="indexer-failures" striped hover condensed>
          <thead>
          <tr>
            <th style={{ width: 200 }}>时间戳</th>
            <th>索引</th>
            <th>ID</th>
            <th>错误消息</th>
          </tr>
          </thead>
          <tbody>
          {this.props.failures.map((failure) => <IndexerFailure key={`indexer-failure-${failure.letter_id}`}
                                                                failure={failure}/>)}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default IndexerFailuresList;
