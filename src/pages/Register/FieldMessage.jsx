export const FieldMessage = ({ error, hint, checking }) => (
  <>
    {checking && <small className="input-hint">{checking}</small>}
    {error && <small className="input-error">{error}</small>}
    {hint && !error && <small className="input-hint">{hint}</small>}
  </>
);

export const fieldClassName = (hasError) => (hasError ? 'field-input field-input--error' : 'field-input');
