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
import PropTypes from 'prop-types';
import React from 'react';

import { Row, Col, Input } from 'components/bootstrap';
import FormUtils from 'util/FormsUtils';

class SplitAndCountConverterConfiguration extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    configuration: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.onChange(this.props.type, this._getConverterObject());
  }

  _getConverterObject = (configuration) => {
    return { type: this.props.type, config: configuration || this.props.configuration };
  };

  _toggleConverter = (event) => {
    let converter;

    if (FormUtils.getValueFromInput(event.target) === true) {
      converter = this._getConverterObject();
    }

    this.props.onChange(this.props.type, converter);
  };

  _onChange = (key) => {
    return (event) => {
      const newConfig = this.props.configuration;

      newConfig[key] = FormUtils.getValueFromInput(event.target);
      this.props.onChange(this.props.type, this._getConverterObject(newConfig));
    };
  };

  render() {
    const splitByHelpMessage = (
      <span>
        定义的特性正在分割拆分与计数转换器的提取部分，并将其标记为字段进行存储。
        <strong>例如：</strong> <em>?fields=first_name,last_name,zip</em> 按照 <em>,</em>{' '} 分割结果为 <em>3</em>")}
        您只是计数了GET用户的REST请求的请求领域.
      </span>
    );

    return (
      <div className="xtrc-converter">
        <Input type="checkbox"
               ref={(converterEnabled) => { this.converterEnabled = converterEnabled; }}
               id={`enable-${this.props.type}-converter`}
               label="拆分&计数"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked
               onChange={this._toggleConverter} />
        <Row className="row-sm">
          <Col md={9} mdOffset={2}>
            <div className="xtrc-converter-subfields">
              <Input type="text"
                     id={`${this.props.type}_converter_split_by`}
                     label="分割"
                     defaultValue={this.props.configuration.split_by}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     onChange={this._onChange('split_by')}
                     required={this.converterEnabled && this.converterEnabled.getChecked()}
                     help={splitByHelpMessage} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SplitAndCountConverterConfiguration;
