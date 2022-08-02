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
import ImportExtractors from 'components/extractors/ImportExtractors';
import withParams from 'routing/withParams';
import { InputsActions, InputsStore } from 'stores/inputs/InputsStore';

const ImportExtractorsPage = createReactClass({
  displayName: 'ImportExtractorsPage',

  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(InputsStore)],

  componentDidMount() {
    const { params } = this.props;

    InputsActions.get.triggerPromise(params.inputId).then((input) => this.setState({ input: input }));
  },

  _isLoading() {
    return !this.state.input;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const { input } = this.state;

    return (
      <DocumentTitle title={`导入提取器到 ${input.title}`}>
        <div>
          <PageHeader title={<span>导入提取器到 <em>{input.title}</em></span>}>
            <span>
              导出的提取器可以导入到某个输入.您需要从其它DataInsight系统或从
              <a href="" rel="noopener noreferrer" target="_blank">
                DataInsight市场
              </a>导出的JSON。
            </span>
          </PageHeader>
          <ImportExtractors input={input} />
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(ImportExtractorsPage);
