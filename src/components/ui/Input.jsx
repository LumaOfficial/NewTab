/** Text input, styled for both settings and inline widget forms. */
export function Input({ className = '', ...rest }) {
  return <input className={`input ${className}`.trim()} {...rest} />;
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`input input--textarea ${className}`.trim()} {...rest} />;
}
