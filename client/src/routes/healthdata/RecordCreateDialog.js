import React from 'react';
import { Form, Field } from '@8base/forms';
import { Dialog, Grid, Button, InputField, ModalContext } from '@8base/boost';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { TOAST_SUCCESS_MESSAGE } from 'shared/constants';

const PROPERTY_CREATE_DIALOG_ID = 'PROPERTY_CREATE_DIALOG_ID';

class RecordCreateDialog extends React.Component {
  static contextType = ModalContext;

  onSubmit = async (data) => {
    await this.props.propertyCreate({ variables: { data }});

    this.context.closeModal(PROPERTY_CREATE_DIALOG_ID);
  };

  onClose = () => {
    this.context.closeModal(PROPERTY_CREATE_DIALOG_ID);
  };

  renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
    <form onSubmit={ handleSubmit }>
      <Dialog.Header title="New Health Record" onClose={ this.onClose } />
      <Dialog.Body scrollable>
        <Grid.Layout gap="sm" stretch>
          <Grid.Box>
            <Field name="time" label="Time" type="text" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="lat" label="Latitude" type="number" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="lon" label="Longitude" type="number" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="speed" label="Speed" type="number" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="stepCount" label="Step Count" type="number" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="distance" label="Distance" type="number" component={ InputField } />
          </Grid.Box>
          <Grid.Box>
            <Field name="gender" label="Gender" type="text" component={ InputField } />
          </Grid.Box>
        </Grid.Layout>
      </Dialog.Body>
      <Dialog.Footer>
        <Button color="neutral" variant="outlined" disabled={ submitting } onClick={ this.onClose }>Cancel</Button>
        <Button color="red" type="submit" text="Create Property" loading={ submitting } />
      </Dialog.Footer>
    </form>
  );

  render() {
    return (
      <Dialog.Plate id={ PROPERTY_CREATE_DIALOG_ID } size="sm">
        <Form type="CREATE" tableSchemaName="Health Data" onSubmit={ this.onSubmit }>
          { this.renderFormContent }
        </Form>
      </Dialog.Plate>
    );
  }
}

const PROPERTY_CREATE_MUTATION = gql`
mutation HealthDatumCreateMutation($data: HealthDatumCreateInput!) {
  healthDatumCreate(data: $data) {
      id
  }
}`;

RecordCreateDialog = graphql(PROPERTY_CREATE_MUTATION, {
  name: 'propertyCreate',
  options: {
    refetchQueries: ['HealthDataList'],
    context: {
      [TOAST_SUCCESS_MESSAGE]: 'Record successfuly created'
    },
  },
})(RecordCreateDialog);

RecordCreateDialog.id = PROPERTY_CREATE_DIALOG_ID;

export { RecordCreateDialog };