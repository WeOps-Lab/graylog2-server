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

import { LocaleSelect, TimezoneSelect } from 'components/common';
import { Row, Col, Input } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import FormUtils from 'util/FormsUtils';

class DateConverterConfiguration extends React.Component {
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
    return (data) => {
      const newConfig = this.props.configuration;

      // data can be an event or a value, we need to check its type :sick:
      newConfig[key] = typeof data === 'object' ? FormUtils.getValueFromInput(data.target) : data;
      this.props.onChange(this.props.type, this._getConverterObject(newConfig));
    };
  };

  render() {
    const dateFormatHelpMessage = (
      <span>
        将字符串格式化成日期,请参考Java8的简单日期格式化字符串.
        在<DocumentationLink page={DocsHelper.PAGES.PAGE_STANDARD_DATE_CONVERTER} text="文档" />查看更多信息.
      </span>
    );

    const timezoneHelpMessage = (
      <span>
        当前日期所在的时区.
        在<DocumentationLink page={DocsHelper.PAGES.PAGE_STANDARD_DATE_CONVERTER} text="文档" />查看更多信息.
      </span>
    );

    const localeHelpMessage = (
      <span>
        解析日期的地区.
        在<DocumentationLink page={DocsHelper.PAGES.PAGE_STANDARD_DATE_CONVERTER} text="文档" />查看更多信息.
      </span>
    );

    return (
      <div className="xtrc-converter">
        <Input type="checkbox"
               ref={(converterEnabled) => { this.converterEnabled = converterEnabled; }}
               id={`enable-${this.props.type}-converter`}
               label="转换为date类型"
               wrapperClassName="col-md-offset-2 col-md-10"
               defaultChecked
               onChange={this._toggleConverter} />
        <Row className="row-sm">
          <Col md={9} mdOffset={2}>
            <div className="xtrc-converter-subfields">
              <Input type="text"
                     id={`${this.props.type}_converter_date_format`}
                     label="格式化字符串"
                     defaultValue={this.props.configuration.date_format}
                     labelClassName="col-md-3"
                     wrapperClassName="col-md-9"
                     placeholder="yyyy-MM-dd HH:mm:ss.SSS"
                     onChange={this._onChange('date_format')}
                     required={this.converterEnabled && this.converterEnabled.getChecked()}
                     help={dateFormatHelpMessage} />

              <Input label="时区"
                     id={`${this.props.type}_converter_timezone`}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9"
                     help={timezoneHelpMessage}>
                <TimezoneSelect id={`${this.props.type}_converter_timezone`}
                                className="timezone-select"
                                value={this.props.configuration.time_zone}
                                onChange={this._onChange('time_zone')} />
              </Input>
              <Input label="地区"
                     id={`${this.props.type}_converter_locale`}
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9"
                     help={localeHelpMessage}>
                <LocaleSelect id={`${this.props.type}_converter_locale`}
                              className="locale-select"
                              value={this.props.configuration.locale}
                              onChange={this._onChange('locale')} />
              </Input>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default DateConverterConfiguration;
