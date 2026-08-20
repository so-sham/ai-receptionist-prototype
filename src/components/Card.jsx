import styles from './Card.module.css'

/**
 * Generic white bordered wrapper: radius 10, 24px padding, hairline border.
 */
export default function Card({ children, className, ...rest }) {
  const classes = [styles.card, className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
