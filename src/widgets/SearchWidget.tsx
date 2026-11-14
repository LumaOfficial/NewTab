import { useState, type FormEvent } from 'react';
import { useDashboard } from '../state/DashboardProvider';
import { getSearchEngine, searchUrlFor } from '../lib/searchEngines';
import { SearchIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { WidgetCard } from './WidgetCard';

export function SearchWidget() {
  const { data } = useDashboard();
  const [query, setQuery] = useState('');
  const engine = getSearchEngine(data.settings.searchEngine);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const url = searchUrlFor(engine.id, trimmed);
    if (data.settings.searchInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.assign(url);
    }
    setQuery('');
  };

  return (
    <WidgetCard title="Search">
      <form className="search" onSubmit={handleSubmit} role="search">
        <div className="search__form">
          <span className="search__icon" aria-hidden="true">
            <SearchIcon size={19} />
          </span>
          <label className="visually-hidden" htmlFor="luma-search">
            Search the web
          </label>
          <input
            id="luma-search"
            className="search__input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${engine.label}`}
            autoComplete="off"
            spellCheck={false}
          />
          <Button type="submit" variant="primary" disabled={query.trim().length === 0}>
            Search
          </Button>
        </div>
      </form>
      <p className="search__hint">
        <span className="search__engine">{engine.label}</span>
        <span>
          Enter to search · results open {data.settings.searchInNewTab ? 'in a new tab' : 'here'}
        </span>
      </p>
    </WidgetCard>
  );
}
