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
import Reflux from 'reflux';

import { Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import { AlertsHeaderToolbar } from 'components/alerts';
import { AlertNotificationsComponent } from 'components/alertnotifications';
import Routes from 'routing/Routes';
import { CurrentUserStore } from 'stores/users/CurrentUserStore';

const AlertNotificationsPage = createReactClass({
  displayName: 'AlertNotificationsPage',
  mixins: [Reflux.connect(CurrentUserStore)],

  render() {
    return (
      <DocumentTitle title="告警通知">
        <div>
          <PageHeader title="管理告警通知">
            <span>
              告警通知让您随时了解告警状态的变化。DataInsight可以将告警信息发送给您或您指定的第三方平台。
            </span>

            <span>
              请记得要在告警条件页面中分配通知。
            </span>

            <span>
              <AlertsHeaderToolbar active={Routes.LEGACY_ALERTS.NOTIFICATIONS} />
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <AlertNotificationsComponent />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default AlertNotificationsPage;
