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

import { FormikInput } from 'components/common';
import { Row, Col, Input } from 'components/bootstrap';

export const PASSWORD_MIN_LENGTH = 6;

export const validatePasswords = (errors: { [name: string]: string }, password: string, passwordRepeat: string) => {
  const newErrors = { ...errors };

  if (password && password.length < PASSWORD_MIN_LENGTH) {
    newErrors.password = `密码长度至少为 ${PASSWORD_MIN_LENGTH}`;
  }

  if (password && passwordRepeat) {
    const passwordMatches = password === passwordRepeat;

    if (!passwordMatches) {
      newErrors.password_repeat = '密码不匹配';
    }
  }

  return newErrors;
};

type Props = {};

// eslint-disable-next-line no-empty-pattern
const PasswordFormGroup = ({}: Props) => (
  <Input id="password-field"
         label="密码"
         help={`密码长度必须大于 ${PASSWORD_MIN_LENGTH} .`}
         labelClassName="col-sm-3"
         wrapperClassName="col-sm-9">
    <Row className="no-bm">
      <Col sm={6}>
        <FormikInput name="password"
                     id="password"
                     maxLength={100}
                     type="password"
                     placeholder="密码"
                     required
                     formGroupClassName="form-group no-bm"
                     wrapperClassName="col-xs-12"
                     minLength={PASSWORD_MIN_LENGTH} />
      </Col>
      <Col sm={6}>
        <FormikInput name="password_repeat"
                     id="password_repeat"
                     maxLength={100}
                     type="password"
                     placeholder="重复密码"
                     formGroupClassName="form-group no-bm"
                     required
                     wrapperClassName="col-xs-12"
                     minLength={PASSWORD_MIN_LENGTH} />
      </Col>
    </Row>
  </Input>
);

PasswordFormGroup.defaultProps = {
  passwordRef: undefined,
  passwordRepeatRef: undefined,
};

export default PasswordFormGroup;
