import React from 'react';
import PropTypes from 'prop-types';

// Reusable modern button component
const Button = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, disabled = false, className = '' }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  };
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow hover:from-indigo-600 hover:to-indigo-800 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 shadow-sm focus:ring-indigo-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow focus:ring-red-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  };

  const classes = [base, sizes[size], variants[variant] || variants.primary, className].join(' ');

  return (
    <button onClick={onClick} className={classes} disabled={disabled} type="button" aria-disabled={disabled}>
      {Icon && <span className="mr-2 inline-flex items-center"><Icon className="w-4 h-4" /></span>}
      <span>{children}</span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Button;
