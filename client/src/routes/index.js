import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { MainPlate, ContentPlate, Nav } from '../components';
import { ProtectedRoute } from '../shared/components';
import { Auth } from './auth';
import { Properties } from './properties';
import { healthdata } from './healthdata';
import { map } from './map';
import { line } from './line';

export const Routes = () => (
  <Switch>
  <Route path="/auth" component={Auth} />
  <Route>
    <MainPlate>
      <Nav.Plate color="BLUE">
        <Nav.Item icon="Home" to="/healthdata" label="Health Data" />
        <Nav.Item icon="Planet" to="/map" label="3D Map" />
        <Nav.Item icon="MapPin" to="/line" label="Point Map" />
        <Nav.Item icon="Gear" to="/properties" label="Settings" />
      </Nav.Plate>
      <ContentPlate>
        <Switch>
          <ProtectedRoute exact path="/" component={healthdata} />
          <ProtectedRoute exact path="/properties" component={Properties} />
          <ProtectedRoute exact path="/healthdata" component={healthdata} />
          <ProtectedRoute exact path="/map" component={map} />
          <ProtectedRoute exact path="/line" component={line} />
          <Redirect to="/" />
        </Switch>
      </ContentPlate>
    </MainPlate>
  </Route>
</Switch>
)