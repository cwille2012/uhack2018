import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { MainPlate, ContentPlate, Nav } from '../components';
import { ProtectedRoute } from '../shared/components';
import { Auth } from './auth';
import { Properties } from './properties';
import { healthdata } from './healthdata';

export const Routes = () => (
  <Switch>
  <Route path="/auth" component={Auth} />
  <Route>
    <MainPlate>
      <Nav.Plate color="BLUE">
        <Nav.Item icon="House" to="/properties" label="Properties" />
      </Nav.Plate>
      <ContentPlate>
        <Switch>
          <ProtectedRoute exact path="/properties" component={Properties} />
          <ProtectedRoute exact path="/healthdata" component={healthdata} />
          <Redirect to="/healthdata" />
        </Switch>
      </ContentPlate>
    </MainPlate>
  </Route>
</Switch>
)