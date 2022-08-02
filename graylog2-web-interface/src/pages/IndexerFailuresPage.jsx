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
import numeral from 'numeral';
import moment from 'moment';
moment.locale('zh-cn');
import { Col, Row } from 'components/bootstrap';
import DocsHelper from 'util/DocsHelper';
import { DocumentTitle, Spinner, PageHeader, PaginatedList } from 'components/common';
import { DocumentationLink } from 'components/support';
import { IndexerFailuresList } from 'components/indexers';
import { IndexerFailuresStore } from 'stores/indexers/IndexerFailuresStore';

class IndexerFailuresPage extends React.Component {
  state = {};

  componentDidMount() {
    IndexerFailuresStore.count(moment().subtract(10, 'years')).then((response) => {
      this.setState({ total: response.count });
    });

    this.loadData(1, this.defaultPageSize);
  }

  defaultPageSize = 50;

  loadData = (page, size) => {
    IndexerFailuresStore.list(size, (page - 1) * size).then((response) => {
      this.setState({ failures: response.failures });
    });
  };

  _onChangePaginatedList = (page, size) => {
    this.loadData(page, size);
  };

  render() {
    if (this.state.total === undefined || !this.state.failures) {
      return <Spinner />;
    }

    return (
      <DocumentTitle title="索引失败信息">
        <span>
          <PageHeader title="索引失败信息">
            <span>
              这是索引失败信息列表,
              索引失败意味着您发送给DataInsight的消息已被正确处理,但将其写入ElasticSearch集群失败了.
              请注意,此列表的大小限制为50MB，因此它不一定包含所有索引失败的消息
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.INDEXER_FAILURES} text="文档" />中查看更多关于索引失败的信息。
            </span>
          </PageHeader>
          <Row className="content">
            <Col md={12}>
              <PaginatedList totalItems={this.state.total} onChange={this._onChangePaginatedList} pageSize={this.defaultPageSize}>
                <IndexerFailuresList failures={this.state.failures} />
              </PaginatedList>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  }
}

export default IndexerFailuresPage;
