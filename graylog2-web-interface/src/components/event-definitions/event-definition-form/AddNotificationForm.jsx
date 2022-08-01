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

import { Select } from 'components/common';
import { Button, ButtonToolbar, Col, ControlLabel, FormGroup, HelpBlock, Row } from 'components/bootstrap';
import EventNotificationFormContainer
  from 'components/event-notifications/event-notification-form/EventNotificationFormContainer';

import commonStyles from '../common/commonStyles.css';

class AddNotificationForm extends React.Component {
  static propTypes = {
    notifications: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    hasCreationPermissions: PropTypes.bool,
  };

  static defaultProps = {
    hasCreationPermissions: false,
  };

  state = {
    selectedNotification: undefined,
    displayNewNotificationForm: false,
  };

  handleNewNotificationSubmit = (promise) => {
    const { onChange } = this.props;

    promise.then((notification) => onChange(notification.id));
  };

  handleSubmit = () => {
    const { onChange } = this.props;
    const { selectedNotification } = this.state;

    onChange(selectedNotification);
  };

  handleSelectNotificationChange = (nextNotificationId) => {
    if (nextNotificationId === 'create') {
      this.setState({ displayNewNotificationForm: true });

      return;
    }

    this.setState({ selectedNotification: nextNotificationId, displayNewNotificationForm: false });
  };

  formatNotifications = (notifications) => {
    const { hasCreationPermissions } = this.props;
    const formattedNotifications = notifications.map((n) => ({ label: n.title, value: n.id }));

    if (hasCreationPermissions) {
      formattedNotifications.unshift({
        label: '创建告警通知...',
        value: 'create',
      });
    }

    return formattedNotifications;
  };

  render() {
    const { notifications, onCancel } = this.props;
    const { displayNewNotificationForm, selectedNotification } = this.state;
    const doneButton = displayNewNotificationForm
      ? <Button bsStyle="primary" type="submit" form="new-notification-form">完成</Button>
      : <Button bsStyle="primary" onClick={this.handleSubmit}>完成</Button>;

    return (
      <Row>
        <Col md={7} lg={6}>
          <h2 className={commonStyles.title}>新增告警通知</h2>

          <fieldset>
            <FormGroup controlId="notification-select">
              <ControlLabel>Choose Notification</ControlLabel>
              <Select id="notification-select"
                      matchProp="label"
                      placeholder="选择告警通知"
                      onChange={this.handleSelectNotificationChange}
                      options={this.formatNotifications(notifications)}
                      value={selectedNotification} />
              <HelpBlock>
                选择要在此类告警上使用的通知,或创建新的通知,以便以后在其他告警中使用.
              </HelpBlock>
            </FormGroup>

            {displayNewNotificationForm && (
              <EventNotificationFormContainer action="create"
                                              formId="new-notification-form"
                                              onSubmit={this.handleNewNotificationSubmit}
                                              embedded />
            )}
          </fieldset>

          <ButtonToolbar>
            {doneButton}
            <Button onClick={onCancel}>取消</Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
}

export default AddNotificationForm;
