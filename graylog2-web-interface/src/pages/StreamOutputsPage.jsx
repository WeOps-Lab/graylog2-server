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
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';

import {Link} from 'components/common/router';
import {Col} from 'components/bootstrap';
import {ContentHeadRow, DocumentTitle, Spinner} from 'components/common';
import OutputsComponent from 'components/outputs/OutputsComponent';
import SupportLink from 'components/support/SupportLink';
import Routes from 'routing/Routes';
import withParams from 'routing/withParams';
import StreamsStore from 'stores/streams/StreamsStore';
import {CurrentUserStore} from 'stores/users/CurrentUserStore';

const StreamOutputsPage = createReactClass({
  displayName: 'StreamOutputsPage',
  propTypes: {
    params: PropTypes.shape({
      streamId: PropTypes.string.isRequired,
    }).isRequired,
  },

  mixins: [Reflux.connect(CurrentUserStore)],

  getInitialState() {
    return {stream: undefined};
  },

  componentDidMount() {
    const {params} = this.props;

    StreamsStore.get(params.streamId, (stream) => {
      this.setState({stream: stream});
    });
  },

  render() {
    const {stream, currentUser} = this.state;

    if (!stream) {
      return <Spinner/>;
    }

    return (
      <DocumentTitle title={`消息流 ${stream.title} 输出`}>
        <div>
          <ContentHeadRow className="content">
            <Col md={10}>
              <h1>
                消息流 &raquo;{stream.title}&laquo;输出
              </h1>

              <p className="description">
                DataInsight节点可以将日志消息输出到指定的位置，在这里您可以启动或停止您所需要的输出流。
                <Link to={Routes.SYSTEM.OUTPUTS}>这里</Link>配置的输出都可用。
                您可以在<a href="" rel="noopener noreferrer" target="_blank">DataInsight市场</a>查找更多输出插件
              </p>

              <SupportLink>
                在此处<i>删除</i>消息流输出，不会影响其在输出列表中的使用。如果您需要<i>全局</i>用输出流，请点击<Link to={Routes.SYSTEM.OUTPUTS}>全局输出列表</Link>。
              </SupportLink>
            </Col>
          </ContentHeadRow>
          <OutputsComponent streamId={stream.id} permissions={currentUser.permissions}/>
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(StreamOutputsPage);
