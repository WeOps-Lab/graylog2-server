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

import { DataTable, ExternalLink, Spinner, Icon } from 'components/common';
import { Alert } from 'components/bootstrap';

class PluginsDataTable extends React.Component {
  static propTypes = {
    plugins: PropTypes.array,
  };

  _headerCellFormatter = (header) => {
    return <th>{header}</th>;
  };

  _pluginInfoFormatter = (plugin) => {
    return (
      <tr key={plugin.name}>
        <td className="limited">{plugin.name}</td>
        <td className="limited">{plugin.version}</td>
        <td className="limited">{plugin.author}</td>
        <td className="limited" style={{ width: '50%' }}>
          {plugin.description}
          &nbsp;&nbsp;
          <ExternalLink href={plugin.url} style={{ marginLeft: 10 }}>Website</ExternalLink>
        </td>
      </tr>
    );
  };

  render() {
    if (!this.props.plugins) {
      return <Spinner text="加载此节点上的插件中..." />;
    }

    if (this.props.plugins.length === 0) {
      return <Alert bsStyle="info"><Icon name="info-circle" />&nbsp; 此节点没有安装任何插件.</Alert>;
    }

    const headers = ['名称', '版本', '作者', '描述'];

    return (
      <DataTable id="plugin-list"
                 rowClassName="row-sm"
                 className="table-hover table-condensed table-striped"
                 headers={headers}
                 headerCellFormatter={this._headerCellFormatter}
                 sortByKey="name"
                 rows={this.props.plugins}
                 dataRowFormatter={this._pluginInfoFormatter}
                 filterLabel="过滤"
                 filterKeys={[]} />
    );
  }
}

export default PluginsDataTable;
