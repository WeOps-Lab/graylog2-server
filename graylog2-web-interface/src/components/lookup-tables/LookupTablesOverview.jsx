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
import Routes from 'routing/Routes';
import { Row, Col, Table, Popover, Button } from 'components/bootstrap';
import { OverlayTrigger, PaginatedList, SearchForm, Icon } from 'components/common';
import LUTTableEntry from 'components/lookup-tables/LUTTableEntry';
import { LookupTablesActions } from 'stores/lookup-tables/LookupTablesStore';

import Styles from './Overview.css';

class LookupTablesOverview extends React.Component {
  static propTypes = {
    tables: PropTypes.arrayOf(PropTypes.object).isRequired,
    caches: PropTypes.objectOf(PropTypes.object).isRequired,
    dataAdapters: PropTypes.objectOf(PropTypes.object).isRequired,
    pagination: PropTypes.object.isRequired,
    errorStates: PropTypes.object.isRequired,
  };

  _onPageChange = (newPage, newPerPage) => {
    LookupTablesActions.searchPaginated(newPage, newPerPage, this.props.pagination.query);
  };

  _onSearch = (query, resetLoadingStateCb) => {
    LookupTablesActions
      .searchPaginated(this.props.pagination.page, this.props.pagination.per_page, query)
      .then(resetLoadingStateCb);
  };

  _onReset = () => {
    LookupTablesActions.searchPaginated(this.props.pagination.page, this.props.pagination.per_page);
  };

  _lookupName = (id, map) => {
    const empty = { title: '无' };

    if (!map) {
      return empty;
    }

    return map[id] || empty;
  };

  _lookupAdapterError = (table) => {
    if (this.props.errorStates.dataAdapters && this.props.dataAdapters) {
      const adapter = this.props.dataAdapters[table.data_adapter_id];

      if (!adapter) {
        return null;
      }

      return this.props.errorStates.dataAdapters[adapter.name];
    }

    return null;
  };

  _helpPopover = () => {
    return (
      <Popover id="search-query-help" className={Styles.popoverWide} title="搜索提示">
        <p><strong>可用搜索字段</strong></p>
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
            <td>数据字典ID</td>
          </tr>
          <tr>
            <td>title</td>
            <td>标题</td>
          </tr>
          <tr>
            <td>name</td>
            <td>名称</td>
          </tr>
          <tr>
            <td>description</td>
            <td>描述</td>
          </tr>
          </tbody>
        </Table>
        <p><strong>示例</strong></p>
        <p>
          按名称查找:<br />
          <kbd>name:geoip</kbd><br />
          <kbd>name:geo</kbd>
        </p>
        <p>
          按<code>标题</code>查找：<br />
          <kbd>geoip</kbd> <br />等价于<br />
          <kbd>title:geoip</kbd>
        </p>
      </Popover>
    );
  };

  render() {
    const lookupTables = this.props.tables.map((table) => {
      const cache = this._lookupName(table.cache_id, this.props.caches);
      const dataAdapter = this._lookupName(table.data_adapter_id, this.props.dataAdapters);
      const errors = {
        table: this.props.errorStates.tables[table.name],
        cache: null,
        dataAdapter: this._lookupAdapterError(table),
      };

      return (
        <LUTTableEntry key={table.id}
                       table={table}
                       cache={cache}
                       dataAdapter={dataAdapter}
                       errors={errors} />
      );
    });

    return (
      <div>
        <Row className="content">
          <Col md={12}>
            <h2>
              数据字典列表
              <span>&nbsp;<small>共 {this.props.pagination.total}</small></span>
            </h2>
            <PaginatedList onChange={this._onPageChange} totalItems={this.props.pagination.total}>
              <SearchForm onSearch={this._onSearch} onReset={this._onReset} useLoadingState>
                <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.CREATE}>
                  <Button bsStyle="success" style={{ marginLeft: 5 }}>创建数据字典</Button>
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
                    <th className={Styles.rowCache}>数据缓存</th>
                    <th className={Styles.rowAdapter}>数据源</th>
                    <th className={Styles.rowActions}>操作</th>
                  </tr>
                </thead>
                {lookupTables}
              </Table>
            </PaginatedList>
          </Col>
        </Row>
      </div>
    );
  }
}

export default LookupTablesOverview;
