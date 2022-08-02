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
import { useState, useEffect } from 'react';

import AuthenticationOverviewLinks from 'components/authentication/AuthenticationOverviewLinks';
import withParams from 'routing/withParams';
import { LinkContainer } from 'components/common/router';
import {} from 'components/authentication/bindings'; // Bind all authentication plugins
import DocsHelper from 'util/DocsHelper';
import StringUtils from 'util/StringUtils';
import AuthenticationDomain from 'domainActions/authentication/AuthenticationDomain';
import { Spinner, PageHeader, DocumentTitle } from 'components/common';
import BackendDetails from 'components/authentication/BackendDetails';
import DocumentationLink from 'components/support/DocumentationLink';
import Routes from 'routing/Routes';
import { Button } from 'components/bootstrap';
import type AuthenticationBackend from 'logic/authentication/AuthenticationBackend';

type Props = {
  params: {
    backendId: string,
  },
};

const _pageTitle = (authBackendTitle, returnString = false) => {
  const pageName = '认证服务详情';
  const backendTitle = StringUtils.truncateWithEllipses(authBackendTitle, 30);

  if (returnString) {
    return `${pageName} - ${backendTitle}`;
  }

  return <>{pageName} - <i>{backendTitle}</i></>;
};

const AuthenticationBackendDetailsPage = ({ params: { backendId } }: Props) => {
  const [authBackend, setAuthBackend] = useState<AuthenticationBackend | undefined>();

  useEffect(() => {
    AuthenticationDomain.load(backendId).then((response) => setAuthBackend(response.backend));
  }, [backendId]);

  if (!authBackend) {
    return <Spinner />;
  }

  return (
    <DocumentTitle title={_pageTitle(authBackend.title, true)}>
      <>
        <PageHeader title={_pageTitle(authBackend.title)}
                    subactions={(
                      <LinkContainer to={Routes.SYSTEM.AUTHENTICATION.BACKENDS.edit(authBackend?.id)}>
                        <Button bsStyle="success"
                                type="button">
                          编辑服务
                        </Button>
                      </LinkContainer>
                  )}>
          <span>配置此 DataInsight 集群的身份验证服务。</span>
          <span>查看 <DocumentationLink page={DocsHelper.PAGES.USERS_ROLES}
                                                                   text="文档" />.
          </span>
          <AuthenticationOverviewLinks />
        </PageHeader>
        <BackendDetails authenticationBackend={authBackend} />
      </>
    </DocumentTitle>
  );
};

export default withParams(AuthenticationBackendDetailsPage);
