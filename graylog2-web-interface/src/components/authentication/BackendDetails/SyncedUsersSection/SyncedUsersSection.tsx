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
import { useState, useEffect } from 'react';
import type * as Immutable from 'immutable';

import type Role from 'logic/roles/Role';
import type { PaginatedUsers } from 'stores/users/UsersStore';
import AuthenticationDomain from 'domainActions/authentication/AuthenticationDomain';
import { DataTable, PaginatedList, Spinner, EmptyResult } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';
import type AuthenticationBackend from 'logic/authentication/AuthenticationBackend';

import SyncedUsersOverviewItem from './SyncedUsersOverviewItem';
import SyncedUsersFilter from './SyncedUsersFilter';

const TABLE_HEADERS = ['用户名', '别名', '角色', '操作'];
const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 10,
  query: '',
};

const _headerCellFormatter = (header) => {
  switch (header.toLowerCase()) {
    case 'actions':
      return <th className="actions text-right">{header}</th>;
    default:
      return <th>{header}</th>;
  }
};

const _loadSyncedTeams = (authBackendId, pagination, setLoading, setPaginatedUsers) => {
  setLoading(true);

  AuthenticationDomain.loadUsersPaginated(authBackendId, pagination).then((paginatedUsers) => {
    setPaginatedUsers(paginatedUsers);
    setLoading(false);
  });
};

type Props = {
  roles: Immutable.List<Role>,
  authenticationBackend: AuthenticationBackend,
};

const SyncedUsersSection = ({ roles, authenticationBackend }: Props) => {
  const [loading, setLoading] = useState(false);
  const [paginatedUsers, setPaginatedUsers] = useState<PaginatedUsers | undefined>();
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const { list: users } = paginatedUsers || {};
  const { page } = pagination;

  useEffect(() => _loadSyncedTeams(authenticationBackend.id, pagination, setLoading, setPaginatedUsers), [authenticationBackend.id, pagination]);

  if (!paginatedUsers) {
    return <Spinner />;
  }

  const _userOverviewItem = (user) => <SyncedUsersOverviewItem user={user} roles={roles} />;

  return (
    <SectionComponent title="已同步用户" showLoading={loading}>
      <p className="description">
        找到 {paginatedUsers.pagination.total} 个已同步用户.
      </p>
      <PaginatedList activePage={page} totalItems={paginatedUsers.pagination.total} onChange={(newPage, newPerPage) => setPagination({ ...pagination, page: newPage, perPage: newPerPage })}>
        <DataTable className="table-hover"
                   customFilter={<SyncedUsersFilter onSearch={(newQuery) => setPagination({ ...pagination, query: newQuery, page: DEFAULT_PAGINATION.page })} />}
                   dataRowFormatter={_userOverviewItem}
                   filterKeys={[]}
                   filterLabel="过滤"
                   headerCellFormatter={_headerCellFormatter}
                   headers={TABLE_HEADERS}
                   id="synced-users-overview"
                   noDataText={<EmptyResult>未找到已同步用户.</EmptyResult>}
                   rowClassName="no-bm"
                   rows={users.toJS()}
                   sortByKey="username" />
      </PaginatedList>
    </SectionComponent>
  );
};

export default SyncedUsersSection;
