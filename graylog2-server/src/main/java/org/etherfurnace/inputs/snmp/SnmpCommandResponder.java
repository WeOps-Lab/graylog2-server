package org.etherfurnace.inputs.snmp;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Iterables;
import org.etherfurnace.inputs.snmp.oid.SnmpMibsLoader;
import org.etherfurnace.inputs.snmp.oid.SnmpMibsLoaderRegistry;
import org.etherfurnace.inputs.snmp.oid.SnmpOIDDecoder;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.journal.RawMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.snmp4j.CommandResponder;
import org.snmp4j.CommandResponderEvent;
import org.snmp4j.PDU;
import org.snmp4j.smi.*;
import org.snmp4j.util.OIDTextFormat;

import java.util.LinkedHashMap;
import java.util.Map;

public class SnmpCommandResponder implements CommandResponder {
    private static final Logger LOG = LoggerFactory.getLogger(SnmpCommandResponder.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final String KEY_PREFIX = "snmp_";

    private final RawMessage rawMessage;
    private final OIDTextFormat oidTextFormat;
    private Message message = null;

    public SnmpCommandResponder(RawMessage rawMessage, SnmpMibsLoaderRegistry mibsLoaderRegistry, String mibsPath) {
        this.rawMessage = rawMessage;

        final String inputId = Iterables.getLast(rawMessage.getSourceNodes()).inputId;
        final SnmpMibsLoader mibsLoader = mibsLoaderRegistry.get(inputId);

        if (mibsLoader == null) {
            LOG.info("Initialize new SnmpMibsLoader (custom path: \"{}\")", mibsPath);
            mibsLoaderRegistry.put(inputId, new SnmpMibsLoader(mibsPath));
            this.oidTextFormat = new SnmpOIDDecoder(mibsLoaderRegistry.get(inputId));
        } else {
            this.oidTextFormat = new SnmpOIDDecoder(mibsLoader);
        }
    }

    public Message getMessage() {
        return message;
    }

    private String withKeyPrefix(String key) {
        return KEY_PREFIX + key;
    }

    @Override
    public void processPdu(CommandResponderEvent event) {
        LOG.debug("Processing SNMP event: {}", event);

        final PDU pdu = event.getPDU();
        final Integer32 requestID = pdu.getRequestID();
        final Message message = new Message("SNMP trap requestID: " + requestID.toString(), null, rawMessage.getTimestamp());

        message.addField(withKeyPrefix("trap_type"), PDU.getTypeString(pdu.getType()));
        message.addField(withKeyPrefix("request_id"), requestID.toLong());

        // 用于存储所有变量的 JSON 格式汇总
        Map<String, String> allVariables = new LinkedHashMap<>();

        for (final VariableBinding binding : pdu.getVariableBindings()) {
            final OID oid = binding.getOid();
            final String oidString = oid.toDottedString();
            // 将点号和连字符替换为下划线，避免 ES 将其解析为嵌套对象，确保提取器能正常工作
            final String key = decodeOid(oid).replace(".", "_").replace("-", "_");
            final Variable variable = binding.getVariable();
            final String variableStr = variable.toString();

            // 添加到 JSON 汇总 Map
            allVariables.put(oidString, variableStr);

            // 添加字段值 - TimeTicks 特殊处理，保留数值兼容性
            if (variable instanceof TimeTicks) {
                message.addField(withKeyPrefix(key+ "_ms"), ((TimeTicks) variable).toMilliseconds());
                message.addField(withKeyPrefix(key), variableStr);
            } else {
                message.addField(withKeyPrefix(key), variableStr);
            }
        }

        // 添加所有变量的 JSON 格式汇总字段
        try {
            String allVariablesJson = OBJECT_MAPPER.writeValueAsString(allVariables);
            message.addField(withKeyPrefix("all"), allVariablesJson);
        } catch (JsonProcessingException e) {
            LOG.error("Failed to serialize SNMP variables to JSON", e);
            message.addField(withKeyPrefix("all"), allVariables.toString());
        }

        this.message = message;
    }

    private String decodeOid(OID oid) {
        final String decodedOid = oidTextFormat.formatForRoundTrip(oid.getValue());

        if (decodedOid != null) {
            return decodedOid;
        }

        return oid.toDottedString();
    }
}
