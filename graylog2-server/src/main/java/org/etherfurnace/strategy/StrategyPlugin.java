package org.etherfurnace.strategy;

import org.graylog2.plugin.Plugin;
import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.PluginModule;

import java.util.Arrays;
import java.util.Collection;

public class StrategyPlugin implements Plugin {
    @Override
    public PluginMetaData metadata() {
        return new StrategyPluginMetaData();
    }

    @Override
    public Collection<PluginModule> modules() {
        return Arrays.asList(new StrategyModule());
    }
}
