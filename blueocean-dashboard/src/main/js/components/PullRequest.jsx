import React, { Component, PropTypes } from 'react';
import { ReadableDate } from '@jenkins-cd/design-language';
import { LiveStatusIndicator, RunButton } from '@jenkins-cd/blueocean-core-js';
import Extensions from '@jenkins-cd/js-extensions';
import { CellRow, CellLink } from './CellLink';
import { buildRunDetailsUrl } from '../util/UrlUtils';
import { buildPipelineUrl } from '../util/UrlUtils';
import { Link } from 'react-router';
import { Icon } from '@jenkins-cd/react-material-icons';

function noRun(pr, openRunDetails, t) {
    return (<tr id={`${name}`}>
                <td></td>
                <td>{pr.pullRequest.id}</td>
                <td>{pr.pullRequest.title || '-'}</td>
                <td>{pr.pullRequest.author || '-'}</td>
                <td></td>
                <td className="actions">
                    <RunButton
                      className="icon-button"
                      runnable={pr}
                      latestRun={pr.latestRun}
                      onNavigation={openRunDetails}
                    />
                    <Extensions.Renderer extensionPoint="jenkins.pipeline.pullrequests.list.action" {...t} />
                </td>
            </tr>);
}
export default class PullRequest extends Component {
    render() {
        const { pr, t, locale, pipeline: contextPipeline } = this.props;
        if (!pr || !pr.pullRequest || !contextPipeline) {
            return null;
        }

        const { router, location } = this.context;

        const openRunDetails = (newUrl) => {
            location.pathname = newUrl;
            router.push(location);
        };

        const { latestRun, pullRequest, name } = pr;

        if (!latestRun) {
            return noRun(pr, openRunDetails, t);
        }

        const result = latestRun.result === 'UNKNOWN' ? latestRun.state : latestRun.result;
        const { fullName, organization } = contextPipeline;
        const runDetailsUrl = buildRunDetailsUrl(organization, fullName, decodeURIComponent(latestRun.pipeline), latestRun.id, 'pipeline');
        const historyButtonUrl = `${buildPipelineUrl(organization, contextPipeline.name)}/activity?branch=${pr.name}`;

        return (
            <CellRow linkUrl={runDetailsUrl} id={`${name}-${latestRun.id}`}>
                <CellLink>
                    <LiveStatusIndicator
                      durationInMillis={latestRun.durationInMillis}
                      result={result}
                      startTime={latestRun.startTime}
                      estimatedDuration={latestRun.estimatedDurationInMillis}
                    />
                </CellLink>
                <CellLink>{pullRequest.id}</CellLink>
                <CellLink>{pullRequest.title || '-'}</CellLink>
                <CellLink>{pullRequest.author || '-'}</CellLink>
                <CellLink>
                    <ReadableDate
                      date={latestRun.endTime}
                      liveUpdate
                      locale={locale}
                      shortFormat={t('common.date.readable.short', { defaultValue: 'MMM DD h:mma Z' })}
                      longFormat={t('common.date.readable.long', { defaultValue: 'MMM DD YYYY h:mma Z' })}
                    />
                </CellLink>
                <td className="actions">

                    <RunButton
                      className="icon-button"
                      runnable={pr}
                      latestRun={pr.latestRun}
                      onNavigation={openRunDetails}
                    />

                    <div className="history-button-component">
                        <Link to={historyButtonUrl} className="materials-icons history-button">
                            <Icon size={24} icon="history" />
                        </Link>
                    </div>

                    <Extensions.Renderer extensionPoint="jenkins.pipeline.pullrequests.list.action" {...t} />
                </td>
            </CellRow>
        );
    }
}

const { func, object, string } = PropTypes;

PullRequest.propTypes = {
    pr: object,
    locale: string,
    t: func,
    pipeline: object,
};

PullRequest.contextTypes = {
    router: object.isRequired, // From react-router
    location: object,
};
