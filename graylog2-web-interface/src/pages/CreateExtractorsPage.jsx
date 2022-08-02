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

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import EditExtractor from 'components/extractors/EditExtractor';
import DocsHelper from 'util/DocsHelper';
import StringUtils from 'util/StringUtils';
import history from 'util/History';
import Routes from 'routing/Routes';
import withParams from 'routing/withParams';
import withLocation from 'routing/withLocation';
import { ExtractorsStore } from 'stores/extractors/ExtractorsStore';
import { InputsActions, InputsStore } from 'stores/inputs/InputsStore';
import { MessagesActions } from 'stores/messages/MessagesStore';

const CreateExtractorsPage = createReactClass({
  displayName: 'CreateExtractorsPage',

  propTypes: {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(InputsStore)],

  getInitialState() {
    const { location } = this.props;
    const { query } = location;

    return {
      extractor: ExtractorsStore.new(query.extractor_type, query.field),
      exampleMessage: undefined,
      field: query.field,
      exampleIndex: query.example_index,
      exampleId: query.example_id,
    };
  },

  componentDidMount() {
    const { params } = this.props;

    InputsActions.get.triggerPromise(params.inputId);
    const { exampleIndex, exampleId } = this.state;

    MessagesActions.loadMessage.triggerPromise(exampleIndex, exampleId)
      .then((message) => this.setState({ exampleMessage: message }));
  },

  _isLoading() {
    const { exampleMessage, input } = this.state;

    return !(input && exampleMessage);
  },

  _extractorSaved() {
    let url;
    const { params } = this.props;
    const { input } = this.state;

    if (input.global) {
      url = Routes.global_input_extractors(params.inputId);
    } else {
      url = Routes.local_input_extractors(params.nodeId, params.inputId);
    }

    history.push(url);
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { field, exampleMessage, extractor, input } = this.state;
    const stringifiedExampleMessage = StringUtils.stringify(exampleMessage.fields[field]);

    return (
      <DocumentTitle title={`新建消息提取器 ${input.title}`}>
        <div>
          <PageHeader title={<span>新建输入 <em>{input.title}</em> 消息提取器</span>}>
            <span>
              日志提取器将会应用在接收器中的每条信息.使用日志提取器后,将会有助于分析时进行过滤及字段搜索.
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.EXTRACTORS} text="文档" />中查看更多关于提取器的信息.
            </span>
          </PageHeader>
          <EditExtractor action="create"
                         extractor={extractor}
                         inputId={input.id}
                         exampleMessage={stringifiedExampleMessage}
                         onSave={this._extractorSaved} />
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(withLocation(CreateExtractorsPage));
