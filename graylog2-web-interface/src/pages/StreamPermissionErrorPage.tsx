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
import React from 'react';
import PropTypes from 'prop-types';

import type FetchError from 'logic/errors/FetchError';

import UnauthorizedErrorPage from './UnauthorizedErrorPage';

type Props = {
  error: FetchError | undefined | null,
  missingStreamIds: string[],
};

const StreamPermissionErrorPage = ({ error, missingStreamIds = [] }: Props) => {
  const description = (
    <>
      <p>此资源包括您无权访问的流。</p>
      <p>请联系您的管理员并提供错误详细信息，其中包括您需要访问的流列表。</p>
    </>
  );
  const streamIds = missingStreamIds.length > 0
    ? missingStreamIds
    : error?.additional?.body?.streams;
  const errorDetails = streamIds?.length > 0 ? `您需要具有此消息流的权限: ${streamIds.join(', ')}.` : undefined;

  return (
    <UnauthorizedErrorPage error={error} description={description} title="缺少消息流权限" errorDetails={errorDetails} />
  );
};

StreamPermissionErrorPage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    additional: PropTypes.shape({
      body: PropTypes.shape({
        streams: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
  }).isRequired,
  missingStreamIds: PropTypes.arrayOf(PropTypes.string),
};

StreamPermissionErrorPage.defaultProps = {
  missingStreamIds: [],
};

export default StreamPermissionErrorPage;
