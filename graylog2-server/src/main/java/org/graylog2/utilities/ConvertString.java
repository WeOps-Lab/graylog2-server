package org.graylog2.utilities;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.apache.commons.lang.StringUtils;

import java.util.Map;

public class ConvertString {

    public static String convertToString(Object data) {
        if (data == null) {
            return null;
        } else if (data instanceof String) {
            return (String) data;
        } else if (data instanceof Object[]) {
            // 如果是数组类型，将数组转换为逗号分隔的字符串
            return StringUtils.join((Object[]) data, ",");
        } else if (data instanceof Map) {
            // 如果是对象类型，将对象转换为字符串
            return convertObjectToJsonObject(data).toString();
        } else {
            // 其他类型，直接调用 toString 方法进行转换
            return data.toString();
        }
    }

    private static JSONObject convertObjectToJsonObject(Object object) {
        JSONObject jsonObject = JSONUtil.createObj();

        if (object instanceof Map) {
            // 如果对象是 Map 类型，则递归处理其中的键值对
            Map<?, ?> map = (Map<?, ?>) object;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                String key = entry.getKey().toString();
                Object value = entry.getValue();
                if (value instanceof Map) {
                    // 如果值是 Map 类型，则递归调用 convertObjectToJsonObject 方法
                    JSONObject nestedJsonObject = convertObjectToJsonObject(value);
                    jsonObject.putOpt(key, nestedJsonObject);
                } else {
                    // 否则，直接将键值对添加到 JsonObject 中
                    jsonObject.putOpt(key, value.toString());
                }
            }
        }
        return jsonObject;
    }
}
