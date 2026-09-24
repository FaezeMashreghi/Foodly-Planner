import { useState } from 'react'
import { TextField, type TextFieldProps } from '@/components/ui/text-field/text-field'

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'action'>

/**
 * A password input with a Show/Hide button, following the GOV.UK password
 * input pattern: the button's name says what it will do, and a status message
 * tells screen reader users whether the password is visible.
 */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <TextField
        {...props}
        type={visible ? 'text' : 'password'}
        // Stop phones from "correcting" or capitalizing the password while it's visible.
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        action={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="min-h-11 min-w-11 rounded-control px-3 text-sm font-medium text-brand hover:text-brand-hover"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        }
      />
      <span role="status" className="sr-only">
        {visible ? 'Your password is visible' : 'Your password is hidden'}
      </span>
    </>
  )
}
