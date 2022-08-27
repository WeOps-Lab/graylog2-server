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
import {withTheme} from 'styled-components';

import {themePropTypes} from 'theme';
import logoUrl from 'assets/logo.png';
// Don't pass active prop, since `a` tag doesn't support it.
// eslint-disable-next-line no-unused-vars
function BrandComponent({active, ...props}) {
  // return <a {...props}><img src={logoUrl} alt="DataInsight logo" width="130" height="36" /></a>;
  return <a style={{marginLeft: '35px'}}></a>
}


BrandComponent.propTypes = {
  active: PropTypes.bool,
  theme: themePropTypes.isRequired,
};

BrandComponent.defaultProps = {
  active: false,
};

export default withTheme(BrandComponent);
