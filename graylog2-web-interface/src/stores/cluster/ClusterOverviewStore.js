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
import Reflux from 'reflux';

import * as URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import { singletonStore } from 'logic/singleton';
import { NodesStore } from 'stores/nodes/NodesStore';
import { SystemLoadBalancerStore } from 'stores/load-balancer/SystemLoadBalancerStore';
import { SystemProcessingStore } from 'stores/system-processing/SystemProcessingStore';

// eslint-disable-next-line import/prefer-default-export
export const ClusterOverviewStore = singletonStore(
  'core.ClusterOverview',
  () => Reflux.createStore({
    sourceUrl: '/cluster',
    clusterOverview: undefined,

    init() {
      this.cluster();
      this.listenTo(SystemProcessingStore, this.cluster);
      this.listenTo(SystemLoadBalancerStore, this.cluster);
      this.listenTo(NodesStore, this.cluster);
    },

    getInitialState() {
      return { clusterOverview: this.clusterOverview };
    },

    cluster() {
      const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl));

      promise.then(
        (response) => {
          this.clusterOverview = response;
          this.trigger({ clusterOverview: this.clusterOverview });
        },
        (error) => UserNotification.error(`加载集群概览失败: ${error}`, '加载集群概览失败'),
      );

      return promise;
    },

    threadDump(nodeId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${nodeId}/threaddump`))
        .then(
          (response) => {
            return response.threaddump;
          },
          (error) => UserNotification.error(`获取节点 '${nodeId}' 的线程转储失败: ${error}`, '无法获取线程转储'),
        );

      return promise;
    },

    processbufferDump(nodeId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${nodeId}/processbufferdump`))
        .then(
          (response) => {
            return response.processbuffer_dump;
          },
          (error) => UserNotification.error(`获取节点'${nodeId}'进程转储失败: ${error}`, '无法获取节点的进程转储'),
        );

      return promise;
    },

    jvm(nodeId) {
      const promise = fetch('GET', URLUtils.qualifyUrl(`${this.sourceUrl}/${nodeId}/jvm`));

      promise.catch((error) => UserNotification.error(`获取节点'${nodeId}'JVM信息失败: ${error}`, '无法获得节点JVM信息'));

      return promise;
    },
  }),
);
