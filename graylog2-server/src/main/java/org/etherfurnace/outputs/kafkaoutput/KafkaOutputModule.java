package org.etherfurnace.outputs.kafkaoutput;

import org.graylog2.plugin.PluginModule;

public class KafkaOutputModule extends PluginModule {
    @Override
    protected void configure() {
        addMessageOutput(KafkaJsonOutput.class, KafkaJsonOutput.Factory.class);
        addMessageOutput(KafkaOutPut.class, KafkaOutPut.Factory.class);
    }
}
