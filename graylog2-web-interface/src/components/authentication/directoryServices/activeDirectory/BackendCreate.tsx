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

import { DocumentTitle } from 'components/common';
import { getEnterpriseGroupSyncPlugin } from 'util/AuthenticationService';
import type { WizardFormValues } from 'components/authentication/directoryServices/BackendWizard/BackendWizardContext';

import WizardPageHeader from './WizardPageHeader';

import BackendWizard from '../BackendWizard';
import handleCreate from '../HandleCreate';

export const HELP = {
  // server config help
  systemUserDn: (
    <span>
      与 Active Directory 服务器的初始连接的用户名，例如<code>ldapbind@some.domain</code>.<br />
      这需要匹配该用户的 <code>userPrincipalName</code>
    </span>
  ),
  systemUserPassword: '初始连接到 Active Directory 服务器的密码.',
  // user sync help
  userSearchBase: (
    <span>
      将 Active Directory 搜索查询限制到的基础树，例如<code>cn=users,dc=example,dc=com</code>.
    </span>
  ),
  userSearchPattern: (
    <span>
      例如 <code className="text-nowrap">{'(&(objectClass=user)(|(sAMAccountName={0})(userPrincipalName={0})))'}</code>.{' '}
      字符串 <code>{'{0}'}</code> 将替换为输入的用户名
    </span>
  ),
  userNameAttribute: (
    <span>
      在 DataInsight 中用于用户全名的 Active Directory 属性，例如<code>userPrincipalName</code>.<br />
      如果您不确定要使用哪个属性，请尝试在侧边栏部分 <i>测试登录</i> 中加载测试用户
    </span>
  ),
  userFullNameAttribute: (
    <span>
      哪个 Active Directory 属性用于同步 DataInsight 用户的全名，例如<code>displayName</code>.<br />
    </span>
  ),
  defaultRoles: (
    <span>同步用户将获得的默认 DataInsight 角色。所有用户都需要 <code>Reader</code> 角色，才能使用 DataInsight Web 界面</span>
  ),
};

export const AUTH_BACKEND_META = {
  serviceTitle: 'Active Directory',
  serviceType: 'active-directory',
};

const INITIAL_VALUES: Partial<WizardFormValues> = {
  title: AUTH_BACKEND_META.serviceTitle,
  serverHost: 'localhost',
  serverPort: 636,
  transportSecurity: 'tls',
  userSearchPattern: '(&(objectClass=user)(|(sAMAccountName={0})(userPrincipalName={0})))',
  userFullNameAttribute: 'displayName',
  userNameAttribute: 'userPrincipalName',
  verifyCertificates: true,
};

const BackendCreate = () => {
  const enterpriseGroupSyncPlugin = getEnterpriseGroupSyncPlugin();
  const {
    help: groupSyncHelp = {},
    excludedFields: groupSyncExcludedFields = {},
    initialValues: initialGroupSyncValues,
  } = enterpriseGroupSyncPlugin?.wizardConfig?.activeDirectory ?? {};
  const help = { ...HELP, ...groupSyncHelp };
  const initialValues = { ...INITIAL_VALUES, ...initialGroupSyncValues };
  const excludedFields = { ...groupSyncExcludedFields, userUniqueIdAttribute: true };

  return (
    <DocumentTitle title="创建 Active Directory 身份验证服务">
      <WizardPageHeader />
      <BackendWizard authBackendMeta={AUTH_BACKEND_META}
                     help={help}
                     excludedFields={excludedFields}
                     initialValues={initialValues}
                     onSubmit={handleCreate} />
    </DocumentTitle>
  );
};

export default BackendCreate;
