package org.etherfurnace.events;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.google.common.collect.ImmutableList;
import okhttp3.HttpUrl;
import org.graylog.events.notifications.*;
import org.graylog.events.processor.aggregation.AggregationEventProcessorConfig;
import org.graylog2.plugin.MessageSummary;
import org.graylog2.system.urlwhitelist.UrlWhitelistNotificationService;
import org.graylog2.system.urlwhitelist.UrlWhitelistService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

    @Override
    public void execute(EventNotificationContext ctx) throws TemporaryEventNotificationException, PermanentEventNotificationException {
        final BlueKingUacEventNotificationConfig config = (BlueKingUacEventNotificationConfig) ctx.notificationConfig();
        final HttpUrl httpUrl = HttpUrl.parse(config.url());
        String httpSecret = config.secret();

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
        jsonObject.putOpt("source_time", ctx.event().eventTimestamp().toString("yyyy-MM-dd HH:mm:ss"));
        jsonObject.putOpt("action", "firing");
        jsonObject.putOpt("alarm_type", "api_default");
        jsonObject.putOpt("level", getAlarmLevel((int) ctx.event().priority()));

        String bk_obj_id = ctx.event().fields().get("bk_obj_id");
        String bk_biz_id = ctx.event().fields().get("bk_biz_id");
        String bk_biz_name = ctx.event().fields().get("bk_biz_name");
        String bk_inst_id = ctx.event().fields().get("bk_inst_id");
        String bk_inst_name = ctx.event().fields().get("bk_inst_name");
        String object = ctx.event().fields().get("object");
        String ip = ctx.event().fields().get("ip");
        String alarm_name = ctx.event().fields().get("alarm_name");
        String alarm_content = ctx.event().fields().get("alarm_content");

        jsonObject.putOpt("bk_obj_id", bk_obj_id);
        jsonObject.putOpt("bk_biz_id", bk_biz_id);
        jsonObject.putOpt("bk_biz_name", bk_biz_name);
        jsonObject.putOpt("bk_inst_id", bk_inst_id);
        jsonObject.putOpt("bk_inst_name", bk_inst_name);
        jsonObject.putOpt("object", object);
        jsonObject.putOpt("ip", ip);
        jsonObject.putOpt("alarm_name", alarm_name);
        jsonObject.putOpt("alarm_content", alarm_content);
        jsonObject.putOpt("alarm_id", UUID.randomUUID());

        if (object == null) {
            jsonObject.putOpt("object", bk_inst_name);
        }

        JSONObject condition = JSONUtil.createObj();
        AggregationEventProcessorConfig conf = (AggregationEventProcessorConfig) ctx.eventDefinition().get().config();
        condition.putOpt("query", conf.query());
        condition.putOpt("gl2_message_id", ctx.event().fields().get("gl2_message_id"));
        if (ctx.event().timerangeStart().isPresent()){
            condition.putOpt("timerangeStart", ctx.event().timerangeStart().get().toString("yyyy-MM-dd HH:mm:ss"));
        }
        if (ctx.event().timerangeEnd().isPresent()) {
            condition.putOpt("timerangeEnd", ctx.event().timerangeEnd().get().toString("yyyy-MM-dd HH:mm:ss"));
        }
        JSONObject meta_info = JSONUtil.createObj();
        meta_info.putOpt("condition", condition);
        meta_info.putOpt("show_fields", ctx.event().fields().get("show_fields"));
        meta_info.putOpt("title", ctx.eventDefinition().get().title());
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
