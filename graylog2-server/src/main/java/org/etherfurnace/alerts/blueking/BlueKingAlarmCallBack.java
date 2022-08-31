package org.etherfurnace.alerts.blueking;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.apache.log4j.Logger;
import org.graylog2.plugin.alarms.AlertCondition.CheckResult;
import org.graylog2.plugin.alarms.callbacks.AlarmCallback;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackException;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationException;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.TextField;
import org.graylog2.plugin.streams.Stream;
import org.joda.time.DateTime;
import org.joda.time.LocalDateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.HashMap;
import java.util.Map;

public class BlueKingAlarmCallBack implements AlarmCallback {
    private Configuration configs;

    Logger logger = Logger.getLogger(BlueKingAlarmCallBack.class);

    private final String BK_URL = "BK_URL";
    private final String BK_SECRET = "BK_SECRET";
    private final String BK_OBJECT_ID = "BK_OBJECT_ID";
    DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void call(Stream stream, CheckResult checkResult) throws AlarmCallbackException {
        try {
            String blueKingUrl = configs.getString(BK_URL);
            String blueKingSecret = configs.getString(BK_SECRET);
            String bk_object_id = configs.getString(BK_OBJECT_ID);

            JSONObject jsonObject = JSONUtil.createObj();

            if (checkResult.getMatchingMessages().size() == 0) {
                jsonObject.putOpt("ip", "Not Found");
            } else {
                jsonObject.putOpt("ip", String.valueOf(checkResult.getMatchingMessages().get(0).getFields().getOrDefault(
                        bk_object_id, "Not Found")));
            }

            jsonObject.putOpt("source_time", dateTimeFormatter.print(LocalDateTime.now()));
            jsonObject.putOpt("alarm_type", "api_default");
            jsonObject.putOpt("level", "remain");
            jsonObject.putOpt("alarm_name", stream.getTitle());
            jsonObject.putOpt("alarm_content", stream.getDescription());
            jsonObject.putOpt("meta_info", "DataInsight");
            jsonObject.putOpt("action", "firing");
            HttpResponse response = HttpRequest.post(blueKingUrl)
                    .header("X-Secret", blueKingSecret)
                    .body(jsonObject.toString())
                    .execute();
            logger.info(response.body());
        } catch (Exception e) {
            logger.error("回调执行失败", e);
        }
    }

    @Override
    public void checkConfiguration() throws ConfigurationException {
        String blueKingUrl = configs.getString(BK_URL);
        if (blueKingUrl.isEmpty()) {
            throw new ConfigurationException("告警中心地址必填.");
        }
        String blueKingSecret = configs.getString(BK_SECRET);
        if (blueKingSecret.isEmpty()) {
            throw new ConfigurationException("告警中心秘钥必填.");
        }
        String bk_object_id = configs.getString(BK_OBJECT_ID);
        if (bk_object_id.isEmpty()) {
            throw new ConfigurationException("告警对象ID必填.");
        }
    }

    @Override
    public Map<String, Object> getAttributes() {
        return configs.getSource();
    }

    @Override
    public String getName() {
        return "蓝鲸告警中心通知";
    }

    @Override
    public ConfigurationRequest getRequestedConfiguration() {
        final ConfigurationRequest configurationRequest = new ConfigurationRequest();
        configurationRequest.addField(new TextField(BK_URL,
                "告警中心地址", "",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));
        configurationRequest.addField(new TextField(BK_SECRET,
                "告警中心秘钥", "",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));
        configurationRequest.addField(new TextField(BK_OBJECT_ID,
                "告警对象ID字段名", "bk_object_id",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));
        return configurationRequest;
    }

    @Override
    public void initialize(Configuration arg0) {
        configs = new Configuration(arg0.getSource());
    }

}
