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
import { useState } from 'react';
import type { DefaultTheme } from 'styled-components';
import styled, { css } from 'styled-components';
import { Form, Formik } from 'formik';
import type { PermissionsConfigType } from 'src/stores/configurations/ConfigurationsStore';

import { Button, Col, Modal, Row } from 'components/bootstrap';
import FormikInput from 'components/common/FormikInput';
import Spinner from 'components/common/Spinner';
import { InputDescription } from 'components/common';

type Props = {
  config: PermissionsConfigType,
  updateConfig: (config: PermissionsConfigType) => Promise<void>,
};

const StyledDefList = styled.dl.attrs({
  className: 'deflist',
})(({ theme }: { theme: DefaultTheme }) => css`
  &&.deflist {
    dd {
      padding-left: ${theme.spacings.md};
      margin-left: 200px;
    }
  }
`);

const LabelSpan = styled.span(({ theme }: { theme: DefaultTheme }) => css`
  margin-left: ${theme.spacings.sm};
  font-weight: bold;
`);

const PermissionsConfig = ({ config, updateConfig }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const _saveConfig = (values) => {
    updateConfig(values).then(() => {
      setShowModal(false);
    });
  };

  const _resetConfig = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h2>权限配置</h2>
      <p>这些设置可用于控制可用的实体共享选项</p>

      {!config ? <Spinner /> : (
        <>
          <StyledDefList>
            <dt>分享给所有人:</dt>
            <dd>{config.allow_sharing_with_everyone ? '启用' : '禁用'}</dd>
            <dt>分享给用户:</dt>
            <dd>{config.allow_sharing_with_users ? '启用' : '禁用'}</dd>
          </StyledDefList>

          <p>
            <Button type="button"
                    bsSize="xs"
                    bsStyle="info"
                    onClick={() => {
                      setShowModal(true);
                    }}>配置
            </Button>
          </p>

          <Modal show={showModal} onHide={_resetConfig} aria-modal="true" aria-labelledby="dialog_label">
            <Formik onSubmit={_saveConfig} initialValues={config}>

              {({ isSubmitting }) => {
                return (
                  <Form>
                    <Modal.Header closeButton>
                      <Modal.Title id="dialog_label">配置权限</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <div>
                        <Row>
                          <Col sm={12}>
                            <FormikInput type="checkbox"
                                         name="allow_sharing_with_everyone"
                                         id="shareWithEveryone"
                                         label={(
                                           <LabelSpan>与大家分享</LabelSpan>
                                         )} />
                            <InputDescription help="控制是否可以与所有人共享." />
                          </Col>
                          <Col sm={12}>
                            <FormikInput type="checkbox"
                                         name="allow_sharing_with_users"
                                         id="shareWithUsers"
                                         label={(
                                           <LabelSpan>与用户分享</LabelSpan>
                                         )} />
                            <InputDescription help="控制是否可以与单个用户共享." />
                          </Col>

                        </Row>
                      </div>
                    </Modal.Body>

                    <Modal.Footer>
                      <Button type="button" bsStyle="link" onClick={_resetConfig}>关闭</Button>
                      <Button type="submit" bsStyle="success" disabled={isSubmitting}>{isSubmitting ? '保存中' : '保存'}</Button>
                    </Modal.Footer>
                  </Form>
                );
              }}

            </Formik>
          </Modal>
        </>
      )}
    </div>
  );
};

export default PermissionsConfig;
