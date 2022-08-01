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

import { Table } from 'components/bootstrap';

class TemplatesHelper extends React.Component {
  _buildVariableName = (name) => {
    return `\${sidecar.${name}}`;
  };

  render() {
    return (
      <div>
        <Table responsive>
          <thead>
            <tr>
              <th>名称</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>{this._buildVariableName('operatingSystem')}</code></td>
              <td>客户端运行的操作系统名称, 例如:<code>&quot;Linux&quot;, &quot;Windows&quot;</code></td>
            </tr>
            <tr>
              <td><code>{this._buildVariableName('nodeName')}</code></td>
              <td>客户端的名称,如果未配置,则默认为主机名.</td>
            </tr>
            <tr>
              <td><code>{this._buildVariableName('nodeId')}</code></td>
              <td>客户端UUID</td>
            </tr>
            <tr>
              <td><code>{this._buildVariableName('sidecarVersion')}</code></td>
              <td>客户端版本</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default TemplatesHelper;
