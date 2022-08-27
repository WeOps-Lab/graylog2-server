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
import styled, {css} from 'styled-components';

import {Col, Row} from 'components/bootstrap';

import PublicNotifications from '../common/PublicNotifications';
import logo from 'assets/loginlogo.png';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 25vh;
  flex-direction: column;
  height: 100%;
  
  .row {
    width: 100%;
  }
  
  &::before,
  &::after {
    content: none;
  }
`;

const LoginCol = styled(Col)(({theme}) => css`
  padding: 15px;
  background-color: ${theme.colors.global.contentBackground};
  border: 1px solid ${theme.colors.variant.light.default};
  border-radius: 4px;
  box-shadow: 0 0 21px ${theme.colors.global.navigationBoxShadow};
  
  legend {
    color: ${theme.colors.variant.darker.default};
    border-color: ${theme.colors.variant.dark.default};
  }
`);

const LoginBox = ({children}) => {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '50px 0',
      minWidth: 1040,
      background: '#aec4d8'
    }}>
      <div style={{
        width: 1040,
        boxShadow: '0 6px 50px 0 rgba(0,0,0,.35)',
      }}>
        <div style={{
          display: 'flex',
          margin: 'auto',
          background: '#fff'
        }}>
          <div style={{
            width: '35%',
            padding: '20px 40px 20px 60px',
            minHeight: 600,
          }}>
            <div style={{
              textAlign: 'center',
              height: 200,
              paddingTop: 60,
            }}>
              <img src={logo} style={{
                height: 80, width: 140,
              }}/>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LoginBox.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoginBox;
