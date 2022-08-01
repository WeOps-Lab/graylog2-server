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

import { ButtonGroup, DropdownButton, MenuItem } from 'components/bootstrap';
import { DeflectorActions } from 'stores/indices/DeflectorStore';
import { IndexRangesActions } from 'stores/indices/IndexRangesStore';

class IndicesMaintenanceDropdown extends React.Component {
  static propTypes = {
    indexSetId: PropTypes.string.isRequired,
    indexSet: PropTypes.object,
  };

  _onRecalculateIndexRange = () => {
    if (window.confirm('这将使用后台系统作业重新计算此索引集的索引范围,你想继续吗?')) {
      const { indexSetId } = this.props;
      IndexRangesActions.recalculate(indexSetId);
    }
  };

  _onCycleDeflector = () => {
    if (window.confirm('这将手动循环此索引集上的当前活动写入索引。你想继续吗?')) {
      const { indexSetId } = this.props;

      DeflectorActions.cycle(indexSetId).then(() => {
        DeflectorActions.list(indexSetId);
      });
    }
  };

  render() {
    let cycleButton;

    const { indexSet } = this.props;

    if (indexSet?.writable) {
      cycleButton = <MenuItem eventKey="2" onClick={this._onCycleDeflector}>创建新索引</MenuItem>;
    }

    return (
      <ButtonGroup>
        <DropdownButton bsStyle="info" title="Maintenance" id="indices-maintenance-actions" pullRight>
          <MenuItem eventKey="1" onClick={this._onRecalculateIndexRange}>更新索引范围</MenuItem>
          {cycleButton}
        </DropdownButton>
      </ButtonGroup>
    );
  }
}

export default IndicesMaintenanceDropdown;
