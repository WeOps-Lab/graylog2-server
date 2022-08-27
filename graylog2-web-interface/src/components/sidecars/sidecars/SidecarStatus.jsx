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
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';

import { Col, Row, Button } from 'components/bootstrap';
import { Icon } from 'components/common';
import SidecarStatusEnum from 'logic/sidecar/SidecarStatusEnum';
import commonStyles from 'components/sidecars/common/CommonSidecarStyles.css';

import SidecarStatusFileList from './SidecarStatusFileList';
import VerboseMessageModal from './VerboseMessageModal';

const SidecarStatus = createReactClass({
  propTypes: {
    sidecar: PropTypes.object.isRequired,
    collectors: PropTypes.array.isRequired,
  },

  getInitialState() {
    return { collectorName: '', collectorVerbose: '' };
  },

  formatNodeDetails(details) {
    if (!details) {
      return <p>节点信息不可用.请稍候,并确保客户端已正确连接服务器.</p>;
    }

    const metrics = details.metrics || {};

    return (
      <dl className={`${commonStyles.deflist} ${commonStyles.topMargin}`}>
        <dt>IP地址</dt>
        <dd>{lodash.defaultTo(details.ip, '不可用')}</dd>
        <dt>操作系统</dt>
        <dd>{lodash.defaultTo(details.operating_system, '不可用')}</dd>
        <dt>CPU空闲</dt>
        <dd>{lodash.isNumber(metrics.cpu_idle) ? `${metrics.cpu_idle}%` : '不可用'}</dd>
        <dt>负载</dt>
        <dd>{lodash.defaultTo(metrics.load_1, '不可用')}</dd>
        <dt>容量 &gt; 75% </dt>
        {metrics.disks_75 === undefined
          ? <dd>不可用</dd>
          : <dd>{metrics.disks_75.length > 0 ? metrics.disks_75.join(', ') : '无'}</dd>}
      </dl>
    );
  },

  formatCollectorStatus(details, collectors) {
    if (!details || !collectors) {
      return <p>采集器不可用.请稍候,并确保客户端已正确连接服务器.</p>;
    }

    if (!details.status) {
      return <p>没有接收到采集器状态,在配置中设置<code>send_status: true</code>查看这个信息.</p>;
    }

    const collectorStatuses = details.status.collectors;

    if (collectorStatuses.length === 0) {
      return <p>客户端没有配置采集器.</p>;
    }

    const statuses = [];

    collectorStatuses.forEach((status) => {
      const collector = collectors.find((c) => c.id === status.collector_id);

      let statusMessage;
      let statusBadge;
      let statusClass;
      let verboseButton;

      switch (status.status) {
        case SidecarStatusEnum.RUNNING:
          statusMessage = '采集器运行中.';
          statusClass = 'text-success';
          statusBadge = <Icon name="play" fixedWidth />;
          break;
        case SidecarStatusEnum.FAILING:
          statusMessage = status.message;
          statusClass = 'text-danger';
          statusBadge = <Icon name="exclamation-triangle" fixedWidth />;

          if (status.verbose_message) {
            verboseButton = (
              <Button bsStyle="link"
                      bsSize="xs"
                      onClick={() => this._onShowVerbose(collector.name, status.verbose_message)}>
                查看详情
              </Button>
            );
          }

          break;
        case SidecarStatusEnum.STOPPED:
          statusMessage = status.message;
          statusClass = 'text-danger';
          statusBadge = <Icon name="stop" fixedWidth />;
          break;
        default:
          statusMessage = '采集器状态未知.';
          statusClass = 'text-info';
          statusBadge = <Icon name="question-circle" fixedWidth />;
      }

      if (collector) {
        statuses.push(
          <dt key={`${collector.id}-key`} className={statusClass}>{collector.name}</dt>,
          <dd key={`${collector.id}-description`} className={statusClass}>{statusBadge}&ensp;{statusMessage}&ensp;{verboseButton}</dd>,
        );
      }
    });

    return (
      <dl className={commonStyles.deflist}>
        {statuses}
      </dl>
    );
  },

  _onShowVerbose(name, verbose) {
    this.setState({ collectorName: name, collectorVerbose: verbose });
    this.modal.open();
  },

  render() {
    const { sidecar } = this.props;

    const logFileList = sidecar.node_details.log_file_list || [];

    return (
      <div>
        <Row className="content">
          <Col md={12}>
            <h2>节点信息</h2>
            {this.formatNodeDetails(sidecar.node_details)}
          </Col>
        </Row>
        <Row className="content">
          <Col md={12}>
            <h2>采集器状态</h2>
            <div className={commonStyles.topMargin}>
              {this.formatCollectorStatus(sidecar.node_details, this.props.collectors)}
            </div>
          </Col>
        </Row>
        <Row className="content" hidden={logFileList.length === 0}>
          <Col md={12}>
            <h2>日志文件</h2>
            <p className={commonStyles.topMargin}>最近修改的文件将以蓝色高亮显示.</p>
            <div>
              <SidecarStatusFileList files={logFileList} />
            </div>
          </Col>
        </Row>
        <VerboseMessageModal ref={(c) => { this.modal = c; }}
                             collectorName={this.state.collectorName}
                             collectorVerbose={this.state.collectorVerbose} />
      </div>
    );
  },

});

export default SidecarStatus;
