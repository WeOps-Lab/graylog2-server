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

import { LinkContainer } from 'components/common/router';
import { Col, Row, Button } from 'components/bootstrap';
import { DataTable, PaginatedList, SearchForm } from 'components/common';
import Routes from 'routing/Routes';

import ConfigurationRow from './ConfigurationRow';
import style from './ConfigurationList.css';

class ConfigurationList extends React.Component {
  static propTypes = {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    validateConfiguration: PropTypes.func.isRequired,
  };

  _headerCellFormatter = (header) => {
    const className = (header === '操作' ? style.actionsColumn : '');

    return <th className={className}>{header}</th>;
  };

  _collectorConfigurationFormatter = (configuration) => {
    const { collectors, onClone, onDelete, validateConfiguration } = this.props;
    const configurationCollector = collectors.find((collector) => collector.id === configuration.collector_id);

    return (
      <ConfigurationRow key={configuration.id}
                        configuration={configuration}
                        collector={configurationCollector}
                        onCopy={onClone}
                        validateConfiguration={validateConfiguration}
                        onDelete={onDelete} />
    );
  };

  render() {
    const { configurations, pagination, query, total, onPageChange, onQueryChange } = this.props;
    const headers = ['配置', '颜色', '采集器', '操作'];

    return (
      <div>
        <Row>
          <Col md={12}>
            <div className="pull-right">
              <LinkContainer to={Routes.SYSTEM.SIDECARS.NEW_CONFIGURATION}>
                <Button onClick={this.openModal} bsStyle="success" bsSize="small">创建配置</Button>
              </LinkContainer>
            </div>
            <h2>共<small>{total}</small>份配置</h2>
          </Col>
          <Col md={12}>
            <p>
              这里是采集器所使用的配置.
            </p>
          </Col>
        </Row>

        <Row className={`row-sm ${style.configurationRow}`}>
          <Col md={12}>
            <SearchForm query={query}
                        onSearch={onQueryChange}
                        onReset={onQueryChange}
                        searchButtonLabel="查找"
                        placeholder="查找配置"
                        wrapperClass={style.inline}
                        queryWidth={300}
                        topMargin={0}
                        useLoadingState />

            <PaginatedList activePage={pagination.page}
                           pageSize={pagination.pageSize}
                           pageSizes={[10, 25]}
                           totalItems={pagination.total}
                           onChange={onPageChange}>
              <div className={style.configurationTable}>
                <DataTable id="collector-configurations-list"
                           className="table-hover"
                           headers={headers}
                           headerCellFormatter={this._headerCellFormatter}
                           rows={configurations}
                           rowClassName="row-sm"
                           dataRowFormatter={this._collectorConfigurationFormatter}
                           noDataText="暂无任何配置."
                           filterLabel=""
                           filterKeys={[]}
                           useResponsiveTable={false} />
              </div>
            </PaginatedList>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ConfigurationList;
