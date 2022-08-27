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
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {PluginStore} from 'graylog-web-plugin/plugin';
import styled, {createGlobalStyle} from 'styled-components';
import {useQuery} from 'react-query';
import {ErrorBoundary} from 'react-error-boundary';

import {DocumentTitle, Icon} from 'components/common';
import {Alert, Button} from 'components/bootstrap';
import LoginForm from 'components/login/LoginForm';
import LoginBox from 'components/login/LoginBox';
import authStyles from 'theme/styles/authStyles';
import AuthenticationDomain from 'domainActions/authentication/AuthenticationDomain';
import AppConfig from 'util/AppConfig';
import {LOGIN_INITIALIZING_STATE, LOGIN_INITIALIZED_STATE} from 'logic/authentication/constants';
import {SessionActions} from 'stores/sessions/SessionStore';
import LoadingPage from './LoadingPage';

import logo from 'assets/loginlogo.png';
import loginBoxImage from 'assets/loginbox.png';

const LoginPageStyles = createGlobalStyle`
  ${authStyles}
`;

const StyledButton = styled(Button)`
  margin-top: 1em;
  display: inline-block;
  cursor: pointer;
`;

const StyledPre = styled.pre`
  white-space: pre-line;
`;

const useActiveBackend = (isCloud) => {
  const cloudBackendLoader = () => {
    if (isCloud) {
      return Promise.resolve('oidc-v1');
    }

    return AuthenticationDomain.loadActiveBackendType();
  };

  const {data, isSuccess} = useQuery('activeBackendType', cloudBackendLoader);

  return [data, isSuccess];
};

const ErrorFallback = ({error, resetErrorBoundary}) => {
  const isCloud = AppConfig.isCloud();

  return (
    <Alert bsStyle="danger">
      {isCloud ? (
        <p>加载登录屏幕时出错，请联系管理员.</p>
      ) : (
        <>
          <p>
            异常信息
          </p>
          <StyledPre>{error.message}</StyledPre>
          <Button bsStyle="danger" onClick={resetErrorBoundary}>使用默认方法登录</Button>
        </>
      )}
    </Alert>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }).isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

const LoginPage = () => {
  const [didValidateSession, setDidValidateSession] = useState(false);
  const [lastError, setLastError] = useState(undefined);
  const [useFallback, setUseFallback] = useState(false);
  const [enableExternalBackend, setEnableExternalBackend] = useState(true);
  const [loginFormState, setLoginFormState] = useState(LOGIN_INITIALIZING_STATE);
  const isCloud = AppConfig.isCloud();
  const [activeBackend, isBackendDetermined] = useActiveBackend(isCloud);

  const registeredLoginComponents = PluginStore.exports('loginProviderType');
  const loginComponent = registeredLoginComponents.find((c) => c.type === activeBackend);
  const hasCustomLogin = loginComponent && loginComponent.formComponent;

  useEffect(() => {
    const sessionPromise = SessionActions.validate().then((response) => {
      setDidValidateSession(true);

      return response;
    });

    return () => {
      sessionPromise.cancel();
    };
  }, []);

  useEffect(() => {
    setLastError(undefined);
  }, [useFallback]);

  const resetLastError = () => {
    setLastError(undefined);
  };

  const formatLastError = () => {
    if (lastError) {
      return (
        <div className="form-group">
          <Alert bsStyle="danger">
            <button type="button" className="close" onClick={resetLastError}>&times;</button>
            {lastError}
          </Alert>
        </div>
      );
    }

    return null;
  };

  const renderLoginForm = () => {
    if (!useFallback && hasCustomLogin) {
      const {formComponent: PluginLoginForm} = loginComponent;

      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}
                       onError={() => setEnableExternalBackend(false)}
                       onReset={() => setUseFallback(true)}>
          <PluginLoginForm onErrorChange={setLastError} setLoginFormState={setLoginFormState}/>
        </ErrorBoundary>
      );
    }

    return <LoginForm onErrorChange={setLastError}/>;
  };

  if (!didValidateSession || !isBackendDetermined) {
    return (
      <LoadingPage/>
    );
  }

  const shouldDisplayFallbackLink = hasCustomLogin
    && enableExternalBackend
    && !isCloud
    && loginFormState === LOGIN_INITIALIZED_STATE;


  return (
    <DocumentTitle >
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
                {/*<div style={{margin: '8px 0', fontSize: 20, fontWeight: 'bold'}}>DataInsight</div>*/}
              </div>
              {formatLastError()}
              {renderLoginForm()}
              {shouldDisplayFallbackLink && (
                <StyledButton as="a" onClick={() => setUseFallback(!useFallback)}>
                  {`使用 ${useFallback ? loginComponent.type.replace(/^\w/, (c) => c.toUpperCase()) : '默认登录'}`}
                </StyledButton>
              )}
            </div>
            <div style={{
              width: '65%',
              padding: 0,
              minHeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src={loginBoxImage} style={{width: '100%', height: '100%'}}/>
            </div>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
};

export default LoginPage;
