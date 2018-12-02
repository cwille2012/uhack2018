import React from 'react';
import styled from 'react-emotion';
import { matchPath } from 'react-router';
import { withRouter, Link as RouterLink } from 'react-router-dom';
import { Grid, Breadcrumbs as BoostBreadcrumbs, Link } from '@8base/boost';

const BREADCRUMBS_ROUTES = [
  {
    path: '/properties',
    component: () => 'Properties',
    matchOptions: { exact: true },
  },
  {
    path: '/healthdata',
    component: () => 'HealthData',
    matchOptions: { exact: true },
  },
];

const HeaderTag = styled(Grid.Box)({
  paddingLeft: '2rem',
});

const BreadcrumbsItem = props => <Link tagName={RouterLink} color="DARK_GRAY1" size="lg" {...props} />;

let Breadcrumbs = ({ location }) => (
  <HeaderTag area="breadcrumbs" justifyContent="center">
    <BoostBreadcrumbs
      pathname={location.pathname}
      routes={BREADCRUMBS_ROUTES}
      matchPath={matchPath}
      itemTagName={BreadcrumbsItem}
    />
  </HeaderTag>
);

Breadcrumbs = withRouter(Breadcrumbs);

export { Breadcrumbs };
