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
import PropTypes from 'prop-types';

import { TimeUnit } from 'components/common';

const DnsAdapterSummary = ({ dataAdapter }) => {
  const { config } = dataAdapter;

  // Allows enum > display label translation.
  const lookupType = {
    A: '解析主机名到IPv4地址(A)',
    AAAA: '解析主机名到IPv6地址(AAAA)',
    A_AAAA: '解析主机名到IPv4和IPv6地址(A 和 AAAA)',
    PTR: '反向查找(PTR)',
    TXT: '文本数据字典(TXT)',
  };

  return (
    <dl>
      <dt>DNS查找类型</dt>
      <dd>{lookupType[config.lookup_type]}</dd>

      <dt>DNS服务器</dt>
      <dd>{config.server_ips || 'n/a'}</dd>

      <dt>DNS请求超时时间</dt>
      <dd>{config.request_timeout} ms</dd>

      <dt>覆盖缓存生命周期</dt>
      <dd>
        {!config.cache_ttl_override_enabled ? 'n/a' : <TimeUnit value={config.cache_ttl_override} unit={config.cache_ttl_override_unit} />}
      </dd>
    </dl>
  );
};

DnsAdapterSummary.propTypes = {
  dataAdapter: PropTypes.shape({
    config: PropTypes.shape({
      lookup_type: PropTypes.string.isRequired,
      request_timeout: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

export default DnsAdapterSummary;
