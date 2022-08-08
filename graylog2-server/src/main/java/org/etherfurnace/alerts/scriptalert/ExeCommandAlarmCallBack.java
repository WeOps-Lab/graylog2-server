package org.etherfurnace.alerts.scriptalert;

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

import java.io.IOException;
import java.util.Map;

public class ExeCommandAlarmCallBack implements AlarmCallback {
    private Configuration configs;

    Logger logger = Logger.getLogger(ExeCommandAlarmCallBack.class);

    private final String BASH_COMMAND = "bashCommand";

    @Override
    public void call(Stream stream, CheckResult checkResult) throws AlarmCallbackException {
        try {
            String bashCommand = configs.getString(BASH_COMMAND);
            bashCommand = bashCommand.replace("$[Title]", stream.getTitle());
            bashCommand = bashCommand.replace("$[Description]", stream.getDescription());
            bashCommand = bashCommand.replace("$[Content]", checkResult.getResultDescription());
            logger.info("执行Bash回调:" + bashCommand);
            Runtime.getRuntime().exec(new String[]{"bash", "-c", bashCommand});
        } catch (IOException e) {
            logger.error("Bash回调执行失败", e);
        }
    }

    @Override
    public void checkConfiguration() throws ConfigurationException {
        String command = configs.getString(BASH_COMMAND);
        if (command.isEmpty()) {
            throw new ConfigurationException("Bash命令字段必填.");
        }
    }

    @Override
    public Map<String, Object> getAttributes() {
        return configs.getSource();
    }

    @Override
    public String getName() {
        return "脚本通知";
    }

    @Override
    public ConfigurationRequest getRequestedConfiguration() {
        final ConfigurationRequest configurationRequest = new ConfigurationRequest();
        configurationRequest.addField(new TextField(BASH_COMMAND,
                "Bash命令", "$[Title]消息流产生告警:\n描述:$[Description]\n告警内容:$[Content]",
                "",
                ConfigurationField.Optional.NOT_OPTIONAL));
        return configurationRequest;
    }

    @Override
    public void initialize(Configuration arg0) {
        configs = new Configuration(arg0.getSource());
    }

}
