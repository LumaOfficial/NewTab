import { forwardRef } from 'react';

import { Icon } from './Icon.jsx';

/**
 * The app's only button primitive. `variant` covers the visual roles used in
 * dashboards and settings; `icon`/`iconRight` are optional leading/trailing icons.
 */
export function Button({ variant = 'secondary', size = 'md', icon, iconRight, className = '', children, ...rest }) {
  return (
    <button type="button" className={`btn btn--${variant} btn--${size} ${className}`.trim()} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 15 : 16} /> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 15 : 16} /> : null}
    </button>
  );
}

/** Square, icon-only button. Always pass a `label` for screen readers. */
export const IconButton = forwardRef(function IconButton({ label, icon, size = 16, className = '', variant = 'ghost', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`btn btn--${variant} btn--icon ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
});
