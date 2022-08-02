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

import { Alert } from 'components/bootstrap';
import { Icon } from 'components/common';

const ProfileUpdateInfo = () => (
  <Alert bsStyle="info">
    <Icon name="info-circle" />{' '}<b> 名字和姓氏</b><br />
      我们添加了不同的名字和姓氏字段。必须先提供这些信息，然后才能保存用户的个人资料。
  </Alert>
);

export default ProfileUpdateInfo;
