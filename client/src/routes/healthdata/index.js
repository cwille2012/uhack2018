import React from 'react';
import { Card, Heading } from '@8base/boost';

import { RecordCreateDialog } from './RecordCreateDialog';
import { RecordEditDialog } from './RecordEditDialog';
import { RecordShareDialog } from './RecordShareDialog';
import { RecordDeleteDialog } from './RecordDeleteDialog';
import { HealthDataTable } from './HealthDataTable';

const healthdata = () => (
  <Card.Plate padding="md" stretch>
    <Card.Header>
      <Heading type="h4" text="Health Data" />
    </Card.Header>

    <RecordCreateDialog />
    <RecordEditDialog />
    <RecordShareDialog />
    <RecordDeleteDialog />

    <Card.Body padding="none" stretch>
      <HealthDataTable />
    </Card.Body>
  </Card.Plate>
);

export { healthdata };
