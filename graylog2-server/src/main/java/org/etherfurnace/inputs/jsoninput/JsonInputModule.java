package org.etherfurnace.inputs.jsoninput;

import org.graylog2.plugin.PluginModule;

public class JsonInputModule extends PluginModule {
    @Override
    protected void configure() {
        addMessageInput(JSONTCPInput.class, JSONTCPInput.Factory.class);
        addMessageInput(JSONUDPInput.class, JSONUDPInput.Factory.class);
        addCodec("json", JSONCodec.class);
    }
}
