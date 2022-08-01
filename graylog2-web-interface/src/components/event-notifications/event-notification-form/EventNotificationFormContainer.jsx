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
import lodash from 'lodash';

import { ConfirmLeaveDialog } from 'components/common';
import history from 'util/History';
import Routes from 'routing/Routes';
import { EventNotificationsActions } from 'stores/event-notifications/EventNotificationsStore';

import EventNotificationForm from './EventNotificationForm';

// Import built-in Event Notification Types

import {} from '../event-notification-types';

const initialValidation = {
  errors: {},
};

const initialTestResult = {
  isLoading: false,
};

class EventNotificationFormContainer extends React.Component {
  static propTypes = {
    action: PropTypes.oneOf(['create', 'edit']),
    notification: PropTypes.object,
    /** Controls whether the form should be embedded into another one, and submitted/cancel externally */
    embedded: PropTypes.bool,
    /** Controls the ID of the form, so it can be controlled externally */
    formId: PropTypes.string,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    action: 'edit',
    notification: {
      title: '',
      description: '',
      config: {},
    },
    embedded: false,
    formId: undefined,
    onSubmit: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      notification: props.notification,
      validation: initialValidation,
      testResult: initialTestResult,
      isDirty: false,
    };
  }

  componentWillUnmount() {
    // Test request may take a while to return a result, cancel the promise before leaving the page.
    if (this.testPromise) {
      this.testPromise.cancel();
    }
  }

  handleChange = (key, value) => {
    const { notification } = this.state;
    const nextNotification = lodash.cloneDeep(notification);

    nextNotification[key] = value;
    this.setState({ notification: nextNotification, isDirty: true, testResult: initialTestResult });
  };

  handleCancel = () => {
    history.push(Routes.ALERTS.NOTIFICATIONS.LIST);
  };

  handleSubmit = () => {
    const { action, embedded, onSubmit } = this.props;
    const { notification } = this.state;

    let promise;

    if (action === 'create') {
      promise = EventNotificationsActions.create(notification);

      promise.then(
        () => {
          this.setState({ isDirty: false }, () => {
            if (!embedded) {
              history.push(Routes.ALERTS.NOTIFICATIONS.LIST);
            }
          });
        },
        (errorResponse) => {
          const { body } = errorResponse.additional;

          if (errorResponse.status === 400 && body && body.failed) {
            this.setState({ validation: body });
          }
        },
      );
    } else {
      promise = EventNotificationsActions.update(notification.id, notification);

      promise.then(
        () => {
          this.setState({ isDirty: false }, () => {
            if (!embedded) {
              history.push(Routes.ALERTS.NOTIFICATIONS.LIST);
            }
          });
        },
        (errorResponse) => {
          const { body } = errorResponse.additional;

          if (errorResponse.status === 400 && body && body.failed) {
            this.setState({ validation: body });
          }
        },
      );
    }

    onSubmit(promise);
  };

  handleTest = () => {
    const { notification } = this.state;

    this.setState({ testResult: { isLoading: true }, validation: initialValidation });
    const testResult = lodash.clone(initialTestResult);

    this.testPromise = EventNotificationsActions.test(notification);

    this.testPromise
      .then(
        (response) => {
          testResult.error = false;
          testResult.message = '通知执行成功.';

          return response;
        },
        (errorResponse) => {
          testResult.error = true;
          const { body } = errorResponse.additional;

          if (errorResponse.status === 400 && body && body.failed) {
            testResult.message = '校验失败.';
            this.setState({ validation: body });
          } else {
            testResult.message = errorResponse.responseMessage || '未知错误.';
          }
        },
      )
      .finally(() => {
        this.setState({ testResult: testResult });
        this.testPromise = undefined;
      });
  };

  render() {
    const { action, embedded, formId } = this.props;
    const { notification, validation, testResult, isDirty } = this.state;

    return (
      <>
        {!embedded && isDirty && (
          <ConfirmLeaveDialog question="确认要放弃此页的修改." />
        )}
        <EventNotificationForm action={action}
                               notification={notification}
                               validation={validation}
                               testResult={testResult}
                               formId={formId}
                               embedded={embedded}
                               onChange={this.handleChange}
                               onCancel={this.handleCancel}
                               onSubmit={this.handleSubmit}
                               onTest={this.handleTest} />
      </>
    );
  }
}

export default EventNotificationFormContainer;
