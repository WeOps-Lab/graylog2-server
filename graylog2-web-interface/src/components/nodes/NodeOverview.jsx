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

import { LinkContainer } from 'components/common/router';
import { Row, Col, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import HideOnCloud from 'util/conditional/HideOnCloud';

import BufferUsage from './BufferUsage';
import SystemOverviewDetails from './SystemOverviewDetails';
import JvmHeapUsage from './JvmHeapUsage';
import JournalDetails from './JournalDetails';
import SystemInformation from './SystemInformation';
import RestApiOverview from './RestApiOverview';
import PluginsDataTable from './PluginsDataTable';
import InputTypesDataTable from './InputTypesDataTable';

class NodeOverview extends React.Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    systemOverview: PropTypes.object.isRequired,
    jvmInformation: PropTypes.object,
    plugins: PropTypes.array,
    inputDescriptions: PropTypes.object,
    inputStates: PropTypes.array,
  };

  render() {
    const { node } = this.props;
    const { systemOverview } = this.props;

    let pluginCount;

    if (this.props.plugins) {
      pluginCount = `${this.props.plugins.length} 插件已安装`;
    }

    let inputCount;

    if (this.props.inputStates) {
      const runningInputs = this.props.inputStates.filter((inputState) => inputState.state.toUpperCase() === 'RUNNING');

      inputCount = `${runningInputs.length} 个接收器在此节点上运行`
    }

    return (
      <div>
        <Row className="content">
          <Col md={12}>
            <SystemOverviewDetails node={node} information={systemOverview} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2 style={{ marginBottom: 5 }}>内存/堆栈 使用率</h2>
            <JvmHeapUsage nodeId={node.node_id} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>缓冲区</h2>
            <p className="description">
              缓冲区用于在短时间缓存消息.
            </p>
            <Row>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="输入缓冲区" bufferType="input" />
              </Col>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="待处理缓冲区" bufferType="process" />
              </Col>
              <Col md={4}>
                <BufferUsage nodeId={node.node_id} title="输出缓冲区" bufferType="output" />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>磁盘队列</h2>
            <p className="description">
              日志消息会被写入磁盘队列.以确保它们在服务器发生故障的情况下,数据不会被丢失.
              该队列还有助于保证DataInsight正常工作.如果日志输出的速度太慢,或者在日志输入的高峰时期日志的处理速度跟不上输入的速度时,
              能确保DataInsight不在HEAP中缓存还未处理的日志,从而避免GC而导致的长时间宕机.
            </p>
            <JournalDetails nodeId={node.node_id} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={6}>
            <h2>系统信息</h2>
            <SystemInformation node={node} systemInformation={systemOverview} jvmInformation={this.props.jvmInformation} />
          </Col>
          <Col md={6}>
            <h2>REST API</h2>
            <RestApiOverview node={node} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <h2>已安装的插件 <small>{pluginCount}</small></h2>
            <PluginsDataTable plugins={this.props.plugins} />
          </Col>
        </Row>

        <Row className="content">
          <Col md={12}>
            <span className="pull-right">
              <LinkContainer to={Routes.node_inputs(node.node_id)}>
                <Button bsStyle="success" bsSize="small">管理接收器</Button>
              </LinkContainer>
            </span>
            <h2 style={{ marginBottom: 15 }}>可用的输入类型 <small>{inputCount}</small></h2>
            <InputTypesDataTable inputDescriptions={this.props.inputDescriptions} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default NodeOverview;
