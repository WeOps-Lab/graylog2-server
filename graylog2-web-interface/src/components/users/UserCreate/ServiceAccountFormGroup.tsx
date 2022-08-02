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
import { useRef } from 'react';
import { Field } from 'formik';

import { Input, BootstrapModalConfirm } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';

const ServiceAccountFormGroup = () => {
  const confirmationModalRef = useRef<typeof BootstrapModalConfirm>();

  return (
    <Field name="service_account">
      {({ field: { name, value, onChange } }) => {
        const onValueChange = (newValue) => {
          const serviceAccountNewValue = getValueFromInput(newValue.target);

          if (serviceAccountNewValue) {
            confirmationModalRef.current.open();
          } else {
            onChange(newValue);
          }
        };

        const handleCheckServiceAccount = () => {
          onChange({ target: { name, value: true } });
          confirmationModalRef.current.close();
        };

        const handleCancel = () => {
          onChange({ target: { name, value: false } });
          confirmationModalRef.current.close();
        };

        return (
          <>
            <Input id="service-account-controls"
                   labelClassName="col-sm-3"
                   wrapperClassName="col-sm-9"
                   label="服务帐户">
              <Input label="用户是服务帐户"
                     id="service_account"
                     type="checkbox"
                     wrapperClassName="col-sm-9"
                     name="service_account"
                     checked={value ?? false}
                     help="选中后，用户将成为服务帐户，将无法登录 Web 界面并编辑其设置。 （例如，API 令牌）"
                     onChange={(newValue) => onValueChange(newValue)} />
            </Input>
            <BootstrapModalConfirm ref={confirmationModalRef}
                                   title="确定?"
                                   onConfirm={handleCheckServiceAccount}
                                   onCancel={handleCancel}>
              将此用户更改为服务帐户会阻止用户登录 Web 界面并编辑其设置。 （例如，API 令牌）您想继续吗？
            </BootstrapModalConfirm>
          </>
        );
      }}

    </Field>
  );
};

export default ServiceAccountFormGroup;
