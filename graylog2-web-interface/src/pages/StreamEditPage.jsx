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
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import {Alert} from 'components/bootstrap';
import StreamRulesEditor from 'components/streamrules/StreamRulesEditor';
import {DocumentTitle, PageHeader, Spinner} from 'components/common';
import withParams from 'routing/withParams';
import withLocation from 'routing/withLocation';
import StreamsStore from 'stores/streams/StreamsStore';
import {CurrentUserStore} from 'stores/users/CurrentUserStore';

const StreamEditPage = createReactClass({
  displayName: 'StreamEditPage',

  propTypes: {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(CurrentUserStore)],

  componentDidMount() {
    const {params} = this.props;

    StreamsStore.get(params.streamId, (stream) => {
      this.setState({stream});
    });
  },

  _isLoading() {
    const {currentUser, stream} = this.state;

    return !currentUser || !stream;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner/>;
    }

    const {currentUser, stream} = this.state;
    const {params, location} = this.props;
    let content = (
      <StreamRulesEditor currentUser={currentUser}
                         streamId={params.streamId}
                         messageId={location.query.message_id}
                         index={location.query.index}/>
    );

    if (stream.is_default) {
      content = (
        <div className="row content">
          <div className="col-md-12">
            <Alert bsStyle="danger">
              默认的消息流不可编辑.
            </Alert>
          </div>
        </div>
      );
    }

    return (
      <DocumentTitle title={`消息流 ${stream.title}规则`}>
        <div>
          <PageHeader title={<span>消息流 &raquo;{stream.title}&raquo;规则</span>}>
            <span>
              此页面可以轻松地创建和操作消息流规则,您可以看到配置的消息流规则对消息匹配的作用.
            </span>
          </PageHeader>

          {content}
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(withLocation(StreamEditPage));
