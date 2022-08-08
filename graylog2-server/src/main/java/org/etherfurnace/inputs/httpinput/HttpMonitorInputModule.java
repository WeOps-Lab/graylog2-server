package org.etherfurnace.inputs.httpinput;


import org.graylog2.plugin.PluginModule;

public class HttpMonitorInputModule extends PluginModule {
    @Override
    protected void configure() {
        installTransport(transportMapBinder(), "http-monitor-transport", HttpMonitorTransport.class);
        installInput(inputsMapBinder(), HttpMonitorInput.class, HttpMonitorInput.Factory.class);
    }
}
