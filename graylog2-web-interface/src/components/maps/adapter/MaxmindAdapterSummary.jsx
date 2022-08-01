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

import { TimeUnit } from 'components/common';

class MaxmindAdapterSummary extends React.Component {
  static propTypes = {
    dataAdapter: PropTypes.object.isRequired,
  };

  render() {
    const { config } = this.props.dataAdapter;
    const databaseTypes = {
      MAXMIND_ASN: 'ASN数据库',
      MAXMIND_CITY: '城市数据库',
      MAXMIND_COUNTRY: '国家数据库',
      IPINFO_STANDARD_LOCATION: 'IPinfo 地理数据库',
      IPINFO_ASN: 'IPinfo ASN 数据库',
    };

    return (
      <dl>
        <dt>数据库文件路径</dt>
        <dd>{config.path}</dd>
        <dt>数据库类型</dt>
        <dd>{databaseTypes[config.database_type]}</dd>
        <dt>检查周期</dt>
        <dd><TimeUnit value={config.check_interval} unit={config.check_interval_unit} /></dd>
      </dl>
    );
  }
}

export default MaxmindAdapterSummary;
