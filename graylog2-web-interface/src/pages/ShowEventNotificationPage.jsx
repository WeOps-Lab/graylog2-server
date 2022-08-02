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
import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import ErrorsActions from 'actions/errors/ErrorsActions';
import CurrentUserContext from 'contexts/CurrentUserContext';
import { LinkContainer } from 'components/common/router';
import { ButtonToolbar, Button } from 'components/bootstrap';
import { createFromFetchError } from 'logic/errors/ReportedErrors';
import { DocumentTitle, IfPermitted, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { isPermitted } from 'util/PermissionsMixin';
import history from 'util/History';
import withParams from 'routing/withParams';
import EventNotificationDetails from 'components/event-notifications/event-notification-details/EventNotificationDetails';
import EventNotificationActionLinks from 'components/event-notifications/event-notification-details/EventNotificationActionLinks';
import { EventNotificationsActions } from 'stores/event-notifications/EventNotificationsStore';

import {} from 'components/event-notifications/event-notification-types';

const ShowEventDefinitionPage = ({ params: { notificationId } }) => {
  const currentUser = useContext(CurrentUserContext) || {};
  const [notification, setNotification] = useState();

  useEffect(() => {
    EventNotificationsActions.get(notificationId).then(
      setNotification,
      (error) => {
        if (error.status === 404) {
          ErrorsActions.report(createFromFetchError(error));
        }
      },
    );
  }, [notificationId]);

  if (!isPermitted(currentUser.permissions, `eventnotifications:read:${notificationId}`)) {
    history.push(Routes.NOTFOUND);
  }

  if (!notification) {
    return (
      <DocumentTitle title="通知详情">
        <span>
          <PageHeader title="通知详情">
            <Spinner text="加载通知详情..." />
          </PageHeader>
        </span>
      </DocumentTitle>
    );
  }

  return (
    <DocumentTitle title={`查看 "${notification.title}" 通知`}>
      <span>
        <PageHeader title={`查看 "${notification.title}" 通知`} subactions={notification && <EventNotificationActionLinks notificationId={notification.id} />}>
          <span>
            通知会在发生任何已配置事件时提醒您。 DataInsight 可以直接发送通知
            给您或您为此目的使用的其他系统。
          </span>

          <span>
            查看{' '}
            <DocumentationLink page={DocsHelper.PAGES.ALERTS}
                               text="文档" />
          </span>

          <ButtonToolbar>
            <LinkContainer to={Routes.ALERTS.LIST}>
              <Button bsStyle="info">告警 & 事件</Button>
            </LinkContainer>
            <IfPermitted permissions="eventdefinitions:read">
              <LinkContainer to={Routes.ALERTS.DEFINITIONS.LIST}>
                <Button bsStyle="info">事件规则</Button>
              </LinkContainer>
            </IfPermitted>
            <IfPermitted permissions="eventnotifications:read">
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.LIST}>
                <Button bsStyle="info">通知</Button>
              </LinkContainer>
            </IfPermitted>
          </ButtonToolbar>
        </PageHeader>

        <EventNotificationDetails notification={notification} />

      </span>
    </DocumentTitle>
  );
};

ShowEventDefinitionPage.propTypes = {
  params: PropTypes.object.isRequired,
};

export default withParams(ShowEventDefinitionPage);
