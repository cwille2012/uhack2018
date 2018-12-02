import React from 'react';
import * as R from 'ramda';
import { Form, Field } from '@8base/forms';
import { Dialog, Grid, Button, InputField, ModalContext } from '@8base/boost';
import { graphql } from 'react-apollo';

import * as sharedGraphQL from 'shared/graphql';
import { TOAST_SUCCESS_MESSAGE } from 'shared/constants';

const PROPERTY_EDIT_DIALOG_ID = 'PROPERTY_EDIT_DIALOG_ID';

class RecordEditDialog extends React.Component {
  static contextType = ModalContext;

  createOnSubmit = R.memoize((id) => async (data) => {
    await this.props.propertyUpdate({ variables: { data: { ...data, id } }});

    this.context.closeModal(PROPERTY_EDIT_DIALOG_ID);
  });

  onClose = () => {
    this.context.closeModal(PROPERTY_EDIT_DIALOG_ID);
  };

  renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
    <form onSubmit={ handleSubmit }>
      <Dialog.Header title="Edit Record" onClose={ this.onClose } />
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
        <Button color="red" type="submit" text="Update Record" disabled={ pristine || invalid } loading={ submitting } />
      </Dialog.Footer>
    </form>
  );

  renderForm = ({ args }) => {
    return (
      <Form type="UPDATE" tableSchemaName="Health Data" onSubmit={ this.createOnSubmit(args.initialValues.id) } initialValues={ args.initialValues }>
        { this.renderFormContent }
      </Form>
    );
  };

  render() {
    return (
      <Dialog.Plate id={ PROPERTY_EDIT_DIALOG_ID } size="sm">
        { this.renderForm }
      </Dialog.Plate>
    );
  }
}

RecordEditDialog = graphql(sharedGraphQL.PROPERTY_UPDATE_MUTATION, {
  name: 'propertyUpdate',
  options: {
    refetchQueries: ['HealthDataList'],
    context: {
      [TOAST_SUCCESS_MESSAGE]: 'Record successfuly updated'
    },
  },
})(RecordEditDialog);

RecordEditDialog.id = PROPERTY_EDIT_DIALOG_ID;

export { RecordEditDialog };