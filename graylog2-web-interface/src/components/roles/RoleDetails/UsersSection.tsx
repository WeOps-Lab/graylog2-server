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
import { useState, useCallback } from 'react';

import AuthzRolesDomain from 'domainActions/roles/AuthzRolesDomain';
import { PaginatedItemOverview } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';
import type Role from 'logic/roles/Role';

type Props = {
  role: Role,
};

const UsersSection = ({ role: { id, name } }: Props) => {
  const [loading, setLoading] = useState(false);

  const _onLoad = useCallback((pagination) => {
    setLoading(true);

    return AuthzRolesDomain.loadUsersForRole(id, name, pagination).then((paginatedRoles) => {
      setLoading(false);

      return paginatedRoles;
    });
  }, [id, name]);

  return (
    <SectionComponent title="用户" showLoading={loading}>
      <PaginatedItemOverview noDataText="未找到用户" onLoad={_onLoad} />
    </SectionComponent>
  );
};

export default UsersSection;
