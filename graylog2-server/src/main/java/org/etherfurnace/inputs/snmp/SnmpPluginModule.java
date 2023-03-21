package org.etherfurnace.inputs.snmp;

import com.google.inject.Scopes;
import org.etherfurnace.inputs.snmp.codec.SnmpCodec;
import org.etherfurnace.inputs.snmp.input.SnmpUDPInput;
import org.etherfurnace.inputs.snmp.oid.SnmpMibsLoaderRegistry;
import org.graylog2.plugin.PluginConfigBean;
import org.graylog2.plugin.PluginModule;

import java.util.Collections;
import java.util.Set;

/**
 * Extend the PluginModule abstract class here to add you plugin to the system.
 */
public class SnmpPluginModule extends PluginModule {
    /**
     * Returns all configuration beans required by this plugin.
     * <p>
     * Implementing this method is optional. The default method returns an empty {@link Set}.
     */
    @Override
    public Set<? extends PluginConfigBean> getConfigBeans() {
        return Collections.emptySet();
    }

    @Override
    protected void configure() {
        addMessageInput(SnmpUDPInput.class);
        addCodec("snmp", SnmpCodec.class);

        bind(SnmpMibsLoaderRegistry.class).in(Scopes.SINGLETON);
    }
}
