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

import type { DirectoryServiceBackend } from 'logic/authentication/directoryServices/types';
import { ReadOnlyFormGroup } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';

import EditLinkButton from './EditLinkButton';

import { STEP_KEY as SERVER_CONFIG_KEY } from '../BackendWizard/ServerConfigStep';

type Props = {
  authenticationBackend: DirectoryServiceBackend,
};

const ServerConfigSection = ({ authenticationBackend }: Props) => {
  const { title, description, config: { servers = [], systemUserDn, systemUserPassword, transportSecurity, verifyCertificates } } = authenticationBackend;
  const serverUrls = servers.map((server) => `${server.host}:${server.port}`).join(', ');

  return (
    <SectionComponent title="服务器配置" headerActions={<EditLinkButton authenticationBackendId={authenticationBackend.id} stepKey={SERVER_CONFIG_KEY} />}>
      <ReadOnlyFormGroup label="标题" value={title} />
      <ReadOnlyFormGroup label="描述" value={description} />
      <ReadOnlyFormGroup label="服务器地址" value={serverUrls} />
      <ReadOnlyFormGroup label="用户名" value={systemUserDn} />
      <ReadOnlyFormGroup label="密码" value={systemUserPassword?.isSet ? '******' : null} />
      <ReadOnlyFormGroup label="传输安全" value={transportSecurity} />
      <ReadOnlyFormGroup label="身份校验" value={verifyCertificates} />
    </SectionComponent>
  );
};

export default ServerConfigSection;
