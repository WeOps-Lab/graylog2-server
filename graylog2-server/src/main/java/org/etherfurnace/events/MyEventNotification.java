package org.etherfurnace.events;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.google.common.collect.ImmutableList;
import okhttp3.HttpUrl;
import org.graylog.events.notifications.*;
import org.graylog2.plugin.MessageSummary;
import org.graylog2.system.urlwhitelist.UrlWhitelistNotificationService;
import org.graylog2.system.urlwhitelist.UrlWhitelistService;
import org.joda.time.LocalDateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.HashMap;
import java.util.Map;

public class MyEventNotification implements EventNotification {

    public interface Factory extends EventNotification.Factory {
        @Override
        MyEventNotification create();
    }

    private static final Logger LOG = LoggerFactory.getLogger(MyEventNotification.class);

    private final EventNotificationService notificationCallbackService;

    private final UrlWhitelistService whitelistService;
    private final UrlWhitelistNotificationService urlWhitelistNotificationService;
    DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");


    @Inject
    public MyEventNotification(EventNotificationService notificationCallbackService,
                                 UrlWhitelistService whitelistService,
                                 UrlWhitelistNotificationService urlWhitelistNotificationService) {
        this.notificationCallbackService = notificationCallbackService;

        this.whitelistService = whitelistService;
        this.urlWhitelistNotificationService = urlWhitelistNotificationService;
    }
    public static String getAlarmLevel (Integer priority) {
        Map<Integer, String> levelMap = new HashMap<>();
        levelMap.put(1, "remain");
        levelMap.put(2, "warning");
        levelMap.put(3, "fatal");
        String level = levelMap.getOrDefault(priority, "remain");
        return level;
    }

    @Override
    public void execute(EventNotificationContext ctx) throws TemporaryEventNotificationException, PermanentEventNotificationException {
        final MyEventNotificationConfig config = (MyEventNotificationConfig) ctx.notificationConfig();
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
        jsonObject.putOpt("source_time", dateTimeFormatter.print(LocalDateTime.now()));
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

        if (object==null) {
            jsonObject.putOpt("object", bk_inst_name);
        }

        JSONObject meta_info = JSONUtil.createObj();
        String show_fields = ctx.event().fields().get("show_fields");

        if (show_fields != null) {
            JSONObject show_data = JSONUtil.createObj();
            String[] show_field_arr = show_fields.split(",");
            for (Object field : show_field_arr) {
                String fieldValue = (String) field;
                show_data.putOpt(fieldValue, ctx.event().fields().get(fieldValue));
            }
            Object[] array = new Object[5];
            array[0] = show_data;

            meta_info.putOpt("show_data", array);
            meta_info.putOpt("show_fields", show_field_arr);
        }

        jsonObject.putOpt("meta_info", meta_info.toString());

        HttpResponse response = HttpRequest.post(String.valueOf(httpUrl))
                .header("X-Secret", httpSecret)
                .body(jsonObject.toString())
                .execute();
        LOG.info(response.body());

    }

    private void publishSystemNotificationForWhitelistFailure(String url, String eventNotificationTitle) {
        final String description = "The alert notification \"" + eventNotificationTitle +
                "\" is trying to access a URL which is not whitelisted. Please check your configuration. [url: \"" +
                url + "\"]";
        urlWhitelistNotificationService.publishWhitelistFailure(description);
    }
}
