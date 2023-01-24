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
import React from 'react';

import {Link} from 'components/common/router';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';
import HideOnCloud from 'util/conditional/HideOnCloud';

class NotificationsFactory {
  static getForNotification(notification) {
    switch (notification.type) {
      case 'check_server_clocks':
        return {
          title: '检测服务端的系统时间.',
          description: (
            <span>
              DataInsight服务器节点检测到一种情况,即它在激活后立即被视为不活动.
              这通常表示系统时间的显著差异,例如通过NTP,或者第二个DataInsight服务器节点
              在具有不同系统时间的系统上处于活动状态.请确保DataInsight2系统的时钟同步.
            </span>
          ),
        };

      case 'deflector_exists_as_index':
        return {
          title: '导向器存在于所以但不是一个别名.',
          description: (
            <span>
              导向器本应是别名,但作为索引存在.基础设施的多次故障可能导致
              这个问题.您的消息仍被编入索引,但搜索和所有维护任务都将失败或产生不正确的结果结果.强烈建议你尽快采取行动.
            </span>
          ),
        };

      case 'email_transport_configuration_invalid':
        return {
          title: '邮件配置缺失或不合法!',
          description: (
            <span>
              电子邮件传输子系统的配置已显示为丢失或无效.
              请检查DataInsight服务器配置文件的相关部分.
              详细信息: {notification.details.exception}
            </span>
          ),
        };

      case 'email_transport_failed':
        return {
          title: '尝试发送电子邮件时出错!',
          description: (
            <span>
              尝试发送电子邮件时出错.
              详细信息: {notification.details.exception}
            </span>
          ),
        };

      case 'es_cluster_red':
        return {
          title: 'Elasticsearch 集群不健康 (RED)',
          description: (
            <span>
              Elasticsearch群集状态为红色,表示碎片未分配.
              这通常表示集群崩溃和损坏,需要进行调查.DataInsight将写入
              在本地磁盘日志中. 查看修复{' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_CLUSTER_STATUS_RED} text="文档."/>
            </span>
          ),
        };

      case 'es_open_files':
        return {
          title: 'Elasticsearch 节点文件打开数过小',
          description: (
            <span>
              Elasticsearch 节点文件打开数过小 (当前节点 <em>{notification.details.hostname}</em>限制:{' '}
              <em>{notification.details.max_file_descriptors}</em>  ;
              至少为 64000) 这会导致问题很难被诊断.查看 {' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_OPEN_FILE_LIMITS} text="文档"/>.
            </span>
          ),
        };

      case 'es_unavailable':
        return {
          title: 'Elasticsearch集群不可用',
          description: (
            <span>
              DataInsight无法成功连接到Elasticsearch集群.如果使用多播,请检查
              它在您的网络中工作,并且Elasticsearch是可访问的.还要检查群集名称设置
              是正确的. 查看 {' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_CLUSTER_UNAVAILABLE}
                                 text="文档."/>
            </span>
          ),
        };

      case 'gc_too_long':
        return {
          title: '节点GC时间过长',
          description: (
            <span>
              节点GC时间过长
              (节点: <em>{notification.node_id}</em>, GC时间: <em>{notification.details.gc_duration_ms} ms</em>,
              GC 阈值: <em>{notification.details.gc_threshold_ms} ms</em>)
            </span>
          ),
        };

      case 'generic':
        return {
          title: notification.details.title,
          description: notification.details.description,
        };

      case 'es_index_blocked':
        return {
          title: notification.details.title,
          description: (
            <span>
              {notification.details.description}<br/>
              {notification.details.blockDetails?.length > 0 && (
                <ul>
                  {notification.details.blockDetails.map((line) => (
                    <li>{line[0]}: {line[1]}</li>
                  ))}
                </ul>
              )}
            </span>
          ),
        };

      case 'index_ranges_recalculation':
        return {
          title: '索引范围需要重新计算',
          description: (
            <span>
              索引范围未同步.请重新计算
              {notification.details.index_sets ? (`以下索引集: ${notification.details.index_sets}`) : '所有索引集'}的索引范围
            </span>
          ),
        };

      case 'input_failed_to_start':
        return {
          title: '接收器启动失败',
          description: (
            <span>
              接收器 {notification.details.input_id} 在节点 {notification.node_id} 启动失败,原因:
              »{notification.details.reason}«.点击
              <HideOnCloud>
                <Link to={Routes.SYSTEM.INPUTS}>这里</Link> 解决问题.
              </HideOnCloud>
            </span>
          ),
        };

      case 'input_failure_shutdown':
        return {
          title: '未提交的消息从队列中移除',
          description: (
            <span>
              存在未提交的消息从队列中移除,建议提高节点<em>{notification.node_id}</em>的队列长度
            </span>
          ),
        };

      case 'journal_uncommitted_messages_deleted':
        return {
          title: '队列使用率过高',
          description: (
            <span>
              队列使用率过高,建议提高节点<em>{notification.node_id}</em>的队列长度
            </span>
          ),
        };

      case 'journal_utilization_too_high':
        return {
          title: '存在多个主检点',
          description: (
            <span>
              在DataInsight群集中有多个配置为主服务器的DataInsight服务器实例.集群处理
              如果已经有一个主节点,则自动将新节点作为从节点启动,但仍应修复此问题.
              检查每个节点的配置文件,确保只有一个实例的is_master设置为true.关闭此
              如果您认为您解决了问题,请通知.如果再次启动第二个主节点.它将弹出.
            </span>
          ),
        };

      case 'multi_leader':
        return {
          title: '存在没有运行任何接收器的节点.',
          description: (
            <span>
              存在没有运行任何接收器的节点.点击<Link to={Routes.SYSTEM.INPUTS}>这里</Link>添加接收器
            </span>
          ),
        };

      case 'no_input_running':
        return {
          title: '没有启动任何输入.',
          description: (
            <span>
              没有启动任何输入
            </span>
          ),
        };

      case 'no_leader':
        return {
          title: '正在运行的版本过旧.',
          description: (
            <span>
              正在运行的版本过旧.
            </span>
          ),
        };

      case 'outdated_version':
        return {
          title: '您运行的是老版本的 DataInsight',
          description: (
            <span>
              最新的稳定 DataInsight 版本是 <em>{notification.details.current_version}</em>。
            </span>
          ),
        };

      case 'output_disabled':
        return {
          title: '处理消息超时导致消息流被禁用.',
          description: (
            <span>
              消息流<em>{notification.details.stream_title} ({notification.details.stream_id})</em>
              处理消息超时{' '}
              {notification.details.fault_count} 次.自动禁用此消息流.
            </span>
          ),
        };

      case 'output_failing':
        return {
          title: '输出失败',
          description: (
            <span>
              输出"{notification.details.outputTitle}" (id: {notification.details.outputId})
              在流"{notification.details.streamTitle}" 中(id: {notification.details.streamId})
              无法将消息发送到配置的目标。
              <br/>
              输出的错误消息是：<em>{notification.details.errorMessage}</em>
            </span>
          ),
        };

      case 'stream_processing_disabled':
        return {
          title: '由于处理时间过长，已禁用流处理.',
          description: (
            <span>
              流 <em>{notification.details.stream_title} ({notification.details.stream_id})</em> 的处理时间过长{' '}
              {notification.details.fault_count} 次。为保障消息处理的稳定性，
              此流已被禁用。请更正直播规则并重新启用直播。
              检查 <DocumentationLink page={DocsHelper.PAGES.STREAM_PROCESSING_RUNTIME_LIMITS}
                                    text="文档"/>{' '}
              更多细节。
            </span>
          ),
        };

      case 'es_node_disk_watermark_low':
        return {
          title: 'Elasticsearch 节点磁盘使用率高于低水位线',
          description: (
            <span>
              集群中有 Elasticsearch 节点的磁盘空间不足，它们的磁盘使用率高于低水位线。{' '}
              由于这个原因，Elasticsearch 不会为受影响的节点分配新的分片。{' '}
              受影响的节点是：[{notification.details.nodes}]{' '}
              检查 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html"
                    target="_blank"
                    rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>{' '}
              更多细节。
            </span>
          ),
        };

      case 'es_node_disk_watermark_high':
        return {
          title: 'Elasticsearch 节点磁盘使用率高于高水位线',
          description: (
            <span>
              集群中有 Elasticsearch 节点几乎没有空闲磁盘，它们的磁盘使用率高于高水位线。{' '}
              出于这个原因，Elasticsearch 将尝试将分片从受影响的节点移开。{' '}
              受影响的节点是：[{notification.details.nodes}]{' '}
              检查 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html"
                    target="_blank"
                    rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>{' '}
              更多细节。
            </span>
          ),
        };

      case 'es_node_disk_watermark_flood_stage':
        return {
          title: 'Elasticsearch 节点磁盘使用量高于洪水阶段水印',
          description: (
            <span>
              集群中有 Elasticsearch 节点没有空闲磁盘，它们的磁盘使用率高于洪水阶段水位线。{' '}
              出于这个原因，Elasticsearch 对所有在任何 {' '} 中具有任何分片的索引强制执行只读索引块
              受影响的节点。受影响的节点是：[{notification.details.nodes}]{' '}
              检查 <a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html"
                    target="_blank"
                    rel="noreferrer">https://www.elastic.co/guide/en/elasticsearch/reference/master/disk-allocator.html</a>{' '}
              更多细节。
            </span>
          ),
        };

      case 'es_version_mismatch': {
        const {initial_version: initialVersion, current_version: currentVersion} = notification.details;

        return {
          title: 'Elasticsearch 版本不兼容',
          description: (
            <span>
             当前运行的 Elasticsearch 版本 ({currentVersion}) 的主要版本不同于
              Graylog 领导节点以 ({initialVersion}) 启动的那个。{' '}
              这很可能会在索引或搜索期间导致错误。 Graylog 需要在
              Elasticsearch 从一个主要版本升级到另一个。
              <br/>
              有关详细信息，请参阅我们关于 {' '} 的说明
              <DocumentationLink 页面={DocsHelper.PAGES.ROLLING_ES_UPGRADE}
                                 text="滚动 Elasticsearch 升级。"/>

            </span>
          ),
        };
      }

      case 'legacy_ldap_config_migration': {
        const {auth_service_id: authServiceId} = notification.details;
        const authServiceLink = <Link to={Routes.SYSTEM.AUTHENTICATION.BACKENDS.show(authServiceId)}>鉴权服务</Link>;

        return {
          title: '旧 LDAP/Active Directory 配置已迁移到身份验证服务',
          description: (
            <span>
              此系统的旧 LDAP/Active Directory 配置已升级到新的 {authServiceLink}。
              由于新的 {authServiceLink} 需要一些旧版中不存在的信息
              配置，{authServiceLink} <strong>需要人工审核</strong>！
              <br/>
              <br/>
              <strong>查看 {authServiceLink} 后，必须启用它以允许 LDAP 或 Active Directory 用户
                再次登录！
              </strong>
              <br/>
              <br/>
              请检查 <DocumentationLink page={DocsHelper.PAGES.UPGRADE_GUIDE} text="升级指南"/>
              更多细节。
            </span>
          ),
        };
      }

      case 'archiving_summary':
        return {
          title: '以下索引尚未归档',
          description: (
            <span>
              归档某些索引时出错。 DataInsight 将继续尝试归档这些
              索引并将保留所有索引，直到它们成功存档。
              <br/>
              请检查以下错误消息，因为可能需要您的帮助来解决问题：
              <br/>
              <ul>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {notification.details.archiveErrors.map((error, idx) => <li key={idx}>{error}</li>)}
              </ul>
            </span>
          ),
        };

      default:
        return {title: `未知 (${notification.type})`, description: '未知'};
    }
  }
}

export default NotificationsFactory;
