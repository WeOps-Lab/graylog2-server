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
package org.graylog2.alerts.types;

import com.google.common.collect.Lists;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.alerts.AbstractAlertCondition;
import org.graylog2.indexer.results.CountResult;
import org.graylog2.indexer.results.ResultMessage;
import org.graylog2.indexer.results.SearchResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.Sorting;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.MessageSummary;
import org.graylog2.plugin.Tools;
import org.graylog2.plugin.alarms.AlertCondition;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.DropdownField;
import org.graylog2.plugin.configuration.fields.NumberField;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.InvalidRangeParametersException;
import org.graylog2.plugin.indexer.searches.timeranges.RelativeRange;
import org.graylog2.plugin.streams.Stream;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

public class MessageCountAlertCondition extends AbstractAlertCondition {
    private static final Logger LOG = LoggerFactory.getLogger(MessageCountAlertCondition.class);

    enum ThresholdType {

        MORE("大于"),
        LESS("小于");

        private final String description;

        ThresholdType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public interface Factory extends AlertCondition.Factory {
        @Override
        MessageCountAlertCondition create(Stream stream,
                                          @Assisted("id") String id,
                                          DateTime createdAt,
                                          @Assisted("userid") String creatorUserId,
                                          Map<String, Object> parameters,
                                          @Assisted("title") @Nullable String title);

        @Override
        MessageCountAlertCondition.Config config();

        @Override
        MessageCountAlertCondition.Descriptor descriptor();
    }

    public static class Config implements AlertCondition.Config {
        public Config() {
        }

        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            final ConfigurationRequest configurationRequest = ConfigurationRequest.createWithFields(
                    new NumberField("time", "时间范围(分)", 5, "检查在给定的分钟数内接收到的所有消息的条件", ConfigurationField.Optional.NOT_OPTIONAL),
                    new DropdownField(
                            "threshold_type",
                            "阈值类型",
                            ThresholdType.MORE.toString(),
                            Arrays.stream(ThresholdType.values()).collect(Collectors.toMap(Enum::toString, ThresholdType::getDescription)),
                            "选择一种阈值类型:当大于或小于阈值的时候告警",
                            ConfigurationField.Optional.NOT_OPTIONAL),
                    new NumberField("threshold", "阈值", 0.0, "超过此阈值则告警", ConfigurationField.Optional.NOT_OPTIONAL)
            );
            configurationRequest.addFields(AbstractAlertCondition.getDefaultConfigurationFields());

            return configurationRequest;
        }
    }

    public static class Descriptor extends AlertCondition.Descriptor {
        public Descriptor() {
            super(
                    "日志消息计数告警",
                    "",
                    "当日志消息的计数大于或小于阈值的时候进行告警."
            );
        }
    }

    private final int time;
    private final ThresholdType thresholdType;
    private final int threshold;
    private final String query;
    private final Searches searches;

    @AssistedInject
    public MessageCountAlertCondition(Searches searches,
                                      @Assisted Stream stream,
                                      @Nullable @Assisted("id") String id,
                                      @Assisted DateTime createdAt,
                                      @Assisted("userid") String creatorUserId,
                                      @Assisted Map<String, Object> parameters,
                                      @Nullable @Assisted("title") String title) {
        super(stream, id, Type.MESSAGE_COUNT.toString(), createdAt, creatorUserId, parameters, title);

        this.searches = searches;
        this.time = Tools.getNumber(parameters.get("time"), 5).intValue();

        final String thresholdType = (String) parameters.get("threshold_type");
        final String upperCaseThresholdType = thresholdType.toUpperCase(Locale.ENGLISH);

        /*
         * Alert conditions created before 2.2.0 had a threshold_type parameter in lowercase, but this was
         * inconsistent with the parameters in FieldValueAlertCondition, which were always stored in uppercase.
         * To ensure we return the expected case in the API and also store the right case in the database, we
         * are converting the parameter to uppercase here, if it wasn't uppercase already.
         */
        if (!thresholdType.equals(upperCaseThresholdType)) {
            final HashMap<String, Object> updatedParameters = new HashMap<>();
            updatedParameters.putAll(parameters);
            updatedParameters.put("threshold_type", upperCaseThresholdType);
            super.setParameters(updatedParameters);
        }
        this.thresholdType = ThresholdType.valueOf(upperCaseThresholdType);
        this.threshold = Tools.getNumber(parameters.get("threshold"), 0).intValue();
        this.query = (String) parameters.getOrDefault(CK_QUERY, CK_QUERY_DEFAULT_VALUE);
    }

    @Override
    public String getDescription() {
        return "时间: " + time
                + ", 阈值类型: " + thresholdType.toString().toLowerCase(Locale.ENGLISH)
                + ", 阈值: " + threshold
                + ", 宽限时间: " + grace
                + ", 重复提醒: " + repeatNotifications;
    }

    @Override
    public CheckResult runCheck() {
        try {
            // Create an absolute range from the relative range to make sure it doesn't change during the two
            // search requests. (count and find messages)
            // This is needed because the RelativeRange computes the range from NOW on every invocation of getFrom() and
            // getTo().
            // See: https://github.com/Graylog2/graylog2-server/issues/2382
            final RelativeRange relativeRange = RelativeRange.create(time * 60);
            final AbsoluteRange range = AbsoluteRange.create(relativeRange.getFrom(), relativeRange.getTo());

            final String filter = buildQueryFilter(stream.getId(), query);
            final CountResult result = searches.count("*", range, filter);
            final long count = result.count();

            LOG.debug("Alert check <{}> result: [{}]", id, count);

            final boolean triggered;
            switch (thresholdType) {
                case MORE:
                    triggered = count > threshold;
                    break;
                case LESS:
                    triggered = count < threshold;
                    break;
                default:
                    triggered = false;
            }

            if (triggered) {
                final List<MessageSummary> summaries = Lists.newArrayList();
                if (getBacklog() > 0) {
                    final SearchResult backlogResult = searches.search("*", filter,
                            range, getBacklog(), 0, new Sorting(Message.FIELD_TIMESTAMP, Sorting.Direction.DESC));
                    for (ResultMessage resultMessage : backlogResult.getResults()) {
                        final Message msg = resultMessage.getMessage();
                        summaries.add(new MessageSummary(resultMessage.getIndex(), msg));
                    }
                }

                final String resultDescription =
                        "日志流在最近的" + time
                                + "分钟内搜索到" + count + "条日志消息,"
                                + "阈值为"
                                + thresholdType.getDescription()
                                + threshold
                                + "(宽限时间为: " + grace + " 分钟)";
                return new CheckResult(true, this, resultDescription, Tools.nowUTC(), summaries);
            } else {
                return new NegativeCheckResult();
            }
        } catch (InvalidRangeParametersException e) {
            // cannot happen lol
            LOG.error("Invalid timerange.", e);
            return null;
        }
    }
}
