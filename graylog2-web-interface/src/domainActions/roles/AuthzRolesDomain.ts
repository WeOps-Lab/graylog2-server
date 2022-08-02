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
import { AuthzRolesActions } from 'stores/roles/AuthzRolesStore';

import notifyingAction from '../notifyingAction';

const load = notifyingAction({
  action: AuthzRolesActions.load,
  error: (error, roleId) => ({
    message: `加载 ID 为"${roleId}"的角色失败，状态为: ${error}`,
  }),
  notFoundRedirect: true,
});

const deleteAction = notifyingAction({
  action: AuthzRolesActions.delete,
  success: (roleId, roleName) => ({
    message: `角色"${roleName}"已成功删除`,
  }),
  error: (error, roleId, roleName) => ({
    message: `删除角色"${roleName}"失败，状态为：${error}`,
  }),
});

const addMembers = notifyingAction({
  action: AuthzRolesActions.addMembers,
  success: (roleId, usernames) => ({
    message: `用户："${usernames.join(', ')}" 分配成功`,
  }),
  error: (error, roleId, usernames) => ({
    message: `分配用户"${usernames.join(', ')}"失败，状态为：${error}`,
  }),
});

const removeMember = notifyingAction({
  action: AuthzRolesActions.removeMember,
  success: (roleId, username) => ({
    message: `用户"${username}"已成功取消分配`,
  }),
  error: (error, roleId, username) => ({
    message: `取消分配用户"${username}"失败，状态为：${error}`,
  }),
});

const loadUsersForRole = notifyingAction({
  action: AuthzRolesActions.loadUsersForRole,
  error: (error, username, roleName) => ({
    message: `为角色"${roleName}"加载用户失败，状态为: ${error}`,
  }),
});

const loadRolesForUser = notifyingAction({
  action: AuthzRolesActions.loadRolesForUser,
  error: (error, username) => ({
    message: `为用户"${username}"加载角色失败，状态为： ${error}`,
  }),
});

const loadRolesPaginated = notifyingAction({
  action: AuthzRolesActions.loadRolesPaginated,
  error: (error) => ({
    message: `加载角色失败，状态为: ${error}`,
  }),
});

export default {
  load,
  delete: deleteAction,
  addMembers,
  removeMember,
  loadUsersForRole,
  loadRolesForUser,
  loadRolesPaginated,
};
