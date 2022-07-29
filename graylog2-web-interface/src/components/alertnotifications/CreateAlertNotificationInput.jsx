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
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import naturalSort from 'javascript-natural-sort';

import { ExternalLinkButton, Select, Spinner } from 'components/common';
import { Col, Row, Button, Input } from 'components/bootstrap';
import { ConfigurationForm } from 'components/configurationforms';
import Routes from 'routing/Routes';
import UserNotification from 'util/UserNotification';
import history from 'util/History';
import { AlarmCallbacksActions } from 'stores/alarmcallbacks/AlarmCallbacksStore';
import { AlertNotificationsStore, AlertNotificationsActions } from 'stores/alertnotifications/AlertNotificationsStore';
import { StreamsStore } from 'stores/streams/StreamsStore';

const CreateAlertNotificationInput = createReactClass({
  displayName: 'CreateAlertNotificationInput',
  propTypes: {
    initialSelectedStream: PropTypes.string,
  },
  mixins: [Reflux.connect(AlertNotificationsStore)],

  getDefaultProps() {
    return {
      initialSelectedStream: undefined,
    };
  },

  getInitialState() {
    return {
      streams: undefined,
      selectedStream: undefined,
      type: this.PLACEHOLDER,
    };
  },

  componentDidMount() {
    StreamsStore.listStreams().then((streams) => {
      const nextState = { streams: streams };
      const { initialSelectedStream } = this.props;

      if (initialSelectedStream) {
        nextState.selectedStream = this._findStream(streams, initialSelectedStream);
      }

      this.setState(nextState);
    });

    AlertNotificationsActions.available();
  },

  PLACEHOLDER: 'placeholder',

  _onChange(evt) {
    this.setState({ type: evt.target.value });
  },

  _findStream(streams, streamId) {
    return streams.find((s) => s.id === streamId);
  },

  _onStreamChange(nextStream) {
    const { streams } = this.state;

    this.setState({ selectedStream: this._findStream(streams, nextStream) });
  },

  _onSubmit(data) {
    const { selectedStream } = this.state;

    if (!selectedStream) {
      UserNotification.error('请选择需要告警的消息流.', '无法保存告警条件');
    }

    AlarmCallbacksActions.save(selectedStream.id, data).then(
      () => history.push(Routes.stream_alerts(selectedStream.id)),
      () => this.configurationForm.open(),
    );
  },

  _openForm() {
    this.configurationForm.open();
  },

  _resetForm() {
    this.setState({ type: this.PLACEHOLDER });
  },

  _formatNotificationForm(type) {
    const { availableNotifications } = this.state;
    const typeDefinition = availableNotifications[type];

    return (
      <ConfigurationForm ref={(configurationForm) => { this.configurationForm = configurationForm; }}
                         key="configuration-form-output"
                         configFields={typeDefinition.requested_configuration}
                         title={`创建新的 ${typeDefinition.name}`}
                         typeName={type}
                         submitAction={this._onSubmit}
                         cancelAction={this._resetForm} />
    );
  },

  _formatOption(key, value) {
    return { value: value, label: key };
  },

  _isLoading() {
    const { availableNotifications, streams } = this.state;

    return !availableNotifications || !streams;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { type, availableNotifications, streams, selectedStream } = this.state;

    const notificationForm = (type !== this.PLACEHOLDER ? this._formatNotificationForm(type) : null);
    const availableTypes = Object.keys(availableNotifications).map((value) => {
      return (
        <option key={`type-option-${value}`} value={value}>
          {availableNotifications[value].name}
        </option>
      );
    });
    const formattedStreams = streams
      .map((stream) => this._formatOption(stream.title, stream.id))
      .sort((s1, s2) => naturalSort(s1.label.toLowerCase(), s2.label.toLowerCase()));

    const notificationTypeHelp = (
      <span>
        选择告警通知类型. 你可以在{' '}
        <a href="" target="_blank" rel="noopener noreferrer">DataInsight市场</a>查找更多告警通知类型.
      </span>
    );

    return (
      <div>
        <ExternalLinkButton href=""
                            bsStyle="info"
                            className="pull-right">
          查找更多告警通知
        </ExternalLinkButton>

        <h2>告警通知</h2>
        <p className="description">
          定义消息流告警触发时的通知方式.
        </p>

        <Row>
          <Col md={6}>
            <form>
              <Input id="stream-selector"
                     label="消息流告警通知"
                     help="选择一个消息流，当触发告警的时候，会采用对应的告警通知.">
                <Select placeholder="选择一个消息流"
                        options={formattedStreams}
                        onChange={this._onStreamChange}
                        value={selectedStream ? selectedStream.id : undefined} />
              </Input>

              <Input id="notification-type-selector"
                     type="select"
                     value={type}
                     onChange={this._onChange}
                     disabled={!selectedStream}
                     label="告警通知类型"
                     help={notificationTypeHelp}>
                <option value={this.PLACEHOLDER} disabled>选择告警通知类型</option>
                {availableTypes}
              </Input>
              {notificationForm}
              {' '}
              <Button onClick={this._openForm} disabled={type === this.PLACEHOLDER} bsStyle="success">
                新增告警通知
              </Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  },
});

export default CreateAlertNotificationInput;
