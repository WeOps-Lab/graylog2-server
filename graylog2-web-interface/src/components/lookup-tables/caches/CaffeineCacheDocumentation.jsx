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
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { Alert } from 'components/bootstrap';

class CaffeineCacheDocumentation extends React.Component {
  render() {
    return (
      <div>
        <p>内存缓存维护数据适配器中最近使用的值.</p>
        <p>请确保您的DataInsight服务器有足够的堆来容纳缓存条目并监视缓存效率.</p>

        <Alert style={{ marginBottom: 10 }} bsStyle="info">
          <h4 style={{ marginBottom: 10 }}>实现细节</h4>
          <p>缓存是每个DataInsight服务器的本地缓存,它们不共享条目.</p>
          <p>例如,如果您有两台服务器,它们将彼此保持完全独立的缓存.</p>
        </Alert>

        <hr />

        <h3 style={{ marginBottom: 10 }}>缓存大小</h3>
        <p>每个缓存都会有最大记录数.</p>

        <h3 style={{ marginBottom: 10 }}>数据过期策略</h3>

        <h5 style={{ marginBottom: 10 }}>访问超时过期</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          数据字典将在最后一次被访问的若干时间后被移出缓存.
          在超时时间内，你将可以永远在内存中访问数据字典
        </p>

        <h5 style={{ marginBottom: 10 }}>写入超时过期</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          数据字典将在写入缓存的若干时间后被移出缓存.
          下一次访问数据字典需要重新将数据加载到缓存.
        </p>

      </div>
    );
  }
}

export default CaffeineCacheDocumentation;
