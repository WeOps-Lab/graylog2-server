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

import { LinkContainer } from 'components/common/router';
import RolesOverview from 'components/roles/RolesOverview';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { Button, Row, Col, Alert } from 'components/bootstrap';
import { PageHeader, DocumentTitle, Icon } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';

const RolesOverviewPage = () => (
  <DocumentTitle title="角色概览">
    <PageHeader title="角色概览">
      <span>DataInsight 的角色概述, 角色允许向用户授予功能，例如创建仪表板或事件定义。</span>

      <span>
        查看{' '}
        <DocumentationLink page={DocsHelper.PAGES.USERS_ROLES}
                           text="文档" />
      </span>

      <LinkContainer to={Routes.SYSTEM.AUTHZROLES.OVERVIEW}>
        <Button bsStyle="info">角色概览</Button>
      </LinkContainer>
    </PageHeader>

    <Row className="content">
      <Col xs={12}>
        <Alert bsStyle="info">
          <Icon name="info-circle" />{' '}<b>授予权限</b><br />
          内置角色仍然允许向用户授予功能，例如创建仪表板或查看存档目录。
          但他们不再授予特定仪表板或流的权限。也无法创建自己的角色。
          现在可以通过使用其<b><Icon name="user-plus" /> 分享 </b> 按钮来授予特定实体的权限。您可以找到按钮，例如在实体概览页面上。
          如果您想一次将一个实体的权限授予多个用户，您可以使用团队。
          在 <DocumentationLink page={DocsHelper.PAGES.PERMISSIONS} text="文档" /> 中了解更多信息.
        </Alert>
      </Col>
    </Row>

    <RolesOverview />
  </DocumentTitle>
);

export default RolesOverviewPage;
