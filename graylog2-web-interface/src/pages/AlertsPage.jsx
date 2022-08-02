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

import {Col, Row} from 'components/bootstrap';
import {AlertsComponent, AlertsHeaderToolbar} from 'components/alerts';
import DocumentationLink from 'components/support/DocumentationLink';
import {DocumentTitle, PageHeader} from 'components/common';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import {CurrentUserStore} from 'stores/users/CurrentUserStore';

const AlertsPage = createReactClass({
  displayName: 'AlertsPage',
  mixins: [Reflux.connect(CurrentUserStore)],

  render() {
    return (
      <DocumentTitle title="告警">
        <div>
          <PageHeader title="告警概览">
            <span>
              告警将在满足您定义的条件时触发。当告警恢复时，DataInsight会自动将告警标记为已解决。
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档"/>中查看更多关于告警的信息。
            </span>

            <span>
              <AlertsHeaderToolbar active={Routes.LEGACY_ALERTS.LIST}/>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <AlertsComponent/>
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default AlertsPage;
