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
import { UsersActions } from 'stores/users/UsersStore';

import notifyingAction from '../notifyingAction';

const create = notifyingAction({
  action: UsersActions.create,
  success: (user) => ({
    message: `用户"${user?.first_name} ${user?.last_name}"创建成功`,
  }),
  error: (error, user) => ({
    message: `创建用户"${user?.first_name} ${user?.last_name}"失败，状态为：${error}`,
  }),
});

const load = notifyingAction({
  action: UsersActions.load,
  error: (error, userId) => ({
    message: `加载 ID 为"${userId}"的用户失败，状态为：${error}`,
  }),
  notFoundRedirect: true,
});

const loadByUsername = notifyingAction({
  action: UsersActions.loadByUsername,
  error: (error, username) => ({
    message: `使用用户名"${username}"加载用户失败，状态为：${error}`,
  }),
  notFoundRedirect: true,
});

const update = notifyingAction({
  action: UsersActions.update,
  success: (userId, payload, fullName) => ({
    message: `用户"${fullName}"已成功更新`,
  }),
  error: (error, userId, payload, fullName) => ({
    message: `更新用户"${fullName}"失败，状态为：${error}`,
  }),
});

const deleteAction = notifyingAction({
  action: UsersActions.delete,
  success: (userId, fullName) => ({
    message: `用户"${fullName}"已成功删除`,
  }),
  error: (error, userId, fullName) => ({
    message: `删除用户"${fullName}"失败，状态为：${error}`,
  }),
});

const changePassword = notifyingAction({
  action: UsersActions.changePassword,
  success: () => ({
    message: '密码已成功更改 ',
  }),
  error: (error, userId) => ({
    message: `更改 ID 为"${userId}"的用户的密码失败，状态为：${error}`,
  }),
});

const createToken = notifyingAction({
  action: UsersActions.createToken,
  success: (userId, tokenName) => ({
    message: `令牌"${tokenName}"创建成功`,
  }),
  error: (error, userId, tokenName) => ({
    message: `为 ID 为"${userId}"的用户创建令牌"${tokenName}"失败，状态为：${error}`,
  }),
});

const loadTokens = notifyingAction({
  action: UsersActions.loadTokens,
  error: (error, userId) => ({
    message: `为 ID 为"${userId}"的用户加载令牌失败，状态为：${error}`,
  }),
});

const deleteToken = notifyingAction({
  action: UsersActions.deleteToken,
  success: (userId, tokenId, tokenName) => ({
    message: `令牌"${tokenName}"已成功删除`,
  }),
  error: (error, userId, tokenId, tokenName) => ({
    message: `为 ID 为"${userId}"的用户删除令牌"${tokenName}"失败，状态为：${error}`,
  }),
});

const loadUsers = notifyingAction({
  action: UsersActions.loadUsers,
  error: (error) => ({
    message: `加载用户失败，状态为：${error}`,
  }),
});

const loadUsersPaginated = notifyingAction({
  action: UsersActions.loadUsersPaginated,
  error: (error) => ({
    message: `加载用户失败，状态为：${error}`,
  }),
});

const setStatus = notifyingAction({
  action: UsersActions.setStatus,
  success: (userId, accountStatus) => ({
    message: `用户"${userId}"设置为 ${accountStatus}`,
  }),
  error: (error, userId, accountStatus) => ({
    message: `将用户 ("${userId}") 更新到 ${accountStatus} 失败，状态为：${error}`,
  }),
});

export default {
  create,
  load,
  loadByUsername,
  update,
  delete: deleteAction,
  changePassword,
  createToken,
  loadTokens,
  deleteToken,
  loadUsers,
  loadUsersPaginated,
  setStatus,
};
