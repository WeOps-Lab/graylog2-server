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
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';

import {Icon} from 'components/common';
import {Col, Row, Button, Input} from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import ExtractorUtils from 'util/ExtractorUtils';
import FormUtils from 'util/FormsUtils';
import ToolsStore from 'stores/tools/ToolsStore';

const DEFAULT_CONFIGURATION = {index: 1};

const _getEffectiveConfiguration = (configuration) => ExtractorUtils.getEffectiveConfiguration(DEFAULT_CONFIGURATION, configuration);

type Configuration = { [key: string]: string };
type Props = {
  configuration: Configuration,
  exampleMessage: string,
  onChange: (newConfig: Configuration) => void,
  onExtractorPreviewLoad: (preview: React.ReactNode | string) => void,
}

const SplitAndIndexExtractorConfiguration = ({
                                               configuration: initialConfiguration,
                                               exampleMessage,
                                               onChange,
                                               onExtractorPreviewLoad
                                             }: Props) => {
  const [configuration, setConfiguration] = useState(_getEffectiveConfiguration(initialConfiguration));
  useEffect(() => {
    setConfiguration(_getEffectiveConfiguration(initialConfiguration));
  }, [initialConfiguration]);

  const [trying, setTrying] = useState(false);

  const _onChange = (key: string) => {
    return (event) => {
      onExtractorPreviewLoad(undefined);
      const newConfig = configuration;

      newConfig[key] = FormUtils.getValueFromInput(event.target);
      onChange(newConfig);
    };
  };

  const _onTryClick = useCallback(() => {
    setTrying(true);

    const promise = ToolsStore.testSplitAndIndex(configuration.split_by, configuration.index, exampleMessage);

    promise.then((result) => {
      if (!result.successful) {
        UserNotification.warning('无法运行拆分和索引提取,请检查您的参数.');

        return;
      }

      const preview = (result.cut ? <samp>{result.cut}</samp> : '');

      onExtractorPreviewLoad(preview);
    });

    promise.finally(() => setTrying(false));
  }, [configuration.index, configuration.split_by, exampleMessage, onExtractorPreviewLoad]);

  const splitByHelpMessage = (
    <span>
        用什么字符进行分隔. <strong>例如：</strong> 一个空格符将会把{' '}
      <em>foo bar baz</em> 分隔成 <em>[foo,bar,baz]</em>.
    </span>
  );

  const indexHelpMessage = (
    <span>
        想要分隔字符串哪一部分?
        <strong>例如:</strong> 用空格分隔后的 <em>foo bar baz</em> 的第 <em>2</em> 部分是 <em>bar</em>.
      </span>
  );

  const isTryButtonDisabled = trying || configuration.split_by === '' || configuration.index === undefined || configuration.index < 1 || !exampleMessage;

  return (
    <div>
      <Input type="text"
             id="split_by"
             label="分隔符"
             labelClassName="col-md-2"
             wrapperClassName="col-md-10"
             defaultValue={configuration.split_by}
             onChange={_onChange('split_by')}
             required
             help={splitByHelpMessage}/>

      <Input type="number"
             id="index"
             label="目标索引"
             labelClassName="col-md-2"
             wrapperClassName="col-md-10"
             defaultValue={configuration.index}
             onChange={_onChange('index')}
             min="1"
             required
             help={indexHelpMessage}/>

      <Row>
        <Col mdOffset={2} md={10}>
          <Button bsStyle="info" onClick={_onTryClick} disabled={isTryButtonDisabled}>
            {trying ? <Icon name="spinner" spin/> : '测试'}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

SplitAndIndexExtractorConfiguration.propTypes = {
  configuration: PropTypes.object.isRequired,
  exampleMessage: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onExtractorPreviewLoad: PropTypes.func.isRequired,
};

SplitAndIndexExtractorConfiguration.defaultProps = {
  exampleMessage: undefined,
};

export default SplitAndIndexExtractorConfiguration;
