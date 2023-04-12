package org.etherfurnace.strategy;


import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.Version;

import java.net.URI;
import java.util.Collections;
import java.util.Set;

public class StrategyPluginMetaData implements PluginMetaData {
    @Override
    public String getUniqueId() {
        return "com.etherfurnace.plugins.strategy.StrategyPlugin";
    }

    @Override
    public String getName() {
        return "索引管理插件";
    }

    @Override
    public String getAuthor() {
        return "DataInsight.";
    }

    @Override
    public URI getURL() {
        return URI.create("");
    }

    @Override
    public Version getVersion() {
        return new Version(3, 0, 0);
    }

    @Override
    public String getDescription() {
        return "索引管理";
    }

    @Override
    public Version getRequiredVersion() {
        return new Version(3, 0, 0);
    }

    @Override
    public Set<ServerStatus.Capability> getRequiredCapabilities() {
        return Collections.emptySet();
    }
}
