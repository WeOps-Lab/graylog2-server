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
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import {LinkContainer} from 'components/common/router';
import {Row, Col, Button, ButtonToolbar, BootstrapModalConfirm} from 'components/bootstrap';
import Spinner from 'components/common/Spinner';
import history from 'util/History';
import Routes from 'routing/Routes';
import UserNotification from 'util/UserNotification';
import {DocumentTitle, PageHeader} from 'components/common';
import ContentPackDetails from 'components/content-packs/ContentPackDetails';
import ContentPackVersions from 'components/content-packs/ContentPackVersions';
import ContentPackInstallations from 'components/content-packs/ContentPackInstallations';
import ContentPackInstallEntityList from 'components/content-packs/ContentPackInstallEntityList';
import withParams from 'routing/withParams';
import {ContentPacksActions, ContentPacksStore} from 'stores/content-packs/ContentPacksStore';

import ShowContentPackStyle from './ShowContentPackPage.css';

const ShowContentPackPage = createReactClass({
  displayName: 'ShowContentPackPage',

  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(ContentPacksStore)],

  getInitialState() {
    return {
      selectedVersion: undefined,
      uninstallEntities: undefined,
      uninstallContentPackId: undefined,
      uninstallInstallId: undefined,
    };
  },

  componentDidMount() {
    ContentPacksActions.get(this.props.params.contentPackId).catch((error) => {
      if (error.status === 404) {
        UserNotification.error(
          `无法找到ID为${this.props.params.contentPackId}的扩展包，可能已经被删除。`
        );
      } else {
        UserNotification.error('服务器发生错误，请检查日志以获取更多信息。');
      }

      history.push(Routes.SYSTEM.CONTENTPACKS.LIST);
    });

    ContentPacksActions.installList(this.props.params.contentPackId);
  },

  _onVersionChanged(newVersion) {
    this.setState({selectedVersion: newVersion});
  },

  _deleteContentPackRev(contentPackId, revision) {
    /* eslint-disable-next-line no-alert */
    if (window.confirm('您将要删除这个版本的扩展包，是否确定？')) {
      ContentPacksActions.deleteRev(contentPackId, revision).then(() => {
        UserNotification.success('扩展包删除成功。', '成功');

        ContentPacksActions.get(contentPackId).catch((error) => {
          if (error.status !== 404) {
            UserNotification.error('服务器发生错误，请检查日志以获取更多信息。');
          }

          history.push(Routes.SYSTEM.CONTENTPACKS.LIST);
        });
      }, (error) => {
        let errMessage = error.message;

        if (error.responseMessage) {
          errMessage = error.responseMessage;
        }

        UserNotification.error(`扩展包删除失败：${errMessage}`, '错误');
      });
    }
  },

  _onUninstallContentPackRev(contentPackId, installId) {
    ContentPacksActions.uninstallDetails(contentPackId, installId).then((result) => {
      this.setState({uninstallEntities: result.entities});
    });

    this.setState({
      uninstallContentPackId: contentPackId,
      uninstallInstallId: installId,
    });

    this.modal.open();
  },

  _clearUninstall() {
    this.setState({
      uninstallContentPackId: undefined,
      uninstallInstallId: undefined,
      uninstallEntities: undefined,
    });

    this.modal.close();
  },

  _uninstallContentPackRev() {
    const contentPackId = this.state.uninstallContentPackId;

    ContentPacksActions.uninstall(this.state.uninstallContentPackId, this.state.uninstallInstallId).then(() => {
      UserNotification.success('扩展包卸载成功.', '成功');
      ContentPacksActions.installList(contentPackId);
      this._clearUninstall();
    }, () => {
      UserNotification.error('扩展包卸载失败, 请检查日志以获取更多信息。', '错误');
    });
  },

  _installContentPack(contentPackId, contentPackRev, parameters) {
    ContentPacksActions.install(contentPackId, contentPackRev, parameters).then(() => {
      UserNotification.success('扩展包安装成功。', '成功');
      ContentPacksActions.installList(contentPackId);
    }, (error) => {
      UserNotification.error(`扩展包安装失败: ${error}。
         无法安装ID为${contentPackId}的扩展包。`);
    });
  },

  render() {
    if (!this.state.contentPackRevisions) {
      return (<Spinner/>);
    }

    const {contentPackRevisions, selectedVersion, constraints} = this.state;

    return (
      <DocumentTitle title="扩展包">
        <span>
          <PageHeader title="扩展包">
            <span>
              扩展包可以加快特定数据源的设置过程。一个扩展包可以包括接收器、提取器、消息流、仪表盘等资源。
            </span>

            <span>
              在<a href="" target="_blank" rel="noopener noreferrer">DataInsight市场</a>查找更多扩展包。
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.LIST}>
                <Button bsStyle="info">扩展包列表</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <Row>
            <Col md={4} className="content">
              <div id="content-pack-versions">
                <Row className={ShowContentPackStyle.leftRow}>
                  <Col>
                    <h2>版本</h2>
                    <ContentPackVersions contentPackRevisions={contentPackRevisions}
                                         onInstall={this._installContentPack}
                                         onChange={this._onVersionChanged}
                                         onDeletePack={this._deleteContentPackRev}/>
                  </Col>
                </Row>
                <Row className={ShowContentPackStyle.leftRow}>
                  <Col>
                    <h2>已安装</h2>
                    <ContentPackInstallations installations={this.state.installations}
                                              onUninstall={this._onUninstallContentPackRev}/>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={8} className="content">
              <ContentPackDetails contentPack={contentPackRevisions.contentPack(selectedVersion)}
                                  constraints={constraints[selectedVersion]}
                                  showConstraints
                                  verbose/>
            </Col>
          </Row>
        </span>
        <BootstrapModalConfirm ref={(c) => {
          this.modal = c;
        }}
                               title="确定删除此扩展包?"
                               onConfirm={this._uninstallContentPackRev}
                               onCancel={this._clearUninstall}>
          <ContentPackInstallEntityList uninstall entities={this.state.uninstallEntities}/>
        </BootstrapModalConfirm>
      </DocumentTitle>
    );
  },
});

export default withParams(ShowContentPackPage);
