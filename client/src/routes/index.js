import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { MainPlate, ContentPlate, Nav } from '../components';
import { ProtectedRoute } from '../shared/components';
import { Auth } from './auth';
import { Properties } from './properties';
import { healthdata } from './healthdata';
import { map } from './map';

export const Routes = () => (
  <Switch>
  <Route path="/auth" component={Auth} />
  <Route>
    <MainPlate>
      <Nav.Plate color="BLUE">
        <Nav.Item icon="Home" to="/healthdata" label="Health Data" />
        <Nav.Item icon="MapPin" to="/map" label="Map View" />
        <Nav.Item icon="Gear" to="/properties" label="Settings" />
      </Nav.Plate>
      <ContentPlate>
        <Switch>
          <ProtectedRoute exact path="/" component={healthdata} />
          <ProtectedRoute exact path="/properties" component={Properties} />
          <ProtectedRoute exact path="/healthdata" component={healthdata} />
          <ProtectedRoute exact path="/map" component={map} />
          <Redirect to="/" />
        </Switch>
      </ContentPlate>
    </MainPlate>
  </Route>
</Switch>
)