import { useRef, useState } from 'react';

import { SEARCH_ENGINES } from '../lib/defaults.js';
import { buildSearchUrl, getSearchEngine } from '../lib/search.js';
import { useDashboard } from '../state/DashboardProvider.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Menu } from '../components/ui/Menu.jsx';
import { WidgetShell } from '../components/widgets/WidgetShell.jsx';

export function SearchWidget() {
  const { state, actions } = useDashboard();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const engine = getSearchEngine(state.settings.searchEngine);

  const submit = (event) => {
    event.preventDefault();
    const url = buildSearchUrl(query, engine.id);
    if (!url) {
      inputRef.current?.focus();
      return;
    }
    window.location.assign(url);
  };

  return (
    <WidgetShell id="search" title="Search">
      <form className="search" role="search" onSubmit={submit}>
        <span className="search__icon" aria-hidden="true">
          <Icon name="search" size={19} />
        </span>
        <input
          ref={inputRef}
          className="search__input"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
          placeholder={`Search ${engine.label} or enter an address`}
          aria-label={`Search ${engine.label} or enter a website address`}
          autoComplete="off"
          spellCheck="false"
        />
        <Menu
          label={`Search engine: ${engine.label}`}
          icon="chevronDown"
          items={SEARCH_ENGINES.map((option) => ({
            label: option.label,
            active: option.id === engine.id,
            onSelect: () => actions.updateSettings({ searchEngine: option.id }),
          }))}
        />
        <button type="submit" className="search__submit" aria-label="Search">
          <Icon name="arrowRight" size={18} />
        </button>
      </form>
      <p className="search__hint">
        Type a search or a site address — results open in this tab. Saved locally, works offline.
      </p>
    </WidgetShell>
  );
}
