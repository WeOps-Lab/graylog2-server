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
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import trim from 'lodash/trim';
import isEqual from 'lodash/isEqual';
import { Field, useField } from 'formik';

import { Col, FormControl, FormGroup, Panel, Row } from 'components/bootstrap';
import DateTime from 'logic/datetimes/DateTime';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import ToolsStore from 'stores/tools/ToolsStore';

import { EMPTY_RANGE } from '../TimeRangeDisplay';

const KeywordInput = styled(FormControl)(({ theme }) => css`
  min-height: 34px;
  font-size: ${theme.fonts.size.large};
`);

const ErrorMessage = styled.span(({ theme }) => css`
  color: ${theme.colors.variant.dark.danger};
  font-size: ${theme.fonts.size.small};
  font-style: italic;
  padding: 3px 3px 9px;
  display: block;
`);

const _parseKeywordPreview = (data) => {
  const { timezone } = data;
  const from = DateTime.fromDateTimeAndTZ(data.from, timezone).toString();
  const to = DateTime.fromDateTimeAndTZ(data.to, timezone).toString();

  return { from, to, timezone };
};

type Props = {
  defaultValue: string,
  disabled: boolean,
  setValidatingKeyword: (boolean) => void
};

const TabKeywordTimeRange = ({ defaultValue, disabled, setValidatingKeyword }: Props) => {
  const [nextRangeProps, , nextRangeHelpers] = useField('nextTimeRange');
  const mounted = useRef(true);
  const keywordRef = useRef<string>();
  const [keywordPreview, setKeywordPreview] = useState({ from: '', to: '', timezone: '' });

  const _setSuccessfullPreview = useCallback((response: { from: string, to: string, timezone: string }) => {
    setValidatingKeyword(false);

    return setKeywordPreview(_parseKeywordPreview(response));
  },
  [setValidatingKeyword]);

  const _setFailedPreview = useCallback(() => {
    setKeywordPreview({ from: EMPTY_RANGE, to: EMPTY_RANGE, timezone: DateTime.getUserTimezone() });

    return 'Unable to parse keyword.';
  }, [setKeywordPreview]);

  const _validateKeyword = useCallback((keyword: string) => {
    if (keyword === undefined) {
      return undefined;
    }

    if (keywordRef.current !== keyword) {
      keywordRef.current = keyword;

      setValidatingKeyword(true);

      return trim(keyword) === ''
        ? Promise.resolve('关键字不能为空!')
        : ToolsStore.testNaturalDate(keyword)
          .then((response) => {
            if (mounted.current) _setSuccessfullPreview(response);
          })
          .catch(_setFailedPreview);
    }

    return undefined;
  }, [_setFailedPreview, _setSuccessfullPreview, setValidatingKeyword]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    _validateKeyword(keywordRef.current);
  }, [_validateKeyword]);

  useEffect(() => {
    if (nextRangeProps?.value) {
      const { type, keyword, ...restPreview } = nextRangeProps?.value;

      if (!isEqual(restPreview, keywordPreview)) {
        nextRangeHelpers.setValue({
          type,
          keyword,
          ...restPreview,
          ...keywordPreview,
        });
      }
    }
  }, [nextRangeProps.value, keywordPreview, nextRangeHelpers]);

  return (
    <Row className="no-bm">
      <Col sm={5}>
        <Field name="nextTimeRange.keyword" validate={_validateKeyword}>
          {({ field: { name, value, onChange }, meta: { error } }) => (
            <FormGroup controlId="form-inline-keyword"
                       style={{ marginRight: 5, width: '100%', marginBottom: 0 }}
                       validationState={error ? 'error' : null}>

              <p><strong>指定自然语言搜索的时间范围.</strong></p>
              <KeywordInput type="text"
                            className="input-sm mousetrap"
                            name={name}
                            disabled={disabled}
                            placeholder="Last week"
                            onChange={onChange}
                            required
                            value={value || defaultValue} />

              {error && (<ErrorMessage>{error}</ErrorMessage>)}
            </FormGroup>
          )}
        </Field>
      </Col>

      <Col sm={7}>
        <Panel>
          <Panel.Body>
            <p><code>上个月</code> 一个月前和现在之间的搜索</p>

            <p><code>4 小时前</code> 4 小时前和现在之间的搜索</p>

            <p><code>4 月 1 日至 2 天前</code> 4 月 1 日至 2 天前之间的搜索</p>

            <p><code>昨天午夜 +0200 到今天午夜 +0200</code> 在时区 +0200 中搜索昨天午夜和今天午夜之间 - UTC 时间为 22:00</p>

            <p>查看 <DocumentationLink page={DocsHelper.PAGES.TIME_FRAME_SELECTOR}
                                                     title="时间范围格式"
                                                     text="文档" /> .
            </p>
          </Panel.Body>
        </Panel>
      </Col>
    </Row>
  );
};

TabKeywordTimeRange.propTypes = {
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  setValidatingKeyword: PropTypes.func,
};

TabKeywordTimeRange.defaultProps = {
  defaultValue: '',
  disabled: false,
  setValidatingKeyword: () => {},
};

export default TabKeywordTimeRange;
