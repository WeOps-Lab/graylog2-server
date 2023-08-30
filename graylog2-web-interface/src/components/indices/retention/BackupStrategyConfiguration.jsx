import PropTypes from 'prop-types';
import React from 'react';
import {Input} from 'components/bootstrap';
import {getValueFromInput} from "../../../util/FormsUtils";

class BackupStrategyConfiguration extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    jsonSchema: PropTypes.object.isRequired,
    updateConfig: PropTypes.func.isRequired,
  };

  state = {
    max_number_of_indices: this.props.config.max_number_of_indices,
    backup_path: this.props.config.backup_path,
  };

  _onInputUpdate = (field) => {
    return (e) => {
      const update = {};
      const value = getValueFromInput(e.target);
      update[field] = value;

      setMaxNumberOfIndices(value);
      updateConfig(update);
    };
  };

  render() {
    return (
      <div>
        <Input type="number"
               id="max-number-of-indices"
               label="最大索引数"
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9"
               onChange={this._onInputUpdate('max_number_of_indices')}
               value={this.state.max_number_of_indices}
               help={<span>达到最大索引数时将对旧索引进行备份并删除</span>}
               required/>
        <Input type="text"
               id="backup_path"
               label="备份路径"
               labelClassName="col-sm-3"
               wrapperClassName="col-sm-9"
               onChange={this._onInputUpdate('backup_path')}
               value={this.state.backup_path || ''}
               help={<span>填写备份路径，请确保您在Elasticsearch中已经定义好 <strong>path.repo: ["绝对路径"]</strong> 参数。</span>}
               required/>
      </div>
    );
  }
}

export default BackupStrategyConfiguration;
