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

import handleCreate from '../HandleCreate';
import BackendWizard from '../BackendWizard';

export const AUTH_BACKEND_META = {
  serviceType: 'ldap',
  serviceTitle: 'LDAP',
};

export const HELP = {
  // server config help
  systemUserDn: (
    <span>
     与 LDAP 服务器的初始连接的用户名，例如<code>cn=admin,dc=example,dc=com</code>,
      这可能是可选的，具体取决于您的 LDAP 服务器
    </span>
  ),
  systemUserPassword: '初始连接到 LDAP 服务器的密码.',
  // user sync help
  userSearchBase: (
    <span>
      将 LDAP 搜索查询限制到的基础树，例如<code>cn=users,dc=example,dc=com</code>.
    </span>
  ),
  userSearchPattern: (
    <span>
      例如 <code className="text-nowrap">{'(&(uid={0})(objectClass=inetOrgPerson))'}</code>.{' '}
      字符串 <code>{'{0}'}</code> 将替换为输入的用户名.
    </span>
  ),
  userNameAttribute: (
    <span>
      在 DataInsight 中用于用户用户名的 LDAP 属性，例如 <code>uid</code>。<br />
      如果您不确定要使用哪个属性，请尝试在侧边栏部分 <i>用户登录测试</i> 中加载测试用户
    </span>
  ),
  userFullNameAttribute: (
    <span>
      哪个 LDAP 属性用于同步 DataInsight 用户的全名，例如<code>cn</code>.<br />
    </span>
  ),
  userUniqueIdAttribute: (
    <span>
      哪个 LDAP 属性用于同步 DataInsight 用户的 ID，例如<code>entryUUID</code>.<br />
    </span>
  ),
  defaultRoles: (
    <span>同步用户将获得的默认 DataInsight 角色。所有用户都需要 <code>Reader</code> 角色，才能使用 DataInsight Web 界面</span>
  ),
};

const INITIAL_VALUES: Partial<WizardFormValues> = {
  title: AUTH_BACKEND_META.serviceTitle,
  serverHost: 'localhost',
  serverPort: 636,
  transportSecurity: 'tls',
  userFullNameAttribute: 'cn',
  userNameAttribute: 'uid',
  userUniqueIdAttribute: 'entryUUID',
  verifyCertificates: true,
};

const BackendCreate = () => {
  const enterpriseGroupSyncPlugin = getEnterpriseGroupSyncPlugin();
  const {
    help: groupSyncHelp = {},
    initialValues: initialGroupSyncValues = {},
  } = enterpriseGroupSyncPlugin?.wizardConfig?.ldap ?? {};
  const help = { ...HELP, ...groupSyncHelp };
  const initialValues = { ...INITIAL_VALUES, ...initialGroupSyncValues };

  return (
    <DocumentTitle title="创建LDAP鉴权服务">
      <WizardPageHeader />
      <BackendWizard onSubmit={handleCreate}
                     help={help}
                     authBackendMeta={AUTH_BACKEND_META}
                     initialValues={initialValues} />
    </DocumentTitle>
  );
};

export default BackendCreate;
