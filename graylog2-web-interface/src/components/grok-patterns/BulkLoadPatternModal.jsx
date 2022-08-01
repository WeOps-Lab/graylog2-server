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

import { Button, Input } from 'components/bootstrap';
import UserNotification from 'util/UserNotification';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { GrokPatternsStore } from 'stores/grok-patterns/GrokPatternsStore';

class BulkLoadPatternModal extends React.Component {
  static propTypes = {
    onSuccess: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      importStrategy: 'ABORT_ON_CONFLICT',
    };
  }

  _onSubmit = (evt) => {
    evt.preventDefault();

    const reader = new FileReader();
    const { importStrategy } = this.state;
    const { onSuccess } = this.props;

    reader.onload = (loaded) => {
      const request = loaded.target.result;

      GrokPatternsStore.bulkImport(request, importStrategy).then(() => {
        UserNotification.success('Grok表达式导入成功', '成功!');
        this.modal.close();
        onSuccess();
      });
    };

    reader.readAsText(this.patternFile.getInputDOMNode().files[0]);
  };

  _onImportStrategyChange = (event) => this.setState({ importStrategy: event.target.value });

  _resetImportStrategy = () => this.setState({ importStrategy: 'ABORT_ON_CONFLICT' });

  render() {
    return (
      <span>
        <Button bsStyle="info" style={{ marginRight: 5 }} onClick={() => this.modal.open()}>导入文件</Button>

        <BootstrapModalForm ref={(modal) => { this.modal = modal; }}
                            title="从文件中导入Grok表达式"
                            submitButtonText="上传"
                            onModalClose={this._resetImportStrategy}
                            onSubmitForm={this._onSubmit}>
          <Input id="pattern-file"
                 type="file"
                 ref={(patternFile) => { this.patternFile = patternFile; }}
                 name="patterns"
                 label="表达式文件"
                 help="一个包含Grok表达式的文件,每行一个表达式.名称和表达式应该由空格分隔."
                 required />
          <Input id="abort-on-conflicting-patterns-radio"
                 type="radio"
                 name="import-strategy"
                 value="ABORT_ON_CONFLICT"
                 label="如果已存在同名模式，则中止导入"
                 defaultChecked
                 onChange={(e) => this._onImportStrategyChange(e)} />
          <Input id="replace-conflicting-patterns-radio"
                 type="radio"
                 name="import-strategy"
                 value="REPLACE_ON_CONFLICT"
                 label="用相同名称替换现有模式"
                 onChange={(e) => this._onImportStrategyChange(e)} />
          <Input id="drop-existing-patterns-radio"
                 type="radio"
                 name="import-strategy"
                 value="DROP_ALL_EXISTING"
                 label="导入前删除所有现有模式"
                 onChange={(e) => this._onImportStrategyChange(e)} />
        </BootstrapModalForm>
      </span>
    );
  }
}

export default BulkLoadPatternModal;
