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
import { useContext } from 'react';
import styled from 'styled-components';

import CurrentUserContext from 'contexts/CurrentUserContext';
import { LinkContainer } from 'components/common/router';
import type UserOverview from 'logic/users/UserOverview';
import UsersDomain from 'domainActions/users/UsersDomain';
import Routes from 'routing/Routes';
import { Button, Tooltip, DropdownButton, MenuItem } from 'components/bootstrap';
import { OverlayTrigger, IfPermitted } from 'components/common';

type Props = {
  user: UserOverview,
};

const ActionsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const EditTokensAction = ({
  user: { fullName, id },
  wrapperComponent: WrapperComponent,
}: {
  user: UserOverview,
  wrapperComponent: Button | MenuItem,
}) => (
  <LinkContainer to={Routes.SYSTEM.USERS.TOKENS.edit(id)}>
    <WrapperComponent id={`edit-tokens-${id}`}
                      bsStyle="info"
                      bsSize="xs"
                      title={`Edit tokens of user ${fullName}`}>
      编辑令牌
    </WrapperComponent>
  </LinkContainer>
);

const ReadOnlyActions = ({ user }: { user: UserOverview }) => {
  const tooltip = <Tooltip id="system-user">系统用户只能在 DataInsight 配置文件中修改.</Tooltip>;

  return (
    <>
      <OverlayTrigger placement="left" overlay={tooltip}>
        <Button bsSize="xs" bsStyle="info" disabled>系统用户</Button>
      </OverlayTrigger>
      &nbsp;
      <EditTokensAction user={user} wrapperComponent={Button} />
    </>
  );
};

const EditActions = ({ user, user: { username, id, fullName, accountStatus, external, readOnly } }: { user: UserOverview }) => {
  const currentUser = useContext(CurrentUserContext);

  const _toggleStatus = () => {
    if (accountStatus === 'enabled') {
      // eslint-disable-next-line no-alert
      if (window.confirm(`你真的要禁用用户 ${fullName} 吗？所有当前会话都将被终止。`)) {
        UsersDomain.setStatus(id, 'disabled');
      }

      return;
    }

    UsersDomain.setStatus(id, 'enabled');
  };

  const _deleteUser = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`你真的要删除用户 ${fullName} 吗？`)) {
      UsersDomain.delete(id, fullName);
    }
  };

  const showEnableDisable = !external && !readOnly && currentUser?.id !== id;

  return (
    <>
      <IfPermitted permissions={[`users:edit:${username}`]}>
        <LinkContainer to={Routes.SYSTEM.USERS.edit(id)}>
          <Button id={`edit-user-${id}`} bsStyle="info" bsSize="xs" title={`编辑用户 ${fullName}`}>
            编辑
          </Button>
        </LinkContainer>
      </IfPermitted>
      &nbsp;
      <DropdownButton bsSize="xs" title="更多操作" pullRight id={`delete-user-${id}`}>
        <EditTokensAction user={user} wrapperComponent={MenuItem} />
        <IfPermitted permissions={[`users:edit:${username}`]}>
          {showEnableDisable && (
            <MenuItem id={`set-status-user-${id}`}
                      onClick={_toggleStatus}
                      title={`设置新帐户状态 ${fullName}`}>
              {accountStatus === 'enabled' ? '禁用' : '启用'}
            </MenuItem>
          )}
          <MenuItem id={`delete-user-${id}`}
                    bsStyle="primary"
                    bsSize="xs"
                    title={`删除用户 ${fullName}`}
                    onClick={_deleteUser}>
            删除
          </MenuItem>
        </IfPermitted>
      </DropdownButton>
    </>
  );
};

const ActionsCell = ({ user }: Props) => (
  <td>
    <ActionsWrapper>
      {user.readOnly ? (
        <ReadOnlyActions user={user} />
      ) : (
        <EditActions user={user} />
      )}
    </ActionsWrapper>
  </td>
);

export default ActionsCell;
