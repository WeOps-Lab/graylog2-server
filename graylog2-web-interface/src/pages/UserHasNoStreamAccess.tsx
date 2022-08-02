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

import { DocumentTitle, Icon } from 'components/common';
import { Alert, Row, Col } from 'components/bootstrap';
import PageHeader from 'components/common/PageHeader';
import PageContentLayout from 'components/layout/PageContentLayout';

const UserHasNoStreamAccess = () => (
  <DocumentTitle title="没有消息流权限.">
    <PageContentLayout>
      <PageHeader title="没有消息流权限." />
      <Row className="content">
        <Col md={12}>
          <Alert bsStyle="warning">
            <Icon name="info-circle" />&nbsp;我们现在无法开始搜索，因为您无权访问任何消息流。
            如果您认为这是一个错误，请联系您的管理员。
          </Alert>
        </Col>
      </Row>
    </PageContentLayout>
  </DocumentTitle>
);

export default UserHasNoStreamAccess;
