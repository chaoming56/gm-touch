import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Loading = ({ style, size, text, className, ...rest }) => {
  return (
    <div
      {...rest}
      className={classNames('t-loading', className)}
      style={{
        ...style,
        height: size + 'px'
      }}
    >
      <svg className='t-loading-circular' viewBox='0 0 50 50'>
        <circle className='t-loading-path' cx='25' cy='25' r='20' fill='none' />
      </svg>
      {text && <p className='t-loading-text'>{text}</p>}
    </div>
  )
}

Loading.propTypes = {
  text: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object
}

Loading.defaultProps = {
  size: 50
}

export default Loading