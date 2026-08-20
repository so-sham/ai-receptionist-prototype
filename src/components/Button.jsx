import styles from './Button.module.css'

/**
 * Primitive button.
 * variant: 'primary' | 'secondary' | 'quiet'
 * size: 'lg' (44px min-height) | 'sm' (36px min-height)
 */
export default function Button({
  variant = 'primary',
  size = 'lg',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className,
}) {
  const classes = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
