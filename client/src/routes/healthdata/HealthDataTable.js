import React from 'react';
import { compose } from 'recompose';
import * as R from 'ramda';
import { Table, Button, Dropdown, Icon, Menu, withModal } from '@8base/boost';
import { graphql } from 'react-apollo';
import { DateTime } from 'luxon';
import gql from 'graphql-tag';

import { PropertyCreateDialog } from './PropertyCreateDialog';
import { PropertyEditDialog } from './PropertyEditDialog';
import { PropertyDeleteDialog } from './PropertyDeleteDialog';
import { PropertyShareDialog } from './PropertyShareDialog';

let HealthDataTable = ({ records, openModal, closeModal }) => (
  <Table.Plate>
    <Table.Header columns="repeat(10, 1fr) 60px">
      <Table.HeaderCell>id</Table.HeaderCell>
      <Table.HeaderCell>lon</Table.HeaderCell>
      <Table.HeaderCell>lat</Table.HeaderCell>
      <Table.HeaderCell>speed</Table.HeaderCell>
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
              { record.lon }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.lat }
            </Table.BodyCell>
            <Table.BodyCell>
              { record.speed }
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
                        <Menu.Item onClick={ () => { openModal(PropertyEditDialog.id, { initialValues: record }); closeDropdown(); } }>Edit</Menu.Item>
                        <Menu.Item onClick={ () => { openModal(PropertyShareDialog.id, { id: record.id }); closeDropdown(); } }>Share</Menu.Item>
                        <Menu.Item onClick={ () => { openModal(PropertyDeleteDialog.id, { id: record.id }); closeDropdown(); } }>Delete</Menu.Item>
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
    <Table.Footer justifyContent="center">
      <Button onClick={ () => openModal(PropertyCreateDialog.id) }>Create Property</Button>
    </Table.Footer>
  </Table.Plate>
);

const PROPERTIES_LIST_QUERY = gql`
query HealthRecord {
    healthDataList {
        items {
            id
            lon
            lat
            speed
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
