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
import { useEffect, useState } from 'react';

import withParams from 'routing/withParams';
import { LinkContainer } from 'components/common/router';
import RoleEdit from 'components/roles/RoleEdit';
import Routes from 'routing/Routes';
import RoleActionLinks from 'components/roles/navigation/RoleActionLinks';
import { Button } from 'components/bootstrap';
import { AuthzRolesActions } from 'stores/roles/AuthzRolesStore';
import DocsHelper from 'util/DocsHelper';
import { PageHeader, DocumentTitle } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import type Role from 'logic/roles/Role';

type Props = {
  params: {
    roleId: string,
  },
};

const PageTitle = ({ name }: { name: string | undefined | null }) => (
  <>
    编辑角色 {name && (
      <>
        - <i>{name}</i>
      </>
  )}
  </>
);

const RoleEditPage = ({ params }: Props) => {
  const [loadedRole, setLoadedRole] = useState<Role | undefined>();
  const roleId = params?.roleId;

  useEffect(() => {
    AuthzRolesActions.load(roleId).then(setLoadedRole);
  }, [roleId]);

  return (
    <DocumentTitle title={`编辑角色 ${loadedRole?.name ?? ''}`}>
      <PageHeader title={<PageTitle name={loadedRole?.name} />}
                  subactions={<RoleActionLinks roleId={roleId} />}>
        <span>
          您可以将角色分配给用户
        </span>
        <span>
          查看{' '}
          <DocumentationLink page={DocsHelper.PAGES.USERS_ROLES}
                             text="文档" />
        </span>
        <LinkContainer to={Routes.SYSTEM.AUTHZROLES.OVERVIEW}>
          <Button bsStyle="info">角色概览</Button>
        </LinkContainer>
      </PageHeader>
      <RoleEdit role={roleId === loadedRole?.id ? loadedRole : undefined} />
    </DocumentTitle>
  );
};

export default withParams(RoleEditPage);
