/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import Routes from 'routing/Routes';

const ExtractorTypes = Object.freeze({
  COPY_INPUT: 'copy_input',
  GROK: 'grok',
  JSON: 'json',
  REGEX: 'regex',
  REGEX_REPLACE: 'regex_replace',
  SPLIT_AND_INDEX: 'split_and_index',
  SUBSTRING: 'substring',
  LOOKUP_TABLE: 'lookup_table',
  XML: 'xml', // 新增 XML 类型
});

const ExtractorUtils = {
  ConverterTypes: Object.freeze({
    NUMERIC: 'numeric',
    DATE: 'date',
    HASH: 'hash',
    SPLIT_AND_COUNT: 'split_and_count',
    IP_ANONYMIZER: 'ip_anonymizer',
    SYSLOG_PRI_LEVEL: 'syslog_pri_level',
    SYSLOG_PRI_FACILITY: 'syslog_pri_facility',
    TOKENIZER: 'tokenizer',
    CSV: 'csv',
    LOWERCASE: 'lowercase',
    UPPERCASE: 'uppercase',
    FLEXDATE: 'flexdate',
    LOOKUP_TABLE: 'lookup_table',
  }),
  ExtractorTypes: ExtractorTypes,
  EXTRACTOR_TYPES: Object.keys(ExtractorTypes).map((type) => type.toLocaleLowerCase()),

  getNewExtractorRoutes(sourceNodeId, sourceInputId, fieldName, messageIndex, messageId) {
    const routes = {};

    this.EXTRACTOR_TYPES.forEach((extractorType) => {
      routes[extractorType] = Routes.new_extractor(sourceNodeId, sourceInputId, extractorType, fieldName, messageIndex, messageId);
    });

    return routes;
  },

  getReadableExtractorTypeName(extractorType) {
    switch (extractorType) {
      case ExtractorTypes.COPY_INPUT:
        return '复制输入';
      case ExtractorTypes.GROK:
        return 'Grok模式';
      case ExtractorTypes.JSON:
        return 'JSON';
      case ExtractorTypes.REGEX:
        return '正则表达式';
      case ExtractorTypes.REGEX_REPLACE:
        return '正则表达式替换';
      case ExtractorTypes.SPLIT_AND_INDEX:
        return '分割';
      case ExtractorTypes.SUBSTRING:
        return '子窜捕获';
      case ExtractorTypes.LOOKUP_TABLE:
        return '数据映射';
      default:
        return extractorType;
    }
  },

  getReadableConverterTypeName(converterType) {
    switch (converterType) {
      case this.ConverterTypes.NUMERIC:
        return '数值';
      case this.ConverterTypes.DATE:
        return '日期';
      case this.ConverterTypes.FLEXDATE:
        return '复杂日期';
      case this.ConverterTypes.HASH:
        return 'Hash';
      case this.ConverterTypes.LOWERCASE:
        return '小写';
      case this.ConverterTypes.UPPERCASE:
        return '大写';
      case this.ConverterTypes.TOKENIZER:
        return 'Key = Value键值对';
      case this.ConverterTypes.CSV:
        return 'CSV';
      case this.ConverterTypes.SPLIT_AND_COUNT:
        return '分割统计';
      case this.ConverterTypes.IP_ANONYMIZER:
        return 'IPv4地址隐藏';
      case this.ConverterTypes.SYSLOG_PRI_LEVEL:
        return 'Syslog等级';
      case this.ConverterTypes.SYSLOG_PRI_FACILITY:
        return 'Syslog级别';
      case this.ConverterTypes.LOOKUP_TABLE:
        return '数据映射';
      default:
        return converterType;
    }
  },

  getEffectiveConfiguration(defaultConfiguration, currentConfiguration) {
    const effectiveConfiguration = {};

    for (const key in defaultConfiguration) {
      if (defaultConfiguration.hasOwnProperty(key)) {
        effectiveConfiguration[key] = defaultConfiguration[key];
      }
    }

    for (const key in currentConfiguration) {
      if (currentConfiguration.hasOwnProperty(key)) {
        effectiveConfiguration[key] = currentConfiguration[key];
      }
    }

    return effectiveConfiguration;
  },
};

export default ExtractorUtils;
