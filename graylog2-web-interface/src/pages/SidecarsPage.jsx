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
import { useEffect, useState, useContext } from 'react';

import { LinkContainer, Link } from 'components/common/router';
import { ButtonToolbar, Col, Row, Button } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { isPermitted } from 'util/PermissionsMixin';
import CurrentUserContext from 'contexts/CurrentUserContext';
import UsersDomain from 'domainActions/users/UsersDomain';
import SidecarListContainer from 'components/sidecars/sidecars/SidecarListContainer';
import Routes from 'routing/Routes';

const SidecarsPage = () => {
  const [sidecarUser, setSidecarUser] = useState();
  const currentUser = useContext(CurrentUserContext);
  const canCreateSidecarUserTokens = isPermitted(currentUser?.permissions, ['users:tokenlist:graylog-sidecar']);

  useEffect(() => {
    if (canCreateSidecarUserTokens) {
      UsersDomain.loadByUsername('graylog-sidecar').then(setSidecarUser);
    }
  }, [canCreateSidecarUserTokens]);

  return (
    <DocumentTitle title="客户端">
      <span>
        <PageHeader title="客户端概览">
          <span>
            DataInsight客户端中的客户端管理器可以帮助您管理采集器,将数据通过采集器发送到DataInsight
          </span>

          {canCreateSidecarUserTokens && (
            <>
              {sidecarUser ? (
                <span>
                  您需要为DataInsight客户端创建访问API的Token&ensp;
                  <Link to={Routes.SYSTEM.USERS.TOKENS.edit(sidecarUser.id)}>
                    为 <em>sidecar</em> 用户创建或重用令牌
                  </Link>
                </span>
              ) : <Spinner />}
            </>
          )}

          <ButtonToolbar>
            <LinkContainer to={Routes.SYSTEM.SIDECARS.OVERVIEW}>
              <Button bsStyle="info">概览</Button>
            </LinkContainer>
            <LinkContainer to={Routes.SYSTEM.SIDECARS.ADMINISTRATION}>
              <Button bsStyle="info">客户端管理</Button>
            </LinkContainer>
            <LinkContainer to={Routes.SYSTEM.SIDECARS.CONFIGURATION}>
              <Button bsStyle="info">采集器配置</Button>
            </LinkContainer>
          </ButtonToolbar>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <SidecarListContainer />
          </Col>
        </Row>
      </span>
    </DocumentTitle>
  );
};

export default SidecarsPage;
