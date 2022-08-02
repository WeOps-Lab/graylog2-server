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
import { AuthenticationActions } from 'stores/authentication/AuthenticationStore';

import notifyingAction from '../notifyingAction';

const create = notifyingAction({
  action: AuthenticationActions.create,
  success: (authBackend) => ({
    message: `身份验证服务"${authBackend.title} 已成功创建`,
  }),
  error: (error, authBackend) => ({
    message: `创建身份验证服务"${authBackend.title}"失败，状态为：${error}`,
  }),
});

const load = notifyingAction({
  action: AuthenticationActions.load,
  error: (error, authBackendId) => ({
    message: `加载 ID 为"${authBackendId}"的身份验证服务失败并显示状态: ${error}`,
  }),
  notFoundRedirect: true,
});

const loadActive = notifyingAction({
  action: AuthenticationActions.loadActive,
  error: (error) => ({
    message: `加载活动身份验证服务失败并显示状态: ${error}`,
  }),
});

const update = notifyingAction({
  action: AuthenticationActions.update,
  success: (authBackendId, authBackend) => ({
    message: `身份验证服务"${authBackend.title}"已成功更新`,
  }),
  error: (error, authBackendId, authBackend) => ({
    message: `更新身份验证服务"${authBackend.title}"失败，状态为: ${error}`,
  }),
});

const deleteBackend = notifyingAction({
  action: AuthenticationActions.delete,
  success: (authBackendId, authBackendTitle) => ({
    message: `身份验证服务"${authBackendTitle}" 已成功删除`,
  }),
  error: (error, authBackendId, authBackendTitle) => ({
    message: `删除身份验证服务"${authBackendTitle}"失败，状态为：${error}`,
  }),
});

const testConnection = notifyingAction({
  action: AuthenticationActions.testConnection,
  error: (error) => ({
    message: `连接测试失败，状态为: ${error}`,
  }),
});

const testLogin = notifyingAction({
  action: AuthenticationActions.testLogin,
  error: (error) => ({
    message: `登录测试失败，状态为: ${error}`,
  }),
});

const setActiveBackend = notifyingAction({
  action: AuthenticationActions.setActiveBackend,
  success: (authBackendId, authBackendTitle) => ({
    message: `鉴权服务 "${authBackendTitle} 设置为 ${authBackendId ? '活跃' : '不活跃'} 成功`,
  }),
  error: (error, authBackendId, authBackendTitle) => ({
    message: `鉴权服务 "${authBackendTitle}" 失败,当前状态: ${error}`,
  }),
});

const loadBackendsPaginated = notifyingAction({
  action: AuthenticationActions.loadBackendsPaginated,
  error: (error) => ({
    message: `加载身份验证服务失败并显示状态: ${error}`,
  }),
});

const loadUsersPaginated = notifyingAction({
  action: AuthenticationActions.loadUsersPaginated,
  error: (authBackendId, error) => ({
    message: `加载 ID 为"${authBackendId}"的身份验证服务的同步用户失败，状态为: ${error}`,
  }),
});

const loadActiveBackendType = notifyingAction({
  action: AuthenticationActions.loadActiveBackendType,
  error: (error) => ({
    message: `加载活动身份验证服务类型失败并显示状态: ${error}`,
  }),
});

export default {
  create,
  update,
  load,
  loadActive,
  delete: deleteBackend,
  testConnection,
  testLogin,
  setActiveBackend,
  loadBackendsPaginated,
  loadUsersPaginated,
  loadActiveBackendType,
};
