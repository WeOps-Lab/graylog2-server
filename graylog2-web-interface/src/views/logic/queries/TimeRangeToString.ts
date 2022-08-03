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

import moment from 'moment';
import 'moment-duration-format';
import 'moment-precise-range-plugin';

moment.locale('zh-cn');
import type {AbsoluteTimeRange, KeywordTimeRange, RelativeTimeRange, TimeRange} from 'views/logic/queries/Query';
import {isTypeRelativeWithStartOnly} from 'views/typeGuards/timeRange';

export const readableRange = (timerange: TimeRange, fieldName: 'range' | 'from' | 'to', placeholder = '以前') => {
  const rangeAsSeconds = timerange?.[fieldName];

  if (!rangeAsSeconds) {
    return placeholder;
  }

  const dateAgo = moment().subtract(rangeAsSeconds, 'seconds');
  let rangeTimespan = moment.preciseDiff(moment(), dateAgo);

  rangeTimespan = rangeTimespan.replace('seconds', '秒')
  rangeTimespan = rangeTimespan.replace('second', '秒')
  rangeTimespan = rangeTimespan.replace('minutes', '分钟')
  rangeTimespan = rangeTimespan.replace('minute', '分钟')
  rangeTimespan = rangeTimespan.replace('hours', '小时')
  rangeTimespan = rangeTimespan.replace('hour', '小时')
  rangeTimespan = rangeTimespan.replace('days', '天')
  rangeTimespan = rangeTimespan.replace('day', '天')
  debugger
  if (rangeTimespan == 'Now') {
    return '现在'
  }
  return `${rangeTimespan} 前`;
};

const relativeTimeRangeToString = (timerange: RelativeTimeRange): string => {

  if (isTypeRelativeWithStartOnly(timerange)) {
    if (timerange.range === 0) {
      return '所有时间';
    }

    return `${readableRange(timerange, 'range')} - Now`;
  }

  return `${readableRange(timerange, 'from')} - ${readableRange(timerange, 'to', 'Now')}`;
};

const absoluteTimeRangeToString = (timerange: AbsoluteTimeRange, localizer = (str) => str): string => {
  const {from, to} = timerange;

  return `${localizer(from)} - ${localizer(to)}`;
};

const keywordTimeRangeToString = (timerange: KeywordTimeRange): string => {
  return timerange.keyword;
};

const TimeRangeToString = (timerange?: TimeRange, localizer?: (string) => string): string => {
  const {type} = timerange || {};
  switch (type) {
    case 'relative':
      return relativeTimeRangeToString(timerange as RelativeTimeRange);
    case 'absolute':
      return absoluteTimeRangeToString(timerange as AbsoluteTimeRange, localizer);
    case 'keyword':
      return keywordTimeRangeToString(timerange as KeywordTimeRange);

    default: {
      return '';
    }
  }
};

export default TimeRangeToString;
