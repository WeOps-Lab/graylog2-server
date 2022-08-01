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
import { useState } from 'react';
import styled from 'styled-components';
import type { $PropertyType } from 'utility-types';

import { LinkContainer } from 'components/common/router';
import AuthzRolesDomain from 'domainActions/roles/AuthzRolesDomain';
import Routes from 'routing/Routes';
import type Role from 'logic/roles/Role';
import { Button } from 'components/bootstrap';
import { IfPermitted, Spinner } from 'components/common';

type Props = {
  readOnly: $PropertyType<Role, 'readOnly'>,
  roleId: $PropertyType<Role, 'id'>,
  roleName: $PropertyType<Role, 'name'>,
};

const ActionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const _deleteRole = (roleId: $PropertyType<Role, 'id'>, roleName: $PropertyType<Role, 'name'>, setDeleting: (boolean) => void) => {
  let confirmMessage = `你真的要删除角色“${roleName}”吗？`;
  const getOneUser = { page: 1, perPage: 1, query: '' };
  setDeleting(true);

  AuthzRolesDomain.loadUsersForRole(roleId, roleName, getOneUser).then((paginatedUsers) => {
    if (paginatedUsers.pagination.total >= 1) {
      confirmMessage += `\n\n它仍然分配给 ${paginatedUsers.pagination.total} 个用户。`;
    }

    // eslint-disable-next-line no-alert
    if (window.confirm(confirmMessage)) {
      AuthzRolesDomain.delete(roleId, roleName).then(() => {
        setDeleting(false);
      });
    } else {
      setDeleting(false);
    }
  });
};

const ActionsCell = ({ roleId, roleName, readOnly }: Props) => {
  const [deleting, setDeleting] = useState(false);

  return (
    <td>
      <ActionsWrapper>
        <IfPermitted permissions={[`roles:edit:${roleName}`]}>
          <LinkContainer to={Routes.SYSTEM.AUTHZROLES.edit(encodeURIComponent(roleId))}>
            <Button id={`edit-role-${roleId}`} bsStyle="info" bsSize="xs" title={`Edit role ${roleName}`} type="button">
              编辑
            </Button>
          </LinkContainer>
        </IfPermitted>
        {!readOnly && (
        <IfPermitted permissions={[`roles:delete:${roleName}`]}>
          <>
            &nbsp;
            <Button id={`delete-role-${roleId}`} bsStyle="danger" bsSize="xs" title={`Delete role ${roleName}`} onClick={() => _deleteRole(roleId, roleName, setDeleting)} type="button">
              {deleting ? <Spinner text="删除中..." delay={0} /> : '删除'}
            </Button>
          </>
        </IfPermitted>
        )}
      </ActionsWrapper>
    </td>
  );
};

export default ActionsCell;
