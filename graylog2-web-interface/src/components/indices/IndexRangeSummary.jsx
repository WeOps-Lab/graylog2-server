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

import RelativeTime from 'components/common/RelativeTime';

class IndexRangeSummary extends React.Component {
  static propTypes = {
    indexRange: PropTypes.object,
  };

  render() {
    const { indexRange } = this.props;

    if (!indexRange) {
      return <span><i>没有可用的索引范围.</i></span>;
    }

    return (
      <span>索引范围重新计算于{' '}
        <RelativeTime dateTime={indexRange.calculated_at} />{' '}
        耗时 {indexRange.took_ms}ms.
      </span>
    );
  }
}

export default IndexRangeSummary;
