import React from 'react';
import { compose } from 'recompose';
import * as R from 'ramda';
import { Table, Button, Dropdown, Icon, Menu, withModal } from '@8base/boost';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { RecordCreateDialog } from './RecordCreateDialog';
import { RecordEditDialog } from './RecordEditDialog';
import { RecordDeleteDialog } from './RecordDeleteDialog';
import { RecordShareDialog } from './RecordShareDialog';

//https://app.8base.com/data-builder/5c031b039f19e0d850e24fed/schema/new

let HealthDataTable = ({ records, openModal, closeModal }) => (
  <Table.Plate>
    <Table.Header columns="repeat(10, 1fr) 60px">
      <Table.HeaderCell>id</Table.HeaderCell>
      <Table.HeaderCell>time</Table.HeaderCell>
      <Table.HeaderCell>lon</Table.HeaderCell>
      <Table.HeaderCell>lat</Table.HeaderCell>
      <Table.HeaderCell>speed</Table.HeaderCell>
      <Table.HeaderCell>altitude</Table.HeaderCell>
      <Table.HeaderCell>heartRate</Table.HeaderCell>
      <Table.HeaderCell>stepCount</Table.HeaderCell>
      <Table.HeaderCell>distance</Table.HeaderCell>
      <Table.HeaderCell>gender</Table.HeaderCell>
      <Table.HeaderCell />
    </Table.Header>

    <Table.Body loading={ records.loading } data={ R.pathOr([], ['healthDataList', 'items'], records) }>
      {
        (record) => (
          <Table.BodyRow columns="repeat(10, 1fr) 60px" key={ record.id }>
            <Table.BodyCell>
              { record.id }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.time }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.lon }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.lat }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.speed }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.altitude }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.heartRate }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.stepCount }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.distance }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.gender }
            </Table.BodyCell>
            <Table.BodyCell>
              <Dropdown.Plate defaultOpen={ false }>
                <Dropdown.Head>
                  <Icon name="Dots" color="LIGHT_GRAY2" />
                </Dropdown.Head>
                <Dropdown.Body pin="right">
                  {
                    ({ closeDropdown }) => (
                      <Menu.Plate>
                        <Menu.Item onClick={ () => { openModal(RecordEditDialog.id, { initialValues: record }); closeDropdown(); } }>Edit</Menu.Item>
                        <Menu.Item onClick={ () => { openModal(RecordShareDialog.id, { id: record.id }); closeDropdown(); } }>Share</Menu.Item>
                        <Menu.Item onClick={ () => { openModal(RecordDeleteDialog.id, { id: record.id }); closeDropdown(); } }>Delete</Menu.Item>
                      </Menu.Plate>
                    )
                  }
                </Dropdown.Body>
              </Dropdown.Plate>
            </Table.BodyCell>
          </Table.BodyRow>
        )
      }
    </Table.Body>
  </Table.Plate>
);

const PROPERTIES_LIST_QUERY = gql`
query HealthRecord {
    healthDataList {
        items {
            id
            time
            lon
            lat
            speed
            altitude
            heartRate
            stepCount
            distance
            gender
        }
    }
}
`;

  HealthDataTable = compose(
  withModal,
  graphql(PROPERTIES_LIST_QUERY, { name: 'records' }),
)(HealthDataTable);

export { HealthDataTable };
