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
import { HTTPHeaderAuthConfigActions } from 'stores/authentication/HTTPHeaderAuthConfigStore';

import notifyingAction from '../notifyingAction';

const load = notifyingAction({
  action: HTTPHeaderAuthConfigActions.load,
  error: (error) => ({
    message: `加载 HTTP 标头身份验证配置失败并显示状态: ${error}`,
  }),
});

const update = notifyingAction({
  action: HTTPHeaderAuthConfigActions.update,
  success: () => ({
    message: '已成功更新 HTTP 标头身份验证配置',
  }),
  error: (error) => ({
    message: `更新 HTTP 标头身份验证配置失败并显示状态: ${error}`,
  }),
});

export default {
  load,
  update,
};
