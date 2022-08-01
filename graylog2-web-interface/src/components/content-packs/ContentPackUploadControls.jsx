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

import UserNotification from 'util/UserNotification';
import { BootstrapModalForm, Input, Button } from 'components/bootstrap';
import { ContentPacksActions } from 'stores/content-packs/ContentPacksStore';

import style from './ContentPackUploadControls.css';

class ContentPackUploadControls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };

    this._openModal = this._openModal.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._save = this._save.bind(this);
  }

  _openModal() {
    this.setState({ isOpen: true });
    this.uploadModal.open();
  }

  _closeModal() {
    this.uploadModal.close();
  }

  _save(submitEvent) {
    submitEvent.preventDefault();

    if (!this.uploadInput.getInputDOMNode().files || !this.uploadInput.getInputDOMNode().files[0]) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      const request = evt.target.result;

      ContentPacksActions.create.triggerPromise(request)
        .then(
          () => {
            UserNotification.success('扩展包导入成功', '成功!');
            ContentPacksActions.list();
          },
          (response) => {
            const message = '扩展包导入失败,请确认是有效的json文件.在DataInsight日志中查看更多信息.';
            const title = '无法导入扩展包';
            let smallMessage = '';

            if (response.additional && response.additional.body && response.additional.body.message) {
              smallMessage = `<br /><small>${response.additional.body.message}</small>`;
            }

            UserNotification.error(message + smallMessage, title);
          },
        );
    };

    reader.readAsText(this.uploadInput.getInputDOMNode().files[0]);
    this._closeModal();
  }

  render() {
    const { isOpen } = this.state;

    return (
      <span>
        <Button className={style.button}
                active={isOpen}
                id="upload-content-pack-button"
                bsStyle="success"
                onClick={this._openModal}>Upload
        </Button>
        <BootstrapModalForm onModalClose={() => { this.setState({ isOpen: false }); }}
                            ref={(node) => { this.uploadModal = node; }}
                            onSubmitForm={this._save}
                            title="上传扩展包"
                            submitButtonText="上传">
          <Input ref={(node) => { this.uploadInput = node; }}
                 id="upload-content-pack"
                 label="选择文件"
                 type="file"
                 help="选择本地的扩展包" />
        </BootstrapModalForm>
      </span>
    );
  }
}

export default ContentPackUploadControls;
