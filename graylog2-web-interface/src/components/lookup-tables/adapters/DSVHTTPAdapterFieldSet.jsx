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

import { Input } from 'components/bootstrap';
import { URLWhiteListInput } from 'components/common';

const DSVHTTPAdapterFieldSet = ({ handleFormEvent, validationState, validationMessage, config }) => {
  return (
    <fieldset>
      <URLWhiteListInput label="文件URL"
                         onChange={handleFormEvent}
                         validationMessage={validationMessage('url', 'DSV文件的URL.')}
                         validationState={validationState('url')}
                         url={config.url}
                         labelClassName="col-sm-3"
                         wrapperClassName="col-sm-9" />
      <Input type="number"
             id="refresh_interval"
             name="refresh_interval"
             label="刷新间隔"
             required
             onChange={handleFormEvent}
             help="检查DSV是否需要重新加载. (秒)"
             value={config.refresh_interval}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="separator"
             name="separator"
             label="分隔符"
             required
             onChange={handleFormEvent}
             help="实体之间的分隔符."
             value={config.separator}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="line_separator"
             name="line_separator"
             label="行分隔符"
             required
             onChange={handleFormEvent}
             help="行的分隔符."
             value={config.line_separator}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="quotechar"
             name="quotechar"
             label="引用字符"
             required
             onChange={handleFormEvent}
             help="用于引用元素的字符."
             value={config.quotechar}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="ignorechar"
             name="ignorechar"
             label="忽略字符"
             required
             onChange={handleFormEvent}
             help="忽略以这些字符开始的行."
             value={config.ignorechar}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="key_column"
             name="key_column"
             label="键列"
             required
             onChange={handleFormEvent}
             help="用于做查找的键."
             value={config.key_column}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="text"
             id="value_column"
             name="value_column"
             label="值列"
             required
             onChange={handleFormEvent}
             help="映射的结果列."
             value={config.value_column}
             labelClassName="col-sm-3"
             wrapperClassName="col-sm-9" />
      <Input type="checkbox"
             id="case_insensitive_lookup"
             name="case_insensitive_lookup"
             label="忽略大小写"
             checked={config.case_insensitive_lookup}
             onChange={handleFormEvent}
             help="是否启用忽略大小写的功能."
             wrapperClassName="col-md-offset-3 col-md-9" />
      <Input type="checkbox"
             id="check_presence_only"
             name="check_presence_only"
             label="检查是否存在"
             checked={config.check_presence_only}
             onChange={handleFormEvent}
             help="只检查映射表中存在的键,返回布尔值替换对应的值."
             wrapperClassName="col-md-offset-3 col-md-9" />
    </fieldset>
  );
};

DSVHTTPAdapterFieldSet.propTypes = {
  config: PropTypes.object.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleFormEvent: PropTypes.func.isRequired,
  validationState: PropTypes.func.isRequired,
  validationMessage: PropTypes.func.isRequired,
};

export default DSVHTTPAdapterFieldSet;
