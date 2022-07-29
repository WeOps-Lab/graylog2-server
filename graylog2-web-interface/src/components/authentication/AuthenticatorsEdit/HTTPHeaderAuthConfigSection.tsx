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
import { Formik, Form } from 'formik';

import Routes from 'routing/Routes';
import history from 'util/History';
import type HTTPHeaderAuthConfig from 'logic/authentication/HTTPHeaderAuthConfig';
import HTTPHeaderAuthConfigDomain from 'domainActions/authentication/HTTPHeaderAuthConfigDomain';
import { Input, Button, Col, Row, Alert } from 'components/bootstrap';
import { FormikFormGroup, ErrorAlert, Spinner, Icon } from 'components/common';
import SectionComponent from 'components/common/Section/SectionComponent';

const HTTPHeaderAuthConfigSection = () => {
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [loadedConfig, setLoadedConfig] = useState<HTTPHeaderAuthConfig | undefined>();
  const sectionTitle = 'HTTP 认证';

  const _onSubmit = (data) => {
    setSubmitError(undefined);

    return HTTPHeaderAuthConfigDomain.update(data).then(() => {
      history.push(Routes.SYSTEM.AUTHENTICATION.AUTHENTICATORS.SHOW);
    }).catch((error) => {
      setSubmitError(error.additional?.res?.text);
    });
  };

  useEffect(() => {
    HTTPHeaderAuthConfigDomain.load().then(setLoadedConfig);
  }, []);

  if (!loadedConfig) {
    return (
      <SectionComponent title={sectionTitle}>
        <Spinner />
      </SectionComponent>
    );
  }

  return (
    <SectionComponent title={sectionTitle}>
      <p>HTTP 认证.</p>
      <Formik onSubmit={_onSubmit}
              initialValues={loadedConfig.toJSON()}>
        {({ isSubmitting, isValid }) => (
          <Form className="form form-horizontal">
            <Input id="enable-http-header-auth"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="启用">
              <FormikFormGroup label="启用HTTP单点登录认证"
                               name="enabled"
                               formGroupClassName="form-group no-bm"
                               wrapperClassName="col-xs-12"
                               type="checkbox" />
            </Input>
            <FormikFormGroup label="用户名Header"
                             name="username_header"
                             required
                             help="包含用户名的HTTP Header（不区分大小写）" />
            <Row>
              <Col mdOffset={3} md={9}>
                <Alert bsStyle="info">
                  <Icon name="info-circle" /> 请在配置文件中配置 <code>可信的</code> HTTP代理.
                </Alert>
              </Col>
            </Row>
            <ErrorAlert runtimeError>{submitError}</ErrorAlert>
            <Row className="no-bm">
              <Col xs={12}>
                <div className="pull-right">
                  <Button bsStyle="success"
                          disabled={isSubmitting || !isValid}
                          title="更新配置"
                          type="submit">
                    更新
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </SectionComponent>
  );
};

export default HTTPHeaderAuthConfigSection;
