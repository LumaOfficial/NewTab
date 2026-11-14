import { useDashboard } from '../../../state/DashboardProvider';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SparkIcon } from '../../icons';

export function OnboardingSection() {
  const { onboarding, dispatch } = useDashboard();

  return (
    <section className="settings__section" aria-labelledby="settings-onboarding">
      <div>
        <h3 className="settings__section-title" id="settings-onboarding">
          Onboarding
        </h3>
        <p className="settings__section-intro">
          The wizard walks through theme, colour mode, layout, widgets, integrations, search,
          account, sync and your first workspace. Everything it sets can be changed later.
        </p>
      </div>

      <div className="settings__group">
        <div className="setting-row">
          <div className="setting-row__text">
            <span className="setting-row__label">
              <SparkIcon size={14} /> Setup wizard
            </span>
            <span className="setting-row__hint">
              {onboarding.status === 'completed'
                ? 'You finished onboarding. Running it again will not erase your dashboard.'
                : onboarding.status === 'skipped'
                  ? 'You skipped onboarding and started with sensible defaults.'
                  : 'The wizard is waiting for you on the dashboard.'}
            </span>
          </div>
          <Badge muted>{onboarding.status}</Badge>
        </div>

        <div className="button-row">
          <Button
            variant="primary"
            size="sm"
            onClick={() => dispatch({ type: 'onboarding/set', status: 'pending' })}
          >
            {onboarding.status === 'completed' ? 'Run onboarding again' : 'Start onboarding'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'onboarding/set', status: 'skipped' })}
          >
            Dismiss for now
          </Button>
        </div>
        <p className="widget-hint">
          Dismissing only hides the wizard. Your widgets, theme and layout keep working with the
          complete dashboard defaults.
        </p>
      </div>
    </section>
  );
}
