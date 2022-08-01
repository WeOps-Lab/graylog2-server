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
import PropTypes from 'prop-types';

import { Alert, Col, DropdownButton, MenuItem, Row } from 'components/bootstrap';
import { Spinner } from 'components/common';
import MessageShow from 'components/search/MessageShow';
import NumberUtils from 'util/NumberUtils';

import SimulationChanges from './SimulationChanges';
import SimulationPreview from './SimulationPreview';
import SimulationTrace from './SimulationTrace';
import style from './SimulationResults.lazy.css';

const VIEW_OPTIONS = {
  SIMULATION_PREVIEW: 1,
  SIMULATION_SUMMARY: 2,
  SIMULATION_TRACE: 3,
};

class SimulationResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewOption: VIEW_OPTIONS.SIMULATION_SUMMARY,
    };
  }

  componentDidMount() {
    style.use();
  }

  componentWillUnmount() {
    style.unuse();
  }

  _changeViewOptions = (eventKey) => {
    const selectedOption = Object.keys(VIEW_OPTIONS).find((key) => VIEW_OPTIONS[key] === eventKey);

    this.setState({ viewOption: VIEW_OPTIONS[selectedOption] });
  };

  _getViewOptionsMenuItems = () => [
    this._getViewOptionsMenuItem(VIEW_OPTIONS.SIMULATION_SUMMARY, '变更概览'),
    this._getViewOptionsMenuItem(VIEW_OPTIONS.SIMULATION_PREVIEW, '结果预览'),
    this._getViewOptionsMenuItem(VIEW_OPTIONS.SIMULATION_TRACE, '模拟调试'),
  ];

  _getViewOptionsMenuItem = (option, text) => {
    const { viewOption } = this.state;

    return (
      <MenuItem key={option} eventKey={option} active={viewOption === option}>
        {text}
      </MenuItem>
    );
  };

  _getViewComponent = (streams) => {
    const { simulationResults, isLoading, originalMessage } = this.props;

    if (isLoading || !simulationResults) {
      return <Spinner />;
    }

    const { viewOption } = this.state;

    switch (viewOption) {
      case VIEW_OPTIONS.SIMULATION_PREVIEW:
        return <SimulationPreview simulationResults={simulationResults} streams={streams} />;
      case VIEW_OPTIONS.SIMULATION_SUMMARY:
        return (
          <SimulationChanges originalMessage={originalMessage}
                             simulationResults={simulationResults} />
        );
      case VIEW_OPTIONS.SIMULATION_TRACE:
        return <SimulationTrace simulationResults={simulationResults} />;
      default:
      // it should never happen™
    }

    return null;
  };

  render() {
    const { stream, simulationResults, isLoading, error, originalMessage } = this.props;

    if (!originalMessage && !simulationResults) {
      return null;
    }

    const streams = {
      [stream.id]: stream,
    };

    // eslint-disable-next-line no-nested-ternary
    const originalMessagePreview = isLoading
      ? <Spinner />
      : originalMessage
        ? (
          <MessageShow message={originalMessage}
                       streams={streams} />
        )
        : null;

    const errorMessage = error
      ? (
        <Alert bsStyle="danger">
          <p><strong>模拟消息处理器错误</strong></p>
          <p>
            无法模拟处理在<em>{this.props.stream.title}</em>消息流的消息<em>{this.props.originalMessage.id}</em>.
            <br />
            请重新加载日志消息,或者为模拟提供另一条日志消息.
          </p>
        </Alert>
      )
      : null;

    return (
      <Row>
        <Col md={12}>
          <hr />
        </Col>
        <Col md={6}>
          <h1>原始消息</h1>
          <p>这是DataInsight原始消息.</p>
          <div className="message-preview-wrapper">
            {originalMessagePreview}
          </div>
        </Col>
        <Col md={6}>
          <div className="pull-right">
            <DropdownButton id="simulation-view-options"
                            title="更多结果"
                            onSelect={this._changeViewOptions}
                            bsStyle="default"
                            bsSize="small"
                            pullRight>
              {this._getViewOptionsMenuItems()}
            </DropdownButton>
          </div>
          <h1>模拟结果</h1>
          <p>
            {isLoading
              ? '模拟消息处理中,请等待.'
              : `这是处理完加载的消息的结果,处理耗时 ${NumberUtils.formatNumber(simulationResults.took_microseconds)} µs.`}
          </p>
          {errorMessage}
          {this._getViewComponent(streams)}
        </Col>
      </Row>
    );
  }
}

SimulationResults.propTypes = {
  stream: PropTypes.object.isRequired,
  originalMessage: PropTypes.object,
  simulationResults: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};

SimulationResults.defaultProps = {
  originalMessage: undefined,
  simulationResults: undefined,
  isLoading: false,
  error: undefined,
};

export default SimulationResults;
