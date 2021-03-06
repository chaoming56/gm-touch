import { getLocale } from '@gm-touch/locales'
import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Modal from '../modal'
import _ from 'lodash'
import classNames from 'classnames'
import LayoutRoot from '../layout_root'
import Button from '../button'
import { isPromise } from '../../util'

let DialogStatics = {
  alert(options) {
    return DialogStatics.dialog(options, 'alert')
  },
  confirm(options) {
    return DialogStatics.dialog(options, 'confirm')
  },
  prompt(options) {
    return DialogStatics.dialog(options, 'prompt')
  },
  dialog(options, type) {
    if (typeof options === 'string') {
      options = {
        children: options
      }
    }
    options.type = type

    return new Promise((resolve, reject) => {
      const _OK = options.onOK
      options.onOK = value => {
        const result = _OK && _OK(value)

        if (result === false) {
          return
        }

        if (!isPromise(result)) {
          resolve(value)
          LayoutRoot.removeComponent(LayoutRoot.TYPE.MODAL)
          return
        }

        return Promise.resolve(result)
          .then(
            () => {
              resolve(value)
            },
            () => {
              reject()
            }
          )
          .finally(() => {
            LayoutRoot.removeComponent(LayoutRoot.TYPE.MODAL)
          })
      }

      options.onCancel = () => {
        LayoutRoot.removeComponent(LayoutRoot.TYPE.MODAL)
        reject()
      }

      LayoutRoot.setComponent(LayoutRoot.TYPE.MODAL, <Dialog {...options} />)
    })
  }
}

const Dialog = ({
  size,
  title,
  children,
  type,
  promptDefaultValue,
  promptPlaceholder,
  onOK,
  onCancel,
  cancelBtn,
  OKBtn,
  disableMaskClose
}) => {
  const refInput = useRef(null)

  const handleCancel = () => {
    onCancel()
  }

  const handleOK = () => {
    const result = onOK(type === 'prompt' ? refInput.current.value : undefined)

    return Promise.resolve(result)
  }

  const handleEnter = e => {
    if (e.keyCode === 13) {
      handleOK()
    }
  }

  const modalProps = {
    onHide: handleCancel,
    disableMaskClose,
    size
  }

  return (
    <Modal
      {...modalProps}
      className={classNames('t-dialog', {
        ['t-dialog-' + type]: type
      })}
      size={modalProps.size}
      title={title}
    >
      <div className='t-dialog-content'>
        {children}
        {type === 'prompt' && (
          <input
            autoFocus
            defaultValue={promptDefaultValue}
            placeholder={promptPlaceholder}
            ref={refInput}
            type='text'
            style={{ display: 'block', width: '100%' }}
            onKeyDown={handleEnter}
          />
        )}
      </div>
      <div className='t-text-right'>
        {type !== 'alert' && cancelBtn && (
          <Button onClick={handleCancel} style={{ minWidth: '200px' }} size='lg'>
            {cancelBtn}
          </Button>
        )}
        <span className='t-gap-20' />
        {OKBtn && (
          <Button type='primary' onClick={handleOK} style={{ minWidth: '200px' }} size='lg'>
            {OKBtn}
          </Button>
        )}
      </div>
    </Modal>
  )
}

Object.assign(Dialog, DialogStatics)

Dialog.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  onCancel: PropTypes.func,
  onOK: PropTypes.func,
  size: PropTypes.string,
  promptDefaultValue: PropTypes.string,
  promptPlaceholder: PropTypes.string,
  cancelBtn: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  OKBtn: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disableMaskClose: PropTypes.bool,
  children: PropTypes.any
}
Dialog.defaultProps = {
  title: getLocale('提示'),
  onCancel: _.noop,
  onOK: _.noop,
  size: 'md',
  cancelBtn: getLocale('取消'),
  OKBtn: getLocale('确定'),
  disableMaskClose: false
}

export default Dialog
