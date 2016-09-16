import React from "react";
import PropertyForm from "./property-form/property-form";

class CollectionForm extends React.Component {

  render() {
    const { columns, archetypeFields, propertyMappings, customPropertyMappings, collectionName } = this.props;
    const { onRemoveCustomProperty, onSetFieldMapping, onConfirmFieldMappings, onUnconfirmFieldMappings } = this.props;

    const archeTypePropFields = archetypeFields.filter((af) => af.type !== "relation");

    const propertyForms = archeTypePropFields
      .map((af, i) => (
        <PropertyForm columns={columns} custom={false} key={i} name={af.name} type={af.type}
                      propertyMapping={propertyMappings.find((m) => m.property === af.name)}
                      onSetFieldMapping={(field, value) => onSetFieldMapping(collectionName, field, value)}
                      onConfirmFieldMappings={(field) => onConfirmFieldMappings(collectionName, field)}
                      onUnconfirmFieldMappings={(field) => onUnconfirmFieldMappings(collectionName, field)}
        />
      ));

    const customPropertyForms = customPropertyMappings
      .map((customProp, i) => (
        <PropertyForm columns={columns} custom={true} key={i} name={customProp.name} type={customProp.type}
                      propertyMapping={propertyMappings.find((m) => m.property === customProp.name)}
                      onRemoveCustomProperty={(field) => onRemoveCustomProperty(collectionName, field)}
                      onSetFieldMapping={(field, value) => onSetFieldMapping(collectionName, field, value)}
                      onConfirmFieldMappings={(field) => onConfirmFieldMappings(collectionName, field)}
                      onUnconfirmFieldMappings={(field) => onUnconfirmFieldMappings(collectionName, field)}
        />
      ));

    return (
      <div className="container basic-margin">
        {propertyForms}
        {customPropertyForms}
      </div>
    );
  }
}

export default CollectionForm;