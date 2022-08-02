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

import AuthenticationOverviewLinks from 'components/authentication/AuthenticationOverviewLinks';
import AuthenticatorActionLinks from 'components/authentication/AuthenticatorActionLinks';
import AuthenticatorsDetails from 'components/authentication/AuthenticatorsDetails';
import { PageHeader, DocumentTitle } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

const AuthenticatorsPage = () => (
  <DocumentTitle title="身份验证器详细信息">
    <PageHeader title="身份验证器详细信息" subactions={<AuthenticatorActionLinks />}>
      <span>
        配置可信Header认证
      </span>

      <span>
        查看{' '}
        <DocumentationLink page={DocsHelper.PAGES.AUTHENTICATORS}
                           text="文档" />
      </span>

      <AuthenticationOverviewLinks />

    </PageHeader>

    <AuthenticatorsDetails />
  </DocumentTitle>
);

export default AuthenticatorsPage;
