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

import { OverlayTrigger, SearchForm, Icon } from 'components/common';
import { Popover, Table, Button } from 'components/bootstrap';

import style from './SidecarSearchForm.css';

class SidecarSearchForm extends React.Component {
  static propTypes = {
    query: PropTypes.string.isRequired,
    onSearch: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    children: PropTypes.element,
  };

  static defaultProps = {
    children: undefined,
  };

  render() {
    const { query, onSearch, onReset, children } = this.props;

    const queryHelpPopover = (
      <Popover id="search-query-help" className={style.popoverWide} title="搜索帮助">
        <p><strong>可用的过滤字段</strong></p>
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
            <td>客户端名称</td>
          </tr>
          <tr>
            <td>status</td>
            <td>客户端状态</td>
          </tr>
          <tr>
            <td>operating_system</td>
            <td>操作系统</td>
          </tr>
          <tr>
            <td>last_seen</td>
            <td>与DataInsight最后一次通讯的时间</td>
          </tr>
          <tr>
            <td>node_id</td>
            <td>客户端ID</td>
          </tr>
          <tr>
            <td>sidecar_version</td>
            <td>客户端版本</td>
          </tr>
          </tbody>
        </Table>
        <p><strong>示例</strong></p>
        <p>
          查找自以下时间以来,未与DataInsight通讯的客户端:<br />
          <kbd>{'last_seen:<=2018-04-10'}</kbd><br />
        </p>
        <p>
          查找状态为<code>启动失败</code>或者<code>未知</code>的客户端:<br />
          <kbd>status:failing status:unknown</kbd><br />
        </p>
      </Popover>
    );

    const queryHelp = (
      <OverlayTrigger trigger="click" rootClose placement="right" overlay={queryHelpPopover}>
        <Button bsStyle="link"><Icon name="question-circle" /></Button>
      </OverlayTrigger>
    );

    return (
      <SearchForm query={query}
                  onSearch={onSearch}
                  onReset={onReset}
                  searchButtonLabel="搜索"
                  placeholder="搜索客户端管理器"
                  queryWidth={400}
                  queryHelpComponent={queryHelp}
                  topMargin={0}
                  useLoadingState>
        {children}
      </SearchForm>
    );
  }
}

export default SidecarSearchForm;
