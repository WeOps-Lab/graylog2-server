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

import { LinkContainer } from 'components/common/router';
import { Button, ButtonToolbar, Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import EventNotificationsContainer from 'components/event-notifications/event-notifications/EventNotificationsContainer';
import Routes from 'routing/Routes';

const EventNotificationsPage = () => {
  return (
    <DocumentTitle title="通知">
      <span>
        <PageHeader title="通知">
          <span>
              通知会在任何配置好的事件触发时给您发送告警。DataInsight可以发送通知给您或您指定的第三方平台。
          </span>

          <span>
              请记得要在告警条件页面中分配通知。
          </span>

          <ButtonToolbar>
            <LinkContainer to={Routes.ALERTS.LIST}>
               <Button bsStyle="info">告警 & 事件</Button>
            </LinkContainer>
            <LinkContainer to={Routes.ALERTS.DEFINITIONS.LIST}>
              <Button bsStyle="info">事件规则</Button>
            </LinkContainer>
            <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.LIST}>
              <Button bsStyle="info" className="active">通知</Button>
            </LinkContainer>
          </ButtonToolbar>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <EventNotificationsContainer />
          </Col>
        </Row>
      </span>
    </DocumentTitle>
  );
};

export default EventNotificationsPage;
