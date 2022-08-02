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
package org.graylog2.indexer.searches;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.graylog.autovalue.WithBeanGetter;
import org.graylog2.plugin.Message;
import org.joda.time.Period;

import javax.annotation.Nullable;
import java.util.Map;
import java.util.Set;

@JsonAutoDetect
@AutoValue
@WithBeanGetter
public abstract class SearchesClusterConfig {
    private static final Period DEFAULT_QUERY_TIME_RANGE_LIMIT = Period.ZERO;
    private static final Map<Period, String> DEFAULT_RELATIVE_TIMERANGE_OPTIONS = ImmutableMap.<Period, String>builder()
            .put(Period.minutes(5), "搜索最近5分钟")
            .put(Period.minutes(15), "搜索最近15分钟")
            .put(Period.minutes(30), "搜索最近30分钟")
            .put(Period.hours(1), "搜索最近1小时")
            .put(Period.hours(2), "搜索最近2小时")
            .put(Period.hours(8), "搜索最近8小时")
            .put(Period.days(1), "搜索最近1天")
            .put(Period.days(2), "搜索最近2天")
            .put(Period.days(5), "搜索最近5天")
            .put(Period.days(7), "搜索最近7天")
            .put(Period.days(14), "搜索最近14天")
            .put(Period.days(30), "搜索最近30天")
            .put(Period.ZERO, "搜索所有时间的日志")
            .build();
    private static final Map<Period, String> DEFAULT_SURROUNDING_TIMERANGE_OPTIONS = ImmutableMap.<Period, String>builder()
            .put(Period.seconds(1), "1秒")
            .put(Period.seconds(5), "5秒")
            .put(Period.seconds(10), "10秒")
            .put(Period.seconds(30), "30秒")
            .put(Period.minutes(1), "1分")
            .put(Period.minutes(5), "5分")
            .build();
    private static final Set<String> DEFAULT_SURROUNDING_FILTER_FIELDS = ImmutableSet.<String>builder()
            .add("source")
            .add(Message.FIELD_GL2_SOURCE_INPUT)
            .add("file")
            .add("source_file")
            .build();
    private static final Set<String> DEFAULT_ANALYSIS_DISABLED_FIELDS = ImmutableSet.<String>builder()
            .add("message")
            .add("full_message")
            .build();

    @JsonProperty("query_time_range_limit")
    public abstract Period queryTimeRangeLimit();

    @JsonProperty("relative_timerange_options")
    public abstract Map<Period, String> relativeTimerangeOptions();

    @JsonProperty("surrounding_timerange_options")
    public abstract Map<Period, String> surroundingTimerangeOptions();

    @JsonProperty("surrounding_filter_fields")
    public abstract Set<String> surroundingFilterFields();

    @JsonProperty("analysis_disabled_fields")
    public abstract Set<String> analysisDisabledFields();

    @JsonCreator
    public static SearchesClusterConfig create(@JsonProperty("query_time_range_limit") Period queryTimeRangeLimit,
                                               @JsonProperty("relative_timerange_options") Map<Period, String> relativeTimerangeOptions,
                                               @JsonProperty("surrounding_timerange_options") Map<Period, String> surroundingTimerangeOptions,
                                               @JsonProperty("surrounding_filter_fields") Set<String> surroundingFilterFields,
                                               @JsonProperty("analysis_disabled_fields") @Nullable Set<String> analysisDisabledFields) {
        return builder()
                .queryTimeRangeLimit(queryTimeRangeLimit)
                .relativeTimerangeOptions(relativeTimerangeOptions)
                .surroundingTimerangeOptions(surroundingTimerangeOptions)
                .surroundingFilterFields(surroundingFilterFields)
                .analysisDisabledFields(analysisDisabledFields == null ? DEFAULT_ANALYSIS_DISABLED_FIELDS : analysisDisabledFields)
                .build();
    }

    public static SearchesClusterConfig createDefault() {
        return builder()
                .queryTimeRangeLimit(DEFAULT_QUERY_TIME_RANGE_LIMIT)
                .relativeTimerangeOptions(DEFAULT_RELATIVE_TIMERANGE_OPTIONS)
                .surroundingTimerangeOptions(DEFAULT_SURROUNDING_TIMERANGE_OPTIONS)
                .surroundingFilterFields(DEFAULT_SURROUNDING_FILTER_FIELDS)
                .analysisDisabledFields(DEFAULT_ANALYSIS_DISABLED_FIELDS)
                .build();
    }

    public static Builder builder() {
        return new AutoValue_SearchesClusterConfig.Builder();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public static abstract class Builder {
        public abstract Builder queryTimeRangeLimit(Period queryTimeRangeLimit);
        public abstract Builder relativeTimerangeOptions(Map<Period, String> relativeTimerangeOptions);
        public abstract Builder surroundingTimerangeOptions(Map<Period, String> surroundingTimerangeOptions);
        public abstract Builder surroundingFilterFields(Set<String> surroundingFilterFields);
        public abstract Builder analysisDisabledFields(Set<String> analysisDisabledFields);

        public abstract SearchesClusterConfig build();
    }
}
