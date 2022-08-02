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

import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';
import { Col, Row, Alert } from 'components/bootstrap';
import { Icon } from 'components/common';

const PermissionsUpdateInfo = () => (
  <Row className="content">
    <Col xs={12}>
      <Alert bsStyle="info">
        <Icon name="info-circle" />{' '}<b>授予权限</b><br />
        授予流和仪表板等实体的权限不再是用户编辑页面的一部分。
        现在可以使用 <b><Icon name="user-plus" /> 分享</b> 按钮对其进行配置。您可以找到按钮，例如在权限概览页面上。在 <DocumentationLink page={DocsHelper.PAGES.PERMISSIONS} text="文档" /> 中了解更多信息。
      </Alert>
    </Col>
  </Row>
);

export default PermissionsUpdateInfo;
