import PropTypes from 'prop-types';
import React from 'react';

class BackupStrategySummary extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div>
        <dl>
          <dt>索引轮换策略:</dt>
          <dd>备份并删除</dd>
          <dt>最大索引数:</dt>
          <dd>{this.props.config.max_number_of_indices}</dd>
          <dt>备份路径:</dt>
          <dd>{this.props.config.backup_path}</dd>
        </dl>
      </div>
    );
  }
}

export default BackupStrategySummary;
