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
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Button, FormGroup, Input } from 'components/bootstrap';
import { SessionActions } from 'stores/sessions/SessionStore';
import './login.less';
const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 0;
`;

const LoginForm = ({ onErrorChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  let promise;
  let usernameInput;
  let passwordInput;

  useEffect(() => {
    return () => {
      if (promise) {
        promise.cancel();
      }
    };
  }, []);

  const onSignInClicked = (event) => {
    event.preventDefault();
    onErrorChange();
    setIsLoading(true);
    const username = usernameInput.getValue();
    const password = passwordInput.getValue();
    const location = document.location.host;

    promise = SessionActions.login(username, password, location);

    promise.catch((error) => {
      if (error.additional.status === 401) {
        onErrorChange('认证失败.');
      } else {
        onErrorChange(`异常 - 服务器返回: ${error.additional.status} - ${error.message}`);
      }
    });

    promise.finally(() => {
      if (!promise.isCancelled()) {
        setIsLoading(false);
      }
    });
  };

  return (
    <form onSubmit={onSignInClicked}>
      <Input ref={(username) => { usernameInput = username; }}
             id="username"
             type="text"
             placeholder="用户名"
             autoFocus
             required />

      <Input ref={(password) => { passwordInput = password; }}
             id="password"
             type="password"
             placeholder="密码"
             required />

      <StyledFormGroup>
        <Button className={"login-button"} type="submit" bsStyle="info" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </Button>
      </StyledFormGroup>
    </form>
  );
};

LoginForm.propTypes = {
  onErrorChange: PropTypes.func.isRequired,
};

export default LoginForm;
