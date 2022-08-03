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

import { LinkContainer } from 'components/common/router';
import { OverlayTrigger, PaginatedList, SearchForm, Spinner, Icon } from 'components/common';
import { Row, Col, Table, Popover, Button } from 'components/bootstrap';
import DataAdapterTableEntry from 'components/lookup-tables/DataAdapterTableEntry';
import Routes from 'routing/Routes';
import { LookupTableDataAdaptersActions } from 'stores/lookup-tables/LookupTableDataAdaptersStore';

import Styles from './Overview.css';

class DataAdaptersOverview extends React.Component {
  static propTypes = {
    dataAdapters: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    errorStates: PropTypes.object.isRequired,
  };

  _onPageChange = (newPage, newPerPage) => {
    const { pagination } = this.props;

    LookupTableDataAdaptersActions.searchPaginated(newPage, newPerPage, pagination.query);
  };

  _onSearch = (query, resetLoadingStateCb) => {
    const { pagination } = this.props;

    LookupTableDataAdaptersActions
      .searchPaginated(pagination.page, pagination.per_page, query)
      .then(resetLoadingStateCb);
  };

  _onReset = () => {
    const { pagination } = this.props;

    LookupTableDataAdaptersActions.searchPaginated(pagination.page, pagination.per_page);
  };

  _helpPopover = () => {
    return (
      <Popover id="search-query-help" className={Styles.popoverWide} title="搜索提示">
        <p><strong>可用的搜索字段</strong></p>
        <Table condensed>
          <thead>
          <tr>
            <th>字段</th>
            <th>描述</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>id</td>
            <td>数据源ID</td>
          </tr>
          <tr>
            <td>title</td>
            <td>数据源标题</td>
          </tr>
          <tr>
            <td>name</td>
            <td>数据源名称</td>
          </tr>
          <tr>
            <td>description</td>
            <td>数据源描述</td>
          </tr>
          </tbody>
        </Table>
        <p><strong>示例</strong></p>
        <p>
          按名称进行搜索:<br />
          <kbd>name:geoip</kbd><br />
          <kbd>name:geo</kbd>
        </p>
        <p>
          按<code>标题</code>搜索：<br />
          <kbd>geoip</kbd> <br />等价于<br />
          <kbd>title:geoip</kbd>
        </p>
      </Popover>
    );
  };

  render() {
    const { dataAdapters, errorStates, pagination } = this.props;

    if (!dataAdapters) {
      return <Spinner text="Loading data adapters" />;
    }

    const dataAdapterEntries = dataAdapters.map((dataAdapter) => {
      return (
        <DataAdapterTableEntry key={dataAdapter.id}
                               adapter={dataAdapter}
                               error={errorStates.dataAdapters[dataAdapter.name]} />
      );
    });

    return (
      <div>
        <Row className="content">
          <Col md={12}>
            <h2>
              配置数据字典适配器
              <span>&nbsp;
                <small>共 {pagination.total}</small>
              </span>
            </h2>
            <PaginatedList onChange={this._onPageChange} totalItems={pagination.total}>
              <SearchForm onSearch={this._onSearch} onReset={this._onReset} useLoadingState>
                <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.CREATE}>
                  <Button bsStyle="success" style={{ marginLeft: 5 }}>创建适配器</Button>
                </LinkContainer>
                <OverlayTrigger trigger="click" rootClose placement="right" overlay={this._helpPopover()}>
                  <Button bsStyle="link" className={Styles.searchHelpButton}><Icon name="question-circle" fixedWidth /></Button>
                </OverlayTrigger>
              </SearchForm>
              <Table condensed hover className={Styles.overviewTable}>
                <thead>
                  <tr>
                    <th className={Styles.rowTitle}>标题</th>
                    <th className={Styles.rowDescription}>描述</th>
                    <th className={Styles.rowName}>名称</th>
                    <th>吞吐量</th>
                    <th className={Styles.rowActions}>操作</th>
                  </tr>
                </thead>
                {dataAdapterEntries}
              </Table>
            </PaginatedList>
          </Col>
        </Row>
      </div>
    );
  }
}

export default DataAdaptersOverview;
