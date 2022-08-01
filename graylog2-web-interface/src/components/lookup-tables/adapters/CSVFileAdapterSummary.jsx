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

class CSVFileAdapterSummary extends React.Component {
  static propTypes = {
    dataAdapter: PropTypes.object.isRequired,
  };

  render() {
    const { config } = this.props.dataAdapter;

    return (
      <dl>
        <dt>文件路径</dt>
        <dd>{config.path}</dd>
        <dt>分隔符</dt>
        <dd><code>{config.separator}</code></dd>
        <dt>引号字符</dt>
        <dd><code>{config.quotechar}</code></dd>
        <dt>键</dt>
        <dd>{config.key_column}</dd>
        <dt>值</dt>
        <dd>{config.value_column}</dd>
        <dt>检查周期</dt>
        <dd>{config.check_interval} seconds</dd>
        <dt>忽略大小写</dt>
        <dd>{config.case_insensitive_lookup ? '是' : '否'}</dd>
      </dl>
    );
  }
}

export default CSVFileAdapterSummary;
