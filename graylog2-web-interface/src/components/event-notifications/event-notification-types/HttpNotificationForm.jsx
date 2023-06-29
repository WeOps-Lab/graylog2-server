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
import lodash from 'lodash';

import {URLWhiteListInput} from 'components/common';
import * as FormsUtils from 'util/FormsUtils';
import {ControlLabel, Input} from "../../bootstrap";

class HttpNotificationForm extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    setIsSubmitEnabled: PropTypes.func,
  };

  static defaultConfig = {
    url: '',
    secret: '',
  };

  propagateChange = (key, value) => {
    const {config, onChange} = this.props;
    const nextConfig = lodash.cloneDeep(config);

    nextConfig[key] = value;
    onChange(nextConfig);
  };

  handleChange = (event) => {
    const {name} = event.target;
    this.propagateChange(name, FormsUtils.getValueFromInput(event.target));
  };

  onValidationChange = (validationState) => {
    const {setIsSubmitEnabled} = this.props;

    setIsSubmitEnabled(validationState !== 'error');
  };

  render() {
    const {config, validation} = this.props;

    return (
      <div>
        <URLWhiteListInput label="URL"
                           onChange={this.handleChange}
                           validationState={validation.errors.url ? 'error' : null}
                           validationMessage={lodash.get(validation, 'errors.url[0]', '当事件发生时触发的URL.')}
                           onValidationChange={this.onValidationChange}
                           url={config.url}/>
        <Input id="notification-secret"
               name="secret"
               label="告警中心秘钥"
               type="text"
               bsStyle={validation.errors.secret ? 'error' : null}
               help={lodash.get(validation, 'errors.secret[0]', '告警中心秘钥')}
               value={config.secret || ''}
               onChange={this.handleChange}
               required/>
      </div>

    );
  }
}

HttpNotificationForm.defaultProps = {
  setIsSubmitEnabled: () => {
  },
};

export default HttpNotificationForm;
