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
import Reflux from 'reflux';

import fetch from 'logic/rest/FetchProvider';
import ApiRoutes from 'routing/ApiRoutes';
import UserNotification from 'util/UserNotification';
import { qualifyUrl } from 'util/URLUtils';
import type { UserJSON } from 'logic/users/User';
import { singletonStore } from 'logic/singleton';

type Role = {
  name: string,
  description: string,
  permissions: string[],
};

type RoleMembership = {
  role: string,
  users: UserJSON[],
};

// eslint-disable-next-line import/prefer-default-export
export const RolesStore = singletonStore(
  'core.Roles',
  () => Reflux.createStore({
    loadRoles(): Promise<string[]> {
      return fetch('GET', qualifyUrl(ApiRoutes.RolesApiController.listRoles().url))
        .then(
          (response) => response.roles,
          (error) => {
            if (error.additional.status !== 404) {
              UserNotification.error(`加载角色信息失败: ${error}`,
                '无法加载角色信息');
            }
          },
        );
    },

    createRole(role: Role): Promise<Role> {
      const url = qualifyUrl(ApiRoutes.RolesApiController.createRole().url);
      const promise = fetch('POST', url, role);

      promise.then((newRole) => {
        UserNotification.success(`角色 "${newRole.name}" 创建成功`);
      }, (error) => {
        UserNotification.error(`创建角色 "${role.name}" 失败: ${error}`,
          '无法创建角色');
      });

      return promise;
    },

    updateRole(rolename: string, role: Role): Promise<Role> {
      const promise = fetch('PUT', qualifyUrl(ApiRoutes.RolesApiController.updateRole(encodeURIComponent(rolename)).url), role);

      promise.then((newRole) => {
        UserNotification.success(`角色 "${newRole.name}" 更新成功`);
      }, (error) => {
        if (error.additional.status !== 404) {
          UserNotification.error(`无法更新角色信息: ${error}`,
            '更新角色信息失败');
        }
      });

      return promise;
    },

    deleteRole(rolename: string): Promise<string[]> {
      const url = qualifyUrl(ApiRoutes.RolesApiController.deleteRole(encodeURIComponent(rolename)).url);
      const promise = fetch('DELETE', url);

      promise.then(() => {
        UserNotification.success(`角色 "${rolename}" 删除成功`);
      }, (error) => {
        if (error.additional.status !== 404) {
          UserNotification.error(`角色删除失败: ${error}`,
            '无法删除角色');
        }
      });

      return promise;
    },

    getMembers(rolename: string): Promise<RoleMembership[]> {
      const url = qualifyUrl(ApiRoutes.RolesApiController.loadMembers(encodeURIComponent(rolename)).url);
      const promise = fetch('GET', url);

      promise.catch((error) => {
        if (error.additional.status !== 404) {
          UserNotification.error(`无法加载角色信息: ${error}`,
            '无法加载角色信息');
        }
      });

      return promise;
    },
  }),
);
