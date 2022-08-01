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

import type Role from 'logic/roles/Role';
import SectionComponent from 'components/common/Section/SectionComponent';
import { ReadOnlyFormGroup } from 'components/common';

type Props = {
  role: Role,
};

const ProfileSection = ({
  role: {
    name,
    description,
  },
}: Props) => (
  <SectionComponent title="详情">
    <ReadOnlyFormGroup label="名称" value={name} />
    <ReadOnlyFormGroup label="描述" value={description} />
  </SectionComponent>
);

export default ProfileSection;
