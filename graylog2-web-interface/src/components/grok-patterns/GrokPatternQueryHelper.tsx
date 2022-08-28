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
import * as React from 'react';

import { Popover, Table } from 'components/bootstrap';

const GrokPatternQueryHelper = () => (
  <Popover id="search-query-help" className="popover-wide" title="搜索语法帮助">
    <p><strong>可用的搜索字段</strong></p>
    <Table condensed>
      <thead>
        <tr>
          <th>字段</th>
          <th>描述</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>name</td>
          <td>扩展包名称</td>
        </tr>
        <tr>
          <td>pattern</td>
          <td>Grok模式</td>
        </tr>
      </tbody>
    </Table>
    <p><strong>示例</strong></p>
    <p>
     查找模式为COMMON的Grok:<br />
      <kbd>pattern:COMMON</kbd><br />
    </p>
  </Popover>
);

export default GrokPatternQueryHelper;
