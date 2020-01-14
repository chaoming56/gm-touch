import React from 'react'
import PropTypes from 'prop-types'
import Popover from '../popover'
import Overlay from './overlay'
import _ from 'lodash'
import classNames from 'classnames'
import SVGDown from '../../../svg/down.svg'
import Selection from '../selection'
import moment from 'moment'

/**
 * DateRangePicker -- 日期段选择
 * 主要功能：提供日期段选择
 *
 * 额外增加时间选择功能
 * */

class DateRangePicker extends React.Component {
  refPopover = React.createRef()

  selectionRef = React.createRef()

  apiDoFocus = () => {
    this.selectionRef.current.apiDoFocus()
  }

  handleOK = (begin, end) => {
    this.refPopover.current.apiDoSetActive(false)
    this.props.onChange(begin, end)
  }

  handleCancel = () => {
    this.refPopover.current.apiDoSetActive(false)
  }

  // 只会 null
  handleSelect = selected => {
    if (selected === null) {
      this.props.onChange(null, null)
    }
  }

  render() {
    const {
      begin,
      end,
      onChange,
      disabled,
      min,
      max,
      disabledDate,
      canClear,
      className,
      children,
      renderDate,
      ...rest
    } = this.props

    const popup = (
      <Overlay
        begin={begin}
        end={end}
        min={min}
        max={max}
        onOK={this.handleOK}
        onCancel={this.handleCancel}
        disabledDate={disabledDate}
      />
    )

    const renderSelected = item => {
      if (renderDate && item.begin && item.end) {
        return <>{renderDate(item.begin, item.end)}</>
      }

      let b = <span className='t-text-desc'>开始日期</span>
      let e = <span className='t-text-desc'>结束日期</span>

      if (item.begin) {
        const _begin = moment(item.begin)
        b = _begin.format('YYYY-MM-DD')
      }

      if (item.end) {
        const _end = moment(item.end)
        e = _end.format('YYYY-MM-DD')
      }

      return (
        <>
          {b}&nbsp;~&nbsp;{e}
        </>
      )
    }

    return (
      <Popover
        ref={this.refPopover}
        animName
        disabled={disabled}
        popup={popup}
        style={{ minWidth: '500px' }}
      >
        {children !== undefined ? (
          children
        ) : (
          <Selection
            ref={this.selectionRef}
            {...rest}
            selected={{ begin, end }}
            onSelect={this.handleSelect}
            disabled={disabled}
            renderSelected={renderSelected}
            placeholder=''
            disabledClose={!canClear}
            className={classNames('t-range-range-picker', className)}
            funIcon={<SVGDown />}
            isForSelect
          />
        )}
      </Popover>
    )
  }
}

DateRangePicker.displayName = 'DateRangePicker'

DateRangePicker.propTypes = {
  /** 开始日期, Date 对象 */
  begin: PropTypes.object,
  /** 结束日期, Date 对象 */
  end: PropTypes.object,
  /** 参数 begin, end */
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  /** Date 对象，表示可选的最小日期 */
  min: PropTypes.object,
  /** Date 对象，表示可选的最大日期 */
  max: PropTypes.object,
  /** 自定义日期是否可选。传入参数为Date对象，返回true or false。 有此属性则min max无效。 */
  disabledDate: PropTypes.func,
  /** 自定义日期展示格式。传入 开始 && 结束 两个Date对象, 返回日期展示格式 */
  renderDate: PropTypes.func,
  /** 清除日期 */
  canClear: PropTypes.bool,
  className: PropTypes.string,
}

DateRangePicker.defaultProps = {
  onChange: _.noop,
}

export default DateRangePicker