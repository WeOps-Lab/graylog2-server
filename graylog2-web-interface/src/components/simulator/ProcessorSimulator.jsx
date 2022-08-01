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
import naturalSort from 'javascript-natural-sort';

import { Link } from 'components/common/router';
import { Col, ControlLabel, FormGroup, HelpBlock, Panel, Row } from 'components/bootstrap';
import { Select } from 'components/common';
import RawMessageLoader from 'components/messageloaders/RawMessageLoader';
import Routes from 'routing/Routes';
import { SimulatorActions } from 'stores/simulator/SimulatorStore';

import SimulationResults from './SimulationResults';

const DEFAULT_STREAM_ID = '000000000000000000000001';

class ProcessorSimulator extends React.Component {
  static propTypes = {
    streams: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    // The default stream could not be present in a system. In that case we fallback to the first available stream.
    this.defaultStream = props.streams.find((s) => s.id === DEFAULT_STREAM_ID) || props.streams[0];

    this.state = {
      message: undefined,
      stream: this.defaultStream,
      simulation: undefined,
      loading: false,
      error: undefined,
    };
  }

  _onMessageLoad = (message, options) => {
    this.setState({ message: message, simulation: undefined, loading: true, error: undefined });

    SimulatorActions.simulate
      .triggerPromise(this.state.stream, message.fields, options.inputId)
      .then(
        (response) => {
          this.setState({ simulation: response, loading: false });
        },
        (error) => {
          this.setState({ loading: false, error: error });
        },
      );
  };

  _getFormattedStreams = (streams) => {
    if (!streams) {
      return [];
    }

    return streams
      .map((stream) => {
        return { value: stream.id, label: stream.title };
      })
      .sort((s1, s2) => naturalSort(s1.label, s2.label));
  };

  _onStreamSelect = (selectedStream) => {
    const stream = this.props.streams.find((s) => s.id.toLowerCase() === selectedStream.toLowerCase());

    this.setState({ stream: stream });
  };

  render() {
    if (this.props.streams.length === 0) {
      return (
        <div>
          <Row className="row-sm">
            <Col md={8} mdOffset={2}>
              <Panel bsStyle="danger" header="未找到消息流">
                流水线运行在消息流上，但是您的系统当前没用消息流.
                请<Link to={Routes.STREAMS}>创建消息流</Link>后回到这里，在新消息流中测试流水线处理消息.
              </Panel>
            </Col>
          </Row>
        </div>
      );
    }

    const streamHelp = (
      <span>
        选择模拟过程中使用的消息流,默认使用消息流<em>{this.defaultStream.title}</em>
      </span>
    );

    return (
      <div>
        <Row>
          <Col md={12}>
            <h1>加载一条消息</h1>
            <p>
              加载一条用于模拟处理的示例消息。{' '}
              <strong>存储在DataInsight中的原始消息不会被更改.</strong>
            </p>
            <Row className="row-sm">
              <Col md={7}>
                <FormGroup id="streamSelectorSimulation">
                  <ControlLabel>消息流</ControlLabel>
                  <Select options={this._getFormattedStreams(this.props.streams)}
                          onChange={this._onStreamSelect}
                          value={this.state.stream.id}
                          required
                          clearable={false} />
                  <HelpBlock>{streamHelp}</HelpBlock>
                </FormGroup>
              </Col>
            </Row>
            <RawMessageLoader onMessageLoaded={this._onMessageLoad} inputIdSelector />
          </Col>
        </Row>
        <SimulationResults stream={this.state.stream}
                           originalMessage={this.state.message}
                           simulationResults={this.state.simulation}
                           isLoading={this.state.loading}
                           error={this.state.error} />
      </div>
    );
  }
}

export default ProcessorSimulator;
