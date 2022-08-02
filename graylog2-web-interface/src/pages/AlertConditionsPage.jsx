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
import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader } from 'components/common';
import { AlertsHeaderToolbar } from 'components/alerts';
import { AlertConditionsComponent } from 'components/alertconditions';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { CurrentUserStore } from 'stores/users/CurrentUserStore';

const AlertConditionsPage = createReactClass({
  displayName: 'AlertConditionsPage',
  mixins: [Reflux.connect(CurrentUserStore)],

  render() {
    return (
      <DocumentTitle title="告警条件">
        <div>
          <PageHeader title="管理告警条件">
            <span>
              告警条件定义了您需要告警的场景.DataInsight会定期检查告警条件并在满足告警条件的时候通知您.
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />中查看更多关于告警的信息.
            </span>

            <span>
              <AlertsHeaderToolbar active={Routes.LEGACY_ALERTS.CONDITIONS} />
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <AlertConditionsComponent />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default AlertConditionsPage;
