// "Never book these" — README §5d. Removable chips seeded from
// DEFAULT_NEVER_BOOK, plus a dashed "+ Add" chip. Adding is a plain
// window.prompt — there's no dedicated input flow specced for this card.

import { Card, Chip } from '../../components';
import { useConsole } from '../../state';

import styles from './NeverBookCard.module.css';

export default function NeverBookCard() {
  const { state, removeNeverBook, addNeverBook } = useConsole();

  const handleAdd = () => {
    const label = window.prompt('Add to the never-book list');
    const trimmed = label && label.trim();
    if (trimmed) addNeverBook(trimmed);
  };

  return (
    <Card>
      <h2 className={`t-h2 ${styles.title}`}>Never book these</h2>
      <p className={`t-small ${styles.copy}`}>
        The agent will always take details and pass these to you, even in direct booking mode.
      </p>
      <div className={styles.chips}>
        {state.neverBook.map((label) => (
          <Chip key={label} variant="never-book" onRemove={() => removeNeverBook(label)}>
            {label}
          </Chip>
        ))}
        <Chip variant="add" onClick={handleAdd}>
          Add
        </Chip>
      </div>
    </Card>
  );
}
