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
import React, { useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';

import { IfPermitted, Select } from 'components/common';
import { Button, Col, Input, Modal, Row } from 'components/bootstrap';
import FormikInput from 'components/common/FormikInput';
import { DocumentationLink } from 'components/support';

export type GeoVendorType = 'MAXMIND' | 'IPINFO'

export type GeoIpConfigType = {
  enabled: boolean;
  enforce_graylog_schema: boolean;
  db_vendor_type: GeoVendorType;
  city_db_path: string;
  asn_db_path: string;
}

export type OptionType = {
  value: string;
  label: string;
}

type Props = {
  config: GeoIpConfigType,
  updateConfig: (config: GeoIpConfigType) => Promise<GeoIpConfigType>,
};

const defaultConfig: GeoIpConfigType = {
  enabled: false,
  enforce_graylog_schema: true,
  db_vendor_type: 'MAXMIND',
  city_db_path: '/etc/datainsight/server/GeoLite2-City.mmdb',
  asn_db_path: '/etc/datainsight/server/GeoLite2-ASN.mmdb',
};

const GeoIpResolverConfig = ({ config = defaultConfig, updateConfig }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [curConfig, setCurConfig] = useState(() => {
    return { ...defaultConfig };
  });

  useEffect(() => {
    setCurConfig({ ...config });
  }, [config]);

  const resetConfig = () => {
    setCurConfig(config);
    setShowModal(false);
  };

  const handleSubmit = (values: GeoIpConfigType) => {
    return updateConfig(values)
      .then((value: GeoIpConfigType) => {
        if ('enabled' in value) {
          setShowModal(false);
        }
      });
  };

  const availableVendorTypes = (): OptionType[] => {
    return [
      { value: 'MAXMIND', label: 'MaxMind 数据库' },
      { value: 'IPINFO', label: 'IPInfo 地理数据库' },
    ];
  };

  const activeVendorType = (type: GeoVendorType) => {
    return availableVendorTypes().filter((t) => t.value === type)[0].label;
  };

  return (
    <div>
      <h3>地理位置信息处理插件</h3>

      <p>
        该插件会解析所有包含<strong>IP地址</strong>的日志字段, 并且将他们的地理位置信息 (经纬度、国家、省份、城市) 存放在不同的字段中。
        在<DocumentationLink page="geolocation.html" text="DataInsight文档" />查看更多信息。
      </p>

      <dl className="deflist">
        <dt>启用:</dt>
        <dd>{config.enabled === true ? '是' : '否'}</dd>
        {config.enabled && (
          <>
            <dt>强制执行默认 DataInsight 架构:</dt>
            <dd>{config.enforce_graylog_schema === true ? '是' : '否'}</dd>
            <dt>数据库类型:</dt>
            <dd>{activeVendorType(config.db_vendor_type)}</dd>
            <dt>城市数据库路径:</dt>
            <dd>{config.city_db_path}</dd>
            <dt>ASN数据库路径:</dt>
            <dd>{config.asn_db_path}</dd>
          </>
        )}
      </dl>

      <IfPermitted permissions="clusterconfigentry:edit">
        <Button bsStyle="info"
                bsSize="xs"
                onClick={() => {
                  setShowModal(true);
                }}>
          Update
        </Button>
      </IfPermitted>
      <Modal show={showModal} onHide={resetConfig} aria-modal="true" aria-labelledby="dialog_label">
        <Formik onSubmit={handleSubmit} initialValues={curConfig}>
          {({ values, setFieldValue, isSubmitting }) => {
            return (
              <Form>
                <Modal.Header>
                  <Modal.Title id="dialog_label">更新地理位置处理器配置</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={6}>
                      <FormikInput id="enabled"
                                   type="checkbox"
                                   label="启用地理信息处理插件"
                                   name="enabled" />
                    </Col>
                    <Col sm={6}>
                      <FormikInput id="enforce_graylog_schema"
                                   type="checkbox"
                                   label="强制执行默认 DataInsight 架构"
                                   name="enforce_graylog_schema" />
                    </Col>
                  </Row>
                  <Field id="db_vendor_type_select"
                         name="db_vendor_type_field">
                    {() => (
                      <Input id="db_vendor_type_input"
                             label="选择地理数据库类型">
                        <Select id="db_vendor_type"
                                name="db_vendor_type"
                                clearable={false}
                                placeholder="选择地理数据库类型"
                                required
                                disabled={!values.enabled}
                                options={availableVendorTypes()}
                                matchProp="label"
                                value={values.db_vendor_type}
                                onChange={(option) => {
                                  setFieldValue('db_vendor_type', option);
                                }} />
                      </Input>
                    )}
                  </Field>
                  <FormikInput id="city_db_path"
                               type="text"
                               disabled={!values.enabled}
                               label="城市数据库路径"
                               name="city_db_path"
                               required />
                  <FormikInput id="asn_db_path"
                               type="text"
                               disabled={!values.enabled}
                               label="ASN数据库路径"
                               name="asn_db_path" />

                </Modal.Body>
                <Modal.Footer>
                  <Button type="button"
                          bsStyle="link"
                          onClick={resetConfig}
                          disabled={isSubmitting}
                          aria-disabled={isSubmitting}>
                    关闭
                  </Button>
                  <Button type="submit"
                          bsStyle="success"
                          disabled={isSubmitting}
                          aria-disabled={isSubmitting}>
                    {isSubmitting ? '保存中...' : '保存'}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </div>
  );
};

export default GeoIpResolverConfig;
