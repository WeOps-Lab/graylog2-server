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

import { Label } from 'components/bootstrap';
import { RelativeTime, Icon } from 'components/common';
import { IndexSizeSummary } from 'components/indices';

class IndexSummary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    index: PropTypes.object.isRequired,
    indexRange: PropTypes.object,
    isDeflector: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  };

  state = { showDetails: this.props.isDeflector };

  _formatLabels = (index) => {
    const labels = [];

    if (index.is_deflector) {
      labels.push(<Label key={`${this.props.name}-deflector-label`} bsStyle="primary">当前可写索引</Label>);
    }

    if (index.is_closed) {
      labels.push(<Label key={`${this.props.name}-closed-label`} bsStyle="warning">关闭的</Label>);
    }

    if (index.is_reopened) {
      labels.push(<Label key={`${this.props.name}-reopened-label`} bsStyle="success">重新打开的索引</Label>);
    }

    return <span className="index-label">{labels}</span>;
  };

  _formatIndexRange = () => {
    if (this.props.isDeflector) {
      return <span>包含消息 <RelativeTime dateTime={new Date()} /></span>;
    }

    const sizes = this.props.index.size;

    if (sizes) {
      const count = sizes.events;
      const { deleted } = sizes;

      if (count === 0 || count - deleted === 0) {
        return '索引不包含任何日志消息.';
      }
    }

    if (!this.props.indexRange) {
      return '索引的时间范围是未知的,因为索引范围不可用.请重新手动计算索引范围.';
    }

    if (this.props.indexRange.begin === 0) {
      return <span>包含 <Timestamp dateTime={this.props.indexRange.end} relative /> 的消息</span>;
    }

    return (
      <span>
        包含从 <RelativeTime dateTime={this.props.indexRange.begin} /> 到{' '}
        <RelativeTime dateTime={this.props.indexRange.end} />  的消息
      </span>
    );
  };

  _formatShowDetailsLink = () => {
    if (this.state.showDetails) {
      return <span className="index-more-actions"><Icon name="caret-down" /> 隐藏详细信息 / 操作</span>;
    }

    return <span className="index-more-actions"><Icon name="caret-right" /> 隐藏详细信息 / 操作</span>;
  };

  _toggleShowDetails = (event) => {
    event.preventDefault();
    this.setState({ showDetails: !this.state.showDetails });
  };

  render() {
    const { index } = this.props;

    return (
      <span>
        <h2>
          {this.props.name}{' '}

          <small>
            {this._formatLabels(index)}{' '}
            {this._formatIndexRange(index)}{' '}

            <IndexSizeSummary index={index} />

            <a onClick={this._toggleShowDetails} href="#">{this._formatShowDetailsLink()}</a>
          </small>
        </h2>

        <div className="index-info-holder">
          {this.state.showDetails && this.props.children}
        </div>
      </span>
    );
  }
}

export default IndexSummary;
