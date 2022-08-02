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
import * as React from 'react';
import {useEffect, useState} from 'react';

import {Col, Row} from 'components/bootstrap';
import {DocumentTitle, PageHeader, Spinner} from 'components/common';
import {useStore} from 'stores/connect';
import {isPermitted} from 'util/PermissionsMixin';
import SearchesConfig from 'components/configurations/SearchesConfig';
import MessageProcessorsConfig from 'components/configurations/MessageProcessorsConfig';
import SidecarConfig from 'components/configurations/SidecarConfig';
import EventsConfig from 'components/configurations/EventsConfig';
import UrlWhiteListConfig from 'components/configurations/UrlWhiteListConfig';
import PermissionsConfig from 'components/configurations/PermissionsConfig';
import 'components/maps/configurations';
import type {Store} from 'stores/StoreTypes';
import usePluginEntities from 'views/logic/usePluginEntities';
import ConfigletRow from 'pages/configurations/ConfigletRow';
import {ConfigurationsActions, ConfigurationsStore} from 'stores/configurations/ConfigurationsStore';
import {CurrentUserStore} from 'stores/users/CurrentUserStore';

import ConfigletContainer from './configurations/ConfigletContainer';
import PluginConfigRows from './configurations/PluginConfigRows';

import DecoratorsConfig from '../components/configurations/DecoratorsConfig';

const SEARCHES_CLUSTER_CONFIG = 'org.graylog2.indexer.searches.SearchesClusterConfig';
const MESSAGE_PROCESSORS_CONFIG = 'org.graylog2.messageprocessors.MessageProcessorsConfig';
const SIDECAR_CONFIG = 'org.graylog.plugins.sidecar.system.SidecarConfiguration';
const EVENTS_CONFIG = 'org.graylog.events.configuration.EventsConfiguration';
const URL_WHITELIST_CONFIG = 'org.graylog2.system.urlwhitelist.UrlWhitelist';
const PERMISSIONS_CONFIG = 'org.graylog2.users.UserAndTeamsConfig';

const _getConfig = (configType, configuration) => configuration?.[configType] ?? null;

const _onUpdate = (configType: string) => {
  return (config) => {
    switch (configType) {
      case MESSAGE_PROCESSORS_CONFIG:
        return ConfigurationsActions.updateMessageProcessorsConfig(configType, config);
      case URL_WHITELIST_CONFIG:
        return ConfigurationsActions.updateWhitelist(configType, config);
      default:
        return ConfigurationsActions.update(configType, config);
    }
  };
};

const ConfigurationsPage = () => {
  const [loaded, setLoaded] = useState(false);
  const pluginSystemConfigs = usePluginEntities('systemConfigurations');
  const configuration = useStore(ConfigurationsStore as Store<Record<string, any>>, (state) => state?.configuration);
  const permissions = useStore(CurrentUserStore as Store<{ currentUser: { permissions: Array<string> } }>, (state) => state?.currentUser?.permissions);

  useEffect(() => {
    const promises = [
      ConfigurationsActions.list(SEARCHES_CLUSTER_CONFIG),
      ConfigurationsActions.listMessageProcessorsConfig(MESSAGE_PROCESSORS_CONFIG),
      ConfigurationsActions.list(SIDECAR_CONFIG),
      ConfigurationsActions.list(EVENTS_CONFIG),
      ConfigurationsActions.listPermissionsConfig(PERMISSIONS_CONFIG),
    ];

    if (isPermitted(permissions, ['urlwhitelist:read'])) {
      promises.push(ConfigurationsActions.listWhiteListConfig(URL_WHITELIST_CONFIG));
    }

    const pluginPromises = pluginSystemConfigs
      .map((systemConfig) => ConfigurationsActions.list(systemConfig.configType));

    Promise.allSettled([...promises, ...pluginPromises]).then(() => setLoaded(true));
  }, [permissions, pluginSystemConfigs]);

  let Output = (
    <Col md={12}>
      <Spinner text="加载配置面板中..."/>
    </Col>
  );

  if (loaded) {
    const searchesConfig = _getConfig(SEARCHES_CLUSTER_CONFIG, configuration);
    const messageProcessorsConfig = _getConfig(MESSAGE_PROCESSORS_CONFIG, configuration);
    const sidecarConfig = _getConfig(SIDECAR_CONFIG, configuration);
    const eventsConfig = _getConfig(EVENTS_CONFIG, configuration);
    const urlWhiteListConfig = _getConfig(URL_WHITELIST_CONFIG, configuration);
    const permissionsConfig = _getConfig(PERMISSIONS_CONFIG, configuration);

    Output = (
      <>
        {searchesConfig && (
          <ConfigletContainer title="搜索配置">
            <SearchesConfig config={searchesConfig}
                            updateConfig={_onUpdate(SEARCHES_CLUSTER_CONFIG)}/>
          </ConfigletContainer>
        )}
        {messageProcessorsConfig && (
          <ConfigletContainer title="消息处理器配置">
            <MessageProcessorsConfig config={messageProcessorsConfig}
                                     updateConfig={_onUpdate(MESSAGE_PROCESSORS_CONFIG)}/>
          </ConfigletContainer>
        )}
        {sidecarConfig && (
          <ConfigletContainer title="客户端管理配置">
            <SidecarConfig config={sidecarConfig}
                           updateConfig={_onUpdate(SIDECAR_CONFIG)}/>
          </ConfigletContainer>
        )}
        {eventsConfig && (
          <ConfigletContainer title="事件配置">
            <EventsConfig config={eventsConfig}
                          updateConfig={_onUpdate(EVENTS_CONFIG)}/>
          </ConfigletContainer>
        )}
        {isPermitted(permissions, ['urlwhitelist:read']) && urlWhiteListConfig && (
          <ConfigletContainer title="URL白名单配置">
            <UrlWhiteListConfig config={urlWhiteListConfig}
                                updateConfig={_onUpdate(URL_WHITELIST_CONFIG)}/>
          </ConfigletContainer>
        )}
        <ConfigletContainer title="装饰器配置">
          <DecoratorsConfig/>
        </ConfigletContainer>
        {permissionsConfig && (
          <ConfigletContainer title="权限配置">
            <PermissionsConfig config={permissionsConfig}
                               updateConfig={_onUpdate(PERMISSIONS_CONFIG)}/>
          </ConfigletContainer>
        )}
      </>
    );
  }

  return (
    <DocumentTitle title="配置">
        <span>
          <PageHeader title="配置">
            <span>
              您可以在此页面对系统进行设置
            </span>
          </PageHeader>

        <ConfigletRow className="content">
          {Output}
        </ConfigletRow>

          {pluginSystemConfigs.length > 0 && (
            <Row className="content">
              <Col md={12}>
                <h2>插件</h2>
                <p className="description">配置已安装的插件.</p>
                <hr className="separator"/>
                <div className="top-margin">
                  <PluginConfigRows configuration={configuration} systemConfigs={pluginSystemConfigs}/>
                </div>
              </Col>
            </Row>
          )}
      </span>
    </DocumentTitle>
  );
};

export default ConfigurationsPage;
