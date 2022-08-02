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
import { EntityShareActions } from 'stores/permissions/EntityShareStore';

import notifyingAction from '../notifyingAction';

const prepare = notifyingAction({
  action: EntityShareActions.prepare,
  error: (error, entityName, entityType) => ({
    message: `为 ${entityType} "${entityName}" 准备共享失败，状态为: ${error}`,
  }),
});

const update = notifyingAction({
  action: EntityShareActions.update,
  error: (error, entityName, entityType) => ({
    message: `更新 ${entityType} "${entityName}" 的共享失败，状态为: ${error}`,
  }),
  success: (entityName, entityType) => ({
    message: `${entityType} "${entityName}" 的共享已成功更新`,
  }),
});

const loadUserSharesPaginated = notifyingAction({
  action: EntityShareActions.loadUserSharesPaginated,
  error: (error, userId) => ({
    message: `加载为 ID 为"${userId}"的用户共享的实体失败，状态为：${error}`,
  }),
});

export default {
  prepare,
  update,
  loadUserSharesPaginated,
};
