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

import {Panel, Table} from 'components/bootstrap';
import {Spinner} from 'components/common';
import HelpPanel from 'components/event-definitions/common/HelpPanel';

import styles from './FilterPreview.css';

class FilterPreview extends React.Component {
  static propTypes = {
    searchResult: PropTypes.object,
    errors: PropTypes.array,
    isFetchingData: PropTypes.bool,
    displayPreview: PropTypes.bool,
  };

  static defaultProps = {
    searchResult: {},
    errors: [],
    isFetchingData: false,
    displayPreview: false,
  };

  renderMessages = (messages) => {
    return messages.map(({index, message}) => {
      return (
        <tr key={`${index}-${message._id}`}>
          <td>{message.timestamp}</td>
          <td>{message.message}</td>
        </tr>
      );
    });
  };

  renderSearchResult = (searchResult = {}) => {
    if (!searchResult.messages || searchResult.messages.length === 0) {
      return <p>找不到任何符合当前搜索条件的邮件。</p>;
    }

    return (
      <Table striped condensed bordered>
        <thead>
        <tr>
          <th>时间戳</th>
          <th>消息</th>
        </tr>
        </thead>
        <tbody>
        {this.renderMessages(searchResult.messages)}
        </tbody>
      </Table>
    );
  };

  render() {
    const {isFetchingData, searchResult, errors, displayPreview} = this.props;

    const renderedResults = isFetchingData ?
      <Spinner text="加载中..."/> : this.renderSearchResult(searchResult);

    return (
      <>
        <HelpPanel collapsible
                   defaultExpanded={!displayPreview}
                   title="过滤和聚合会创建多少个事件？">
          <p>
            过滤和聚合条件会生成事件的数量取决于如何配置 :
          </p>
          <ul>
            <li><b>过滤:</b>&emsp;每条满足过滤条件的消息都会被创建成一个事件</li>
            <li>
              <b>不使用分组聚合:</b>&emsp;每当满足过滤条件都会产生一条事件
            </li>
            <li>
              <b>使用分组条件:</b>&emsp;每个分组条件满足条件都会创建一个事件
            </li>
          </ul>
        </HelpPanel>

        {displayPreview && (
          <Panel className={styles.filterPreview} bsStyle="default">
            <Panel.Heading>
              <Panel.Title>过滤预览</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              {errors.length > 0 ? <p className="text-danger">{errors[0].description}</p> : renderedResults}
            </Panel.Body>
          </Panel>
        )}
      </>
    );
  }
}

export default FilterPreview;
