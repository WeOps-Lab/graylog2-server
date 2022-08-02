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

import { AuthenticationActions } from 'stores/authentication/AuthenticationStore';
import {} from 'components/authentication/bindings'; // Bind all authentication plugins
import { Alert, Row, Col } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Icon } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';
import BackendsOverview from 'components/authentication/BackendsOverview';
import AuthenticationOverviewLinks from 'components/authentication/AuthenticationOverviewLinks';
import BackendActionLinks from 'components/authentication/BackendActionLinks';
import useActiveBackend from 'components/authentication/useActiveBackend';

const AuthenticationOverviewPage = () => {
  const { finishedLoading, activeBackend, backendsTotal } = useActiveBackend([AuthenticationActions.setActiveBackend]);

  return (
    <DocumentTitle title="所有身份验证服务">
      <>
        <PageHeader title="所有身份验证服务"
                    subactions={(
                      <BackendActionLinks activeBackend={activeBackend}
                                          finishedLoading={finishedLoading} />
                  )}>
          <span>配置此 DataInsight 集群的身份验证服务。</span>
          <span>查看 <DocumentationLink page={DocsHelper.PAGES.USERS_ROLES}
                                                                   text="文档" />.
          </span>
          <AuthenticationOverviewLinks />
        </PageHeader>
        {!!(backendsTotal && backendsTotal >= 1 && !activeBackend) && (
        <Row className="content">
          <Col xs={12}>
            <Alert bsStyle="warning">
              <Icon name="exclamation-circle" /> 当前没有任何已配置的身份验证服务处于活动状态。
            </Alert>
          </Col>
        </Row>
        )}
        <BackendsOverview />
      </>
    </DocumentTitle>
  );
};

export default AuthenticationOverviewPage;
