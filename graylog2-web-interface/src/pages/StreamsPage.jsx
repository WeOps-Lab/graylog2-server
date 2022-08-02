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
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { Row, Col } from 'components/bootstrap';
import CreateStreamButton from 'components/streams/CreateStreamButton';
import StreamComponent from 'components/streams/StreamComponent';
import DocumentationLink from 'components/support/DocumentationLink';
import PageHeader from 'components/common/PageHeader';
import { DocumentTitle, IfPermitted, Spinner } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import UserNotification from 'util/UserNotification';
import StreamsStore from 'stores/streams/StreamsStore';
import { CurrentUserStore } from 'stores/users/CurrentUserStore';
import { IndexSetsActions, IndexSetsStore } from 'stores/indices/IndexSetsStore';

const StreamsPage = createReactClass({
  displayName: 'StreamsPage',
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(IndexSetsStore)],

  getInitialState() {
    return {
      indexSets: undefined,
    };
  },

  componentDidMount() {
    IndexSetsActions.list(false);
  },

  _isLoading() {
    return !this.state.currentUser || !this.state.indexSets;
  },

  _onSave(_, stream) {
    StreamsStore.save(stream, () => {
      UserNotification.success('消息流创建成功.', '成功');
    });
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="消息流">
        <div>
          <PageHeader title="消息流">
            <span>
              您可以使用自定义的匹配规则将接收器中的消息汇聚成消息流，并发送到指定的索引集。
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.STREAMS} text="文档"/>中查看更多关于消息流的信息。
            </span>

            <IfPermitted permissions="streams:create">
              <CreateStreamButton bsSize="large"
                                  bsStyle="success"
                                  onSave={this._onSave}
                                  indexSets={this.state.indexSets} />
            </IfPermitted>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <StreamComponent currentUser={this.state.currentUser}
                               onStreamSave={this._onSave}
                               indexSets={this.state.indexSets} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default StreamsPage;
