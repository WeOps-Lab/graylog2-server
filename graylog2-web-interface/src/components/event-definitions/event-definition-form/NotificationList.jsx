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
import { PluginStore } from 'graylog-web-plugin/plugin';

import { Button } from 'components/bootstrap';
import { DataTable } from 'components/common';

class NotificationList extends React.Component {
  static propTypes = {
    eventDefinition: PropTypes.object.isRequired,
    notifications: PropTypes.array.isRequired,
    onAddNotificationClick: PropTypes.func.isRequired,
    onRemoveNotificationClick: PropTypes.func.isRequired,
  };

  getNotificationPlugin = (type) => {
    if (type === undefined) {
      return {};
    }

    return PluginStore.exports('eventNotificationTypes').find((n) => n.type === type) || {};
  };

  handleRemoveClick = (notificationId) => {
    return () => {
      const { onRemoveNotificationClick } = this.props;

      onRemoveNotificationClick(notificationId);
    };
  };

  notificationFormatter = (notification) => {
    // Guard in case it is a new Notification or the Notification was deleted
    if (notification.missing) {
      return (
        <tr>
          <td colSpan={2}>找不到通知信息 <em>{notification.title}</em></td>
          <td className="actions">
            <Button bsStyle="info" bsSize="xsmall" onClick={this.handleRemoveClick(notification.title)}>
              从事件移除
            </Button>
          </td>
        </tr>
      );
    }

    const plugin = this.getNotificationPlugin(notification.config.type);

    return (
      <tr key={notification.id}>
        <td>{notification.title}</td>
        <td>{plugin.displayName || notification.config.type}</td>
        <td className="actions">
          <Button bsStyle="info" bsSize="xsmall" onClick={this.handleRemoveClick(notification.id)}>
            从事件移除
          </Button>
        </td>
      </tr>
    );
  };

  render() {
    const { eventDefinition, notifications, onAddNotificationClick } = this.props;

    const definitionNotifications = eventDefinition.notifications
      .map((edn) => {
        return notifications.find((n) => n.id === edn.notification_id) || {
          title: edn.notification_id,
          missing: true,
        };
      });
    const addNotificationButton = (
      <Button bsStyle="success" onClick={onAddNotificationClick}>
        新增通知
      </Button>
    );

    if (definitionNotifications.length === 0) {
      return (
        <>
          <p>
            此事件未配置任何通知.
          </p>
          {addNotificationButton}
        </>
      );
    }

    return (
      <>
        <DataTable id="event-definition-notifications"
                   className="table-striped table-hover"
                   headers={['通知', '类型', '操作']}
                   sortByKey="title"
                   rows={definitionNotifications}
                   dataRowFormatter={this.notificationFormatter}
                   filterKeys={[]} />
        {addNotificationButton}
      </>
    );
  }
}

export default NotificationList;
