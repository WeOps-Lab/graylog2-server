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

import { ReadOnlyFormGroup } from 'components/common';
import type User from 'logic/users/User';
import SectionComponent from 'components/common/Section/SectionComponent';

type Props = {
  user: User,
};

const ProfileSection = ({
  user: {
    username,
    fullName,
    firstName,
    lastName,
    email,
    clientAddress,
    lastActivity,
    sessionActive,
    accountStatus,
  },
}: Props) => {
  const isOldUser = () => {
    return fullName && (!firstName && !lastName);
  };

  return (
    <SectionComponent title="信息">
      <ReadOnlyFormGroup label="用户名" value={username} />
      {isOldUser() && <ReadOnlyFormGroup label="姓名" value={fullName} />}
      <ReadOnlyFormGroup label="姓" value={firstName} />
      <ReadOnlyFormGroup label="名" value={lastName} />
      <ReadOnlyFormGroup label="邮件地址" value={email} />
      <ReadOnlyFormGroup label="客户端地址" value={clientAddress} />
      <ReadOnlyFormGroup label="最后活跃时间" value={lastActivity} />
      <ReadOnlyFormGroup label="已登录" value={sessionActive} />
      <ReadOnlyFormGroup label="启用" value={accountStatus === 'enabled'} />
    </SectionComponent>
  );
};

export default ProfileSection;
