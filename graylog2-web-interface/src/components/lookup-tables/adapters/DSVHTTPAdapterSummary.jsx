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

const DSVHTTPAdapterSummary = ({ dataAdapter }) => {
  const { config } = dataAdapter;

  return (
    <dl>
      <dt>文件URL</dt>
      <dd>{config.url}</dd>
      <dt>分隔符</dt>
      <dd><code>{config.separator}</code></dd>
      <dt>行分隔符</dt>
      <dd><code>{config.line_separator}</code></dd>
      <dt>引号字符</dt>
      <dd><code>{config.quotechar}</code></dd>
      <dt>忽略以这些字符开始的行</dt>
      <dd><code>{config.ignorechar}</code></dd>
      <dt>键列</dt>
      <dd>{config.key_column}</dd>
      <dt>值列</dt>
      <dd>{config.value_column}</dd>
      <dt>刷新间隔</dt>
      <dd>{config.check_interval} seconds</dd>
      <dt>忽略大小写</dt>
      <dd>{config.case_insensitive_lookup ? '是' : '否'}</dd>
    </dl>
  );
};

export default DSVHTTPAdapterSummary;
