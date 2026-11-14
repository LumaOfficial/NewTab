import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useDashboard } from '../state/DashboardProvider';
import {
  getSearchEngine,
  resolveSearchTemplate,
  searchUrlFor,
  SEARCH_ENGINES,
} from '../lib/searchEngines';
import {
  buildSuggestions,
  convertUnits,
  evaluateExpression,
  type Suggestion,
} from '../lib/searchTools';
import {
  readBookmarks,
  readExtensions,
  readHistory,
  readOpenTabs,
  type BrowserLink,
} from '../extension/browserApi';
import { SearchIcon } from '../components/icons';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { NoteDialog } from '../components/editors/NoteDialog';
import type { Note } from '../storage/schema';
import { WidgetCard } from './WidgetCard';
import type { WidgetProps } from './types';

interface BrowserIndex {
  bookmarks: BrowserLink[] | null;
  tabs: BrowserLink[] | null;
  history: BrowserLink[] | null;
  extensions: BrowserLink[] | null;
}

export function SearchWidget({ openSettings }: WidgetProps) {
  const { data, dispatch } = useDashboard();
  const { settings } = data;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [browserIndex, setBrowserIndex] = useState<BrowserIndex>({
    bookmarks: null,
    tabs: null,
    history: null,
    extensions: null,
  });
  const [note, setNote] = useState<Note | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const engine = getSearchEngine(settings.searchEngine);
  const customTemplate = resolveSearchTemplate(settings.searchEngine, settings.customSearchUrl);

  useEffect(() => {
    const focus = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('luma:focus-search', focus);
    return () => window.removeEventListener('luma:focus-search', focus);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([readBookmarks(), readOpenTabs(), readHistory(15), readExtensions()]).then(
      ([bookmarks, tabs, history, extensions]) => {
        if (!cancelled) setBrowserIndex({ bookmarks, tabs, history, extensions });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!settings.searchSuggestions) return [];
    return buildSuggestions(query, {
      shortcuts: data.shortcuts,
      notes: data.notes,
      tasks: data.tasks,
      bookmarks: browserIndex.bookmarks,
      tabs: browserIndex.tabs,
      history: browserIndex.history,
      extensions: browserIndex.extensions,
    });
  }, [browserIndex, data.notes, data.shortcuts, data.tasks, query, settings.searchSuggestions]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const runCommand = (commandId: string) => {
    switch (commandId) {
      case 'new-note':
        setNote(null);
        setNoteOpen(true);
        break;
      case 'new-task': {
        const input = document.getElementById('luma-task-input');
        if (input instanceof HTMLInputElement) {
          input.focus();
          break;
        }
        openSettings();
        break;
      }
      case 'focus-mode': {
        const widget = document.querySelector('[data-widget-id="focus-timer"]');
        if (widget instanceof HTMLElement) {
          widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
        openSettings();
        break;
      }
      default:
        openSettings();
    }
    setOpen(false);
  };

  const choose = (suggestion: Suggestion) => {
    if (suggestion.url) {
      if (settings.searchInNewTab) window.open(suggestion.url, '_blank', 'noopener,noreferrer');
      else window.location.assign(suggestion.url);
      setQuery('');
      setOpen(false);
      return;
    }

    if (suggestion.commandId) {
      runCommand(suggestion.commandId);
      setQuery('');
      return;
    }

    if (suggestion.kind === 'note') {
      const target = data.notes.find((entry) => `note-${entry.id}` === suggestion.id);
      if (target) {
        setNote(target);
        setNoteOpen(true);
      }
      setQuery('');
      setOpen(false);
      return;
    }

    if (suggestion.kind === 'calculation' || suggestion.kind === 'conversion') {
      const value = suggestion.label.split('= ')[1] ?? '';
      setQuery(value);
      return;
    }

    setQuery(suggestion.label);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (open && suggestions.length > 0) {
      choose(suggestions[Math.min(selected, suggestions.length - 1)]);
      return;
    }

    if (!customTemplate && settings.searchEngine === 'custom') {
      openSettings();
      return;
    }

    const url = searchUrlFor(settings.searchEngine, trimmed, settings.customSearchUrl);
    if (settings.searchInNewTab) window.open(url, '_blank', 'noopener,noreferrer');
    else window.location.assign(url);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) {
      if (event.key === 'ArrowDown' && suggestions.length > 0) setOpen(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((value) => (value + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((value) => (value - 1 + suggestions.length) % suggestions.length);
    }
  };

  const calculation = evaluateExpression(query);
  const conversion = convertUnits(query);

  return (
    <WidgetCard title="Search">
      <form className="search" onSubmit={handleSubmit} role="search">
        <div className="search__form">
          <span className="search__icon" aria-hidden="true">
            <SearchIcon size={19} />
          </span>
          <label className="visually-hidden" htmlFor="luma-search">
            Search the web, your dashboard or run a command
          </label>
          <input
            ref={inputRef}
            id="luma-search"
            className="search__input"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${engine.label === 'Custom engine' ? 'the web' : engine.label} or type a command`}
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={open && suggestions.length > 0}
            aria-controls="luma-search-suggestions"
            aria-autocomplete="list"
          />
          <Button type="submit" variant="primary" disabled={query.trim().length === 0}>
            Search
          </Button>
        </div>
      </form>

      {open && query.trim() ? (
        <div className="search-panel" id="luma-search-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.length === 0 ? (
            <p className="search-panel__empty">
              {calculation
                ? `${query.trim()} = ${calculation}`
                : conversion
                  ? `${query.trim()} = ${conversion}`
                  : `Search ${engine.label} for “${query.trim()}”`}
            </p>
          ) : (
            <ul className="suggestion-list">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === selected}
                    className={`suggestion${index === selected ? ' suggestion--active' : ''}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      choose(suggestion);
                    }}
                  >
                    <span className="suggestion__label">{suggestion.label}</span>
                    <span className="suggestion__detail">{suggestion.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="search-panel__note">
            Local results come from your dashboard and browser. Definitions, translations, quick
            facts and AI answers need a connected service — none is connected yet.
          </p>
        </div>
      ) : null}

      <div className="search__hint">
        <label className="visually-hidden" htmlFor="luma-search-engine">
          Search engine
        </label>
        <IconButton
          label="Search settings"
          onClick={openSettings}
        >
          <SearchIcon size={14} />
        </IconButton>
        <select
          id="luma-search-engine"
          className="search__engine-select"
          value={settings.searchEngine}
          onChange={(event) =>
            dispatch({
              type: 'settings/patch',
              patch: { searchEngine: event.target.value as typeof settings.searchEngine },
            })
          }
        >
          {SEARCH_ENGINES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
        <span className="search__hint-text">
          {settings.searchEngine === 'custom' && !customTemplate
            ? 'Add a valid custom search URL in Appearance settings.'
            : `Enter to search · results open ${settings.searchInNewTab ? 'in a new tab' : 'here'}`}
        </span>
      </div>

      <NoteDialog open={noteOpen} note={note} onClose={() => setNoteOpen(false)} />
    </WidgetCard>
  );
}
