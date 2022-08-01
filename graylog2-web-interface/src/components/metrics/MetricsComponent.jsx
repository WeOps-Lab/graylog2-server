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
import styled from 'styled-components';

import { Alert, Col, Row } from 'components/bootstrap';
import { Icon } from 'components/common';
import { MetricsFilterInput, MetricsList } from 'components/metrics';

const StyledWarningDiv = styled.div(({ theme }) => `
  height: 20px;
  margin-bottom: 5px;
  color: ${theme.colors.variant.dark.danger};
`);

class MetricsComponent extends React.Component {
  static propTypes = {
    names: PropTypes.arrayOf(PropTypes.object),
    namespace: PropTypes.string.isRequired,
    nodeId: PropTypes.string.isRequired,
    filter: PropTypes.string,
    error: PropTypes.shape({
      responseMessage: PropTypes.string,
      status: PropTypes.number,
    }),
  };

  static defaultProps = {
    names: undefined,
    filter: '',
    error: undefined,
  };

  state = { filter: this.props.filter };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.filter !== this.props.filter) {
      this.setState({ filter: nextProps.filter });
    }
  }

  onFilterChange = (nextFilter) => {
    this.setState({ filter: nextFilter });
  };

  render() {
    const { filter } = this.state;
    const { names, error } = this.props;

    if (!names) {
      return (
        <Row className="content">
          <Col md={12}>
            <Alert bsStyle="danger">
              <Icon name="exclamation-triangle" />&nbsp;
              {error ? (
                <span>
                  无法从节点获取指标：服务器返回 <em>{error.responseMessage || ''}</em>{' '}
                  带有 {error.status} 状态码。
                </span>
              ) : (
                <span>获取节点指标时出现问题。</span>
              )}
              {' '}DataInsight 将继续尝试让它们进入后台。
            </Alert>
          </Col>
        </Row>
      );
    }

    let filteredNames;

    try {
      const filterRegex = new RegExp(filter, 'i');

      filteredNames = names.filter((metric) => String(metric.full_name).match(filterRegex));
    } catch (e) {
      filteredNames = [];
    }

    return (
      <Row className="content">
        <Col md={12}>
          <StyledWarningDiv className="text-warning">
            {error && (
              <>
                <Icon name="exclamation-triangle" />&nbsp;
                无法从节点获取指标：服务器返回 <em>{error.responseMessage || ''}</em>{' '}
                带有 {error.status} 状态码。显示最后可用的指标。
              </>
            )}
          </StyledWarningDiv>
          <MetricsFilterInput filter={filter} onChange={this.onFilterChange} />
          <MetricsList names={filteredNames} namespace={this.props.namespace} nodeId={this.props.nodeId} />
        </Col>
      </Row>
    );
  }
}

export default MetricsComponent;
