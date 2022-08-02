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
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import styled, { css } from 'styled-components';

import { LinkContainer } from 'components/common/router';
import { Row, Col, ButtonToolbar, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import Spinner from 'components/common/Spinner';
import UserNotification from 'util/UserNotification';
import { DocumentTitle, PageHeader } from 'components/common';
import ContentPacksList from 'components/content-packs/ContentPacksList';
import ContentPackUploadControls from 'components/content-packs/ContentPackUploadControls';
import { ContentPacksActions, ContentPacksStore } from 'stores/content-packs/ContentPacksStore';

const ConfigurationBundles = styled.div(({ theme }) => css`
  font-size: ${theme.fonts.size.body};
  font-weight: normal;
  line-height: 20px;
  margin-top: 15px;
`);

const ContentPacksPage = createReactClass({
  displayName: 'ContentPacksPage',
  mixins: [Reflux.connect(ContentPacksStore)],

  componentDidMount() {
    ContentPacksActions.list();
  },

  _deleteContentPack(contentPackId) {
    // eslint-disable-next-line no-alert
    if (window.confirm('您即将删除此扩展包，您确定吗?')) {
      ContentPacksActions.delete(contentPackId).then(() => {
        UserNotification.success('扩展包删除成功.', '成功');
        ContentPacksActions.list();
      }, (error) => {
        let err_message = error.message;
        const err_body = error.additional.body;

        if (err_body && err_body.message) {
          err_message = error.additional.body.message;
        }

        UserNotification.error(`删除失败: ${err_message}`, '异常');
      });
    }
  },

  _installContentPack(contentPackId, contentPackRev, parameters) {
    ContentPacksActions.install(contentPackId, contentPackRev, parameters).then(() => {
      UserNotification.success('扩展包安装成功', '成功');
    }, (error) => {
      UserNotification.error(`安装扩展包失败，状态为：${error}。
         无法使用 ID 安装扩展包: ${contentPackId}`);
    });
  },

  render() {
    const { contentPacks, contentPackMetadata } = this.state;

    if (!contentPacks) {
      return (<Spinner />);
    }

    return (
      <DocumentTitle title="扩展包">
        <span>
          <PageHeader title="扩展包">
            <span>
              扩展包可加速特定数据源的设置过程。扩展包可以包括输入/​​提取器、流和仪表板。
            </span>

            <span>
              查看 {' '}
              <a href="https://marketplace.graylog.org/" target="_blank" rel="noopener noreferrer">文档</a>.
            </span>

            <ButtonToolbar>
              <ContentPackUploadControls />
              <LinkContainer to={Routes.SYSTEM.CONTENTPACKS.CREATE}>
                <Button bsStyle="success">创建扩展包</Button>
              </LinkContainer>
              <Button bsStyle="info" active>扩展包</Button>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <ConfigurationBundles>
                <ContentPacksList contentPacks={contentPacks}
                                  contentPackMetadata={contentPackMetadata}
                                  onDeletePack={this._deleteContentPack}
                                  onInstall={this._installContentPack} />
              </ConfigurationBundles>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  },
});

export default ContentPacksPage;
