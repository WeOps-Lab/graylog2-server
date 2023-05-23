package org.etherfurnace.alerts.blueking;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSON;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;
import org.apache.log4j.Logger;
import org.graylog2.plugin.alarms.AlertCondition.CheckResult;
import org.graylog2.plugin.alarms.callbacks.AlarmCallback;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackException;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationException;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.TextField;
import org.graylog2.plugin.configuration.fields.NumberField;

import org.graylog2.plugin.streams.Stream;
import org.joda.time.LocalDateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.HashMap;
import java.util.Map;


public class BlueKingAlarmCallBack implements AlarmCallback {

    public static Object getPropertyValue(Map<String, Object> mapData, String propertyExpr) throws NullPointerException {
        if (!propertyExpr.contains("${")) {
            return propertyExpr;
        }
        if (propertyExpr == "${all}") {
            return mapData;
        }
        String finalKey = propertyExpr.replace("${", "").replace("}", "");
        String[] keys = finalKey.split("\\.");
        Object value = mapData.get(keys[0]);
        for (int i = 1; i < keys.length; i++) {
            if (value instanceof Map) {
                value = ((Map<?, ?>) value).get(keys[i]);
            } else {
                value = null;
                break;
            }
        }
        return value;
    }

//    获取告警日志的优先级，映射为告警中心的告警等级，但是graylog2.X版本暂不支持，该方法暂时保留，
    public static String getAlarmLevel (Integer priority) {
        Map<Integer, String> levelMap = new HashMap<>();
        levelMap.put(1, "remain");
        levelMap.put(2, "warning");
        levelMap.put(3, "fatal");
        String level = levelMap.getOrDefault(priority, "remain");
        return level;
    }

    private Configuration configs;

    Logger logger = Logger.getLogger(BlueKingAlarmCallBack.class);

    private final String BK_URL = "BK_URL";
    private final String BK_SECRET = "BK_SECRET";
    private final String BK_OBJECT_ID = "BK_OBJECT_ID";
    private final String BK_INST_ID = "BK_INST_ID";
    private final String BK_BIZ_ID = "BK_BIZ_ID";
    private final String BK_BIZ_NAME = "BK_BIZ_NAME";
    private final String ALARM_NAME = "ALARM_NAME";
    private final String IP = "IP";
    private final String ALARM_CONTENT = "ALARM_CONTENT";
    private final String META_INFO = "META_INFO";
    private final String LEVEL = "LEVEL";
    DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void call(Stream stream, CheckResult checkResult) throws AlarmCallbackException {
        try {
            String blueKingUrl = configs.getString(BK_URL);
            String blueKingSecret = configs.getString(BK_SECRET);
            String bk_object_id = configs.getString(BK_OBJECT_ID);
            Integer bk_inst_id = configs.getInt(BK_INST_ID);
            Integer bk_biz_id = configs.getInt(BK_BIZ_ID);
            String bk_biz_name = configs.getString(BK_BIZ_NAME);
            String alarm_name = configs.getString(ALARM_NAME);
            String ip = configs.getString(IP);
            String alarm_content = configs.getString(ALARM_CONTENT);
            String meta_info = configs.getString(META_INFO);
            String level = configs.getString(LEVEL);

            JSONObject jsonObject = JSONUtil.createObj();

            if (bk_object_id != null && !bk_object_id.isEmpty()){
                jsonObject.putOpt("bk_obj_id", bk_object_id);
                if (bk_inst_id != 0){
                    jsonObject.putOpt("bk_inst_id", bk_inst_id);
                }
                if (bk_inst_id != 0){
                    jsonObject.putOpt("bk_biz_id", bk_biz_id);
                }
                if (bk_biz_name != null && !bk_biz_name.isEmpty()){
                    jsonObject.putOpt("bk_biz_name", bk_biz_name);
                }
            }

            jsonObject.putOpt("source_time", dateTimeFormatter.print(LocalDateTime.now()));
            jsonObject.putOpt("action", "firing");
            jsonObject.putOpt("alarm_type", "api_default");

            JSONObject show_data = JSONUtil.createObj();

            JSON json = JSONUtil.parse(meta_info);
            JSONObject meta = (JSONObject) json;

            // 获取键对应的值
            Object showFieldsValue = meta.get("show_fields");
            if (showFieldsValue instanceof JSONArray) {
                JSONArray showFieldsArray = (JSONArray) showFieldsValue;
                for (Object field : showFieldsArray) {
                    String fieldValue = (String) field;
                    show_data.putOpt(fieldValue, checkResult.getMatchingMessages().get(0).getFields().get(fieldValue));
                }
            }
            meta.putOpt("show_data", show_data);
            jsonObject.putOpt("meta_info", meta);

            if (checkResult.getMatchingMessages().size() == 0) {
                jsonObject.putOpt("ip", ip);
                jsonObject.putOpt("level", level);
                jsonObject.putOpt("alarm_name", alarm_name);
                jsonObject.putOpt("alarm_content", alarm_content);
            } else {
                jsonObject.putOpt("ip", getPropertyValue(checkResult.getMatchingMessages().get(0).getFields(), ip));
                jsonObject.putOpt("level", getPropertyValue(checkResult.getMatchingMessages().get(0).getFields(), level));
                jsonObject.putOpt("alarm_name", getPropertyValue(checkResult.getMatchingMessages().get(0).getFields(), alarm_name));
                jsonObject.putOpt("alarm_content", getPropertyValue(checkResult.getMatchingMessages().get(0).getFields(), alarm_content));
            }

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
        String ip = configs.getString(IP);
        if (ip.isEmpty()) {
            throw new ConfigurationException("告警对象必填.");
        }
        String level = configs.getString(LEVEL);
        if (level.isEmpty()) {
            throw new ConfigurationException("告警等级必填.");
        }
        String alarm_name = configs.getString(ALARM_NAME);
        if (alarm_name.isEmpty()) {
            throw new ConfigurationException("告警名称必填.");
        }
        String alarm_content = configs.getString(ALARM_CONTENT);
        if (alarm_content.isEmpty()) {
            throw new ConfigurationException("告警详情必填.");
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
                "模型ID", "bk_object_id",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new NumberField(BK_INST_ID,
                "实例ID", 0,
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new NumberField(BK_BIZ_ID,
                "业务ID", 0,
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(BK_BIZ_NAME,
                "业务名称", "bk_biz_name",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(IP,
                "告警对象", "ip",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(LEVEL,
                "告警等级", "level",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(ALARM_NAME,
                "告警名称", "alarm_name",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(ALARM_CONTENT,
                "告警详情", "alarm_content",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        configurationRequest.addField(new TextField(META_INFO,
                "告警其余信息", "meta_info",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));

        return configurationRequest;
    }

    @Override
    public void initialize(Configuration arg0) {
        configs = new Configuration(arg0.getSource());
    }

}
