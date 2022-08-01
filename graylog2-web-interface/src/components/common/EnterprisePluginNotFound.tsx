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
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Panel from 'components/bootstrap/Panel';

import Icon from './Icon';

const Header = styled(Panel.Title)`
  display: flex;
  align-items: center;
`;

const HeaderIcon = styled(Icon)`
  margin-right: 5px;
  margin-top: -1px;
`;

type Props = {
  featureName: string,
  wrapperClassName: string | null | undefined,
};

const EnterprisePluginNotFound = ({ featureName, wrapperClassName }: Props) => (
  <Panel bsStyle="info" className={wrapperClassName}>
    <Panel.Heading>
      <Header>
        <HeaderIcon name="crown" />企业版特性
      </Header>
    </Panel.Heading>
    <Panel.Body>
      使用 <b>{featureName}</b> 能力，你需要使用企业版.
    </Panel.Body>
  </Panel>
);

EnterprisePluginNotFound.propTypes = {
  featureName: PropTypes.string.isRequired,
  wrapperClassName: PropTypes.string,
};

EnterprisePluginNotFound.defaultProps = {
  wrapperClassName: 'no-bm',
};

export default EnterprisePluginNotFound;
