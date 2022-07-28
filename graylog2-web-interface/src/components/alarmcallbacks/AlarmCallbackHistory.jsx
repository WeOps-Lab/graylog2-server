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

import { Alert, Col, Label } from 'components/bootstrap';
import { EntityListItem, Timestamp } from 'components/common';
import { ConfigurationWell } from 'components/configurationforms';
import DateTime from 'logic/datetimes/DateTime';

class AlarmCallbackHistory extends React.Component {
  static propTypes = {
    types: PropTypes.object.isRequired,
    alarmCallbackHistory: PropTypes.object.isRequired,
  };

  render() {
    const history = this.props.alarmCallbackHistory;
    const configuration = history.alarmcallbackconfiguration;
    const type = this.props.types[configuration.type];

    const hadError = history.result.type === 'error';
    const result = (hadError ? <Label bsStyle="danger">错误</Label> : <Label bsStyle="success">已发送</Label>);

    const title = (
      <span>
        {type ? configuration.title || '无标题通知类型' : '未知通知类型'}
        {' '}
        <small>({type ? type.name : configuration.type})</small>
      </span>
    );
    const description = (hadError
      ? <span>在 <Timestamp dateTime={history.created_at} />发送告警通知失败:  {history.result.error}</span>
      : <span>在 <Timestamp dateTime={history.created_at} />发送告警通知成功.</span>);

    let configurationWell;
    let configurationInfo;

    if (type) {
      configurationWell = <ConfigurationWell configuration={configuration.configuration} typeDefinition={type} />;
    } else {
      configurationInfo = (
        <Alert bsStyle="warning">
          没有找到适合此通知的插件，不加载其显示配置
        </Alert>
      );
    }

    const content = (
      <Col md={12}>
        {configurationInfo}
        <div className="alert-callback">
          {configurationWell}
        </div>
      </Col>
    );

    return (
      <EntityListItem title={title} titleSuffix={result} description={description} contentRow={content} />
    );
  }
}

export default AlarmCallbackHistory;
