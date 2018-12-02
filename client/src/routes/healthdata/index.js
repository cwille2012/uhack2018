import React from 'react';
import { Card, Heading } from '@8base/boost';

import { PropertyCreateDialog } from './PropertyCreateDialog';
import { PropertyEditDialog } from './PropertyEditDialog';
import { PropertyShareDialog } from './PropertyShareDialog';
import { PropertyDeleteDialog } from './PropertyDeleteDialog';
import { HealthDataTable } from './HealthDataTable';

const healthdata = () => (
  <Card.Plate padding="md" stretch>
    <Card.Header>
      <Heading type="h4" text="Health Data" />
    </Card.Header>

    <PropertyCreateDialog />
    <PropertyEditDialog />
    <PropertyShareDialog />
    <PropertyDeleteDialog />

    <Card.Body padding="none" stretch>
      <HealthDataTable />
    </Card.Body>
  </Card.Plate>
);

export { healthdata };
