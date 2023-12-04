package org.etherfurnace.events;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.google.common.collect.ImmutableList;
import okhttp3.HttpUrl;
import org.graylog.events.notifications.*;
import org.graylog.events.processor.aggregation.AggregationEventProcessorConfig;
import org.graylog2.plugin.MessageSummary;
import org.graylog2.system.urlwhitelist.UrlWhitelistNotificationService;
import org.graylog2.system.urlwhitelist.UrlWhitelistService;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BlueKingUacEventNotification implements EventNotification {

    public interface Factory extends EventNotification.Factory {
        @Override
        BlueKingUacEventNotification create();
    }

    private static final Logger LOG = LoggerFactory.getLogger(BlueKingUacEventNotification.class);
    private final EventNotificationService notificationCallbackService;
    private final UrlWhitelistService whitelistService;
    private final UrlWhitelistNotificationService urlWhitelistNotificationService;

    @Inject
    public BlueKingUacEventNotification(EventNotificationService notificationCallbackService,
                                        UrlWhitelistService whitelistService,
                                        UrlWhitelistNotificationService urlWhitelistNotificationService) {
        this.notificationCallbackService = notificationCallbackService;
        this.whitelistService = whitelistService;
        this.urlWhitelistNotificationService = urlWhitelistNotificationService;
    }

    public static String getAlarmLevel(Integer priority) {
        Map<Integer, String> levelMap = new HashMap<>();
        levelMap.put(1, "remain");
        levelMap.put(2, "warning");
        levelMap.put(3, "fatal");
        String level = levelMap.getOrDefault(priority, "remain");
        return level;
    }

    public static JSONArray extractData (String eventMessage) {

        JSONArray extractedData = JSONUtil.createArray();

        // 使用正则表达式匹配提取 x(y)=num 的值
        String regex = "\\w+\\(\\w+\\)=\\d+\\.\\d+";
        Pattern pattern = Pattern.compile(regex);

        Matcher matcher = pattern.matcher(eventMessage);
        while (matcher.find()) {
            extractedData.add(matcher.group());
        }
        return extractedData;
    }


    @Override
    public void execute(EventNotificationContext ctx) throws TemporaryEventNotificationException, PermanentEventNotificationException {
        final BlueKingUacEventNotificationConfig config = (BlueKingUacEventNotificationConfig) ctx.notificationConfig();
        final HttpUrl httpUrl = HttpUrl.parse(config.url());
        String httpSecret = config.secret();
        DateTimeZone useZone = DateTimeZone.forID("Asia/Shanghai");
        String timeStr = "yyyy-MM-dd HH:mm:ss.SSS";

        if (httpUrl == null) {
            throw new TemporaryEventNotificationException(
                    "Malformed URL: <" + config.url() + "> in notification <" + ctx.notificationId() + ">");
        }

        ImmutableList<MessageSummary> backlog = notificationCallbackService.getBacklogForEvent(ctx);
        final EventNotificationModelData model = EventNotificationModelData.of(ctx, backlog);

        if (!whitelistService.isWhitelisted(config.url())) {
            if (!NotificationTestData.TEST_NOTIFICATION_ID.equals(ctx.notificationId())) {
                publishSystemNotificationForWhitelistFailure(config.url(), model.eventDefinitionTitle());
            }
            throw new TemporaryEventNotificationException("URL <" + config.url() + "> is not whitelisted.");
        }

        JSONObject jsonObject = JSONUtil.createObj();
        jsonObject.putOpt("source_time", ctx.event().eventTimestamp().toDateTime(useZone).toString("yyyy-MM-dd HH:mm:ss"));
        jsonObject.putOpt("action", "firing");
        jsonObject.putOpt("alarm_type", "api_default");
        jsonObject.putOpt("level", getAlarmLevel((int) ctx.event().priority()));

        String bk_obj_id = ctx.event().fields().get("bk_obj_id");
        String bk_biz_id = ctx.event().fields().get("bk_biz_id");
        String bk_biz_name = ctx.event().fields().get("bk_biz_name");
        String bk_inst_id = ctx.event().fields().get("bk_inst_id");
        String bk_inst_name = ctx.event().fields().get("bk_inst_name");
        String rule = ctx.event().fields().get("rule");
        String object = ctx.event().fields().get("object");
        String ip = ctx.event().fields().get("ip");
        String alarm_name = ctx.event().fields().get("alarm_name");
        String alarm_content = ctx.event().fields().get("alarm_content");

        jsonObject.putOpt("bk_obj_id", bk_obj_id);
        jsonObject.putOpt("bk_biz_id", bk_biz_id);
        jsonObject.putOpt("bk_biz_name", bk_biz_name);
        jsonObject.putOpt("bk_inst_id", bk_inst_id);
        jsonObject.putOpt("bk_inst_name", bk_inst_name);
        jsonObject.putOpt("expansion_field_1", rule);
        jsonObject.putOpt("object", object);
        jsonObject.putOpt("ip", ip);
        jsonObject.putOpt("alarm_name", alarm_name);
        jsonObject.putOpt("alarm_content", alarm_content);
        jsonObject.putOpt("id", UUID.randomUUID());

        if (object == null) {
            jsonObject.putOpt("object", bk_inst_name);
        }

        JSONObject condition = JSONUtil.createObj();
        AggregationEventProcessorConfig conf = (AggregationEventProcessorConfig) ctx.eventDefinition().get().config();

        // 获取原始日志查询参数
        if (ctx.event().fields().get("gl2_message_id") == null || ctx.event().fields().get("gl2_message_id").isEmpty()){
            condition.putOpt("query", conf.query());
        } else {
            condition.putOpt("query", "gl2_message_id:" + ctx.event().fields().get("gl2_message_id"));
        }

        // 获取原始日志查询时间范围
        if (ctx.event().timerangeStart().isPresent() && ctx.event().timerangeEnd().isPresent()){
            condition.putOpt("timerangeStart", ctx.event().timerangeStart().get().toDateTime(useZone).toString(timeStr));
            condition.putOpt("timerangeEnd", ctx.event().timerangeEnd().get().toDateTime(useZone).toString(timeStr));
        } else {
            condition.putOpt("timerangeStart", ctx.event().eventTimestamp().minus(
                    conf.searchWithinMs() + 300000).toDateTime(useZone).toString(timeStr));
            condition.putOpt("timerangeEnd", ctx.event().eventTimestamp().toDateTime(useZone).toString(timeStr));
        }

        JSONObject meta_info = JSONUtil.createObj();
        meta_info.putOpt("streams", conf.streams());
        meta_info.putOpt("condition", condition);
        meta_info.putOpt("show_fields", ctx.event().fields().get("show_fields"));
        meta_info.putOpt("title", ctx.eventDefinition().get().title());

        JSONArray aggregatedData = extractData(ctx.event().message());

        if (! aggregatedData.isEmpty()) {
            JSONObject groupAggregationTable = JSONUtil.createObj();
            for (Object element : aggregatedData) {
                String[] splitResult = element.toString().split("=");
                try {
                    groupAggregationTable.putOpt(splitResult[0], splitResult[1]);
                }catch (Exception e) {
                    LOG.error("获取告警聚合数据失败！数据详情："+ element.toString());
                }
            }
            for (Map.Entry<String, String> entry : ctx.event().groupByFields().entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                groupAggregationTable.putOpt(key, value);
            }
            meta_info.putOpt("group_aggregation_table", groupAggregationTable);
        }

        jsonObject.putOpt("meta_info", meta_info.toString());

        HttpResponse response = HttpRequest.post(String.valueOf(httpUrl))
                .header("X-Secret", httpSecret)
                .body(jsonObject.toString())
                .execute();
        LOG.info("告警名称:" + alarm_name + ",告警推送结果：" + response.body());

    }

    private void publishSystemNotificationForWhitelistFailure(String url, String eventNotificationTitle) {
        final String description = "告警通知 \"" + eventNotificationTitle +
                "\" 不在白名单内，请检查配置. [url: \"" +
                url + "\"]";
        urlWhitelistNotificationService.publishWhitelistFailure(description);
    }
}
