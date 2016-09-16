import React from "react";
import { storiesOf, action } from "@kadira/storybook";
import ConnectData from "./connect-data";

const initialData = {
  activeCollection: 'migranten',
  sheets: [
    {
      collection: 'migranten',
      variables: ["ID", "Voornaam", "tussenvoegsel", "Achternaam", "Geboren in"],
      rows: [
        [
          {value: "1"},
          {value: "Hans"},
          {value: ""},
          {value: "Achterberg"},
          {value: "Den Hoorn", error: "niet correct"}
        ]
      ]
    },
    {
      collection: 'locaties',
      variables: ["naam", "land", "opmerkingen"],
      rows: [
        [
          {value: "Den Hoorn"},
          {value: "Nederland"},
          {value: "correct"}
        ]
      ]
    }
  ],
  uploadedFileName: "data.xlsx",
  archetype: {
    persons: [
      {name: "givenName", type: "text"},
      {name: "surname", type: "text"},
      {name: "birthDate", type: "datable"},
      {
        name: "hasDeathPlace",
        type: "relation",
        relation: {
          targetCollection: "locations",
        }
      }, {
        name: "hasSibling",
        type: "relation",
        relation: {
          targetCollection: "persons",
        }
      }, {
        name: "hasFoo",
        type: "relation",
        relation: {
          targetCollection: "fooz",
        }
      }
    ],
    locations: [
      {name: "name", type: "text"},
      {name: "country", type: "text"},
      {
        name: "isDeathPlaceOf",
        type: "relation",
        relation: {
          targetCollection: "persons",
        }
      }, {
        name: "isBirthPlaceOf",
        type: "relation",
        relation: {
          targetCollection: "persons",
        }
      }, {
        name: "hasFoo",
        type: "relation",
        relation: {
          targetCollection: "fooz",
        }
      }
    ]
  },
  mappings: {
    collections: {
      migranten: {
        archetypeName: 'persons',
        mappings: [],
        ignoredColumns: [],
        customProperties: [],
      },
      locaties: {
        archetypeName: 'locations',
        mappings: [{
          property: "name",
          variable: [{variableName: "naam"}],
          confirmed: true
        }, {
          property: "country",
          variable: [{variableName: "land"}],
          confirmed: false
        }, {
          property: "remarks",
          confirmed: false,
          variable: [{variableName: "opmerkingen"}]
        }
        ],
        customProperties: [{
          name: "remarks",
          type: "text"
        }],
        ignoredColumns: []
      }
    }
  }
};

const ignoreLocations = {
  ...initialData,
  mappings: {
    ...initialData.mappings,
    collections: {
      ...initialData.mappings.collections,
      locaties: {
        ...initialData.mappings.collections.locaties,
        ignoredColumns: ["naam", "land", "opmerkingen"],
        mappings: []
      }
    }
  }
};

const locationsActive = {
  ...initialData,
  activeCollection: 'locaties',
};

// Helper function for react-redux connect
function getConfirmedCols(props, variables) {
  const { mappings, activeCollection } = props;

  return variables
    .map((value, i) => ({value: value, index: i}))
    .filter((colSpec) => mappings.collections[activeCollection].mappings
      .filter((m) => m.confirmed)
      .map((m) => m.variable.map((v) => v.variableName))
      .reduce((a, b) => a.concat(b), [])
      .indexOf(colSpec.value) > -1
    ).map((colSpec) => colSpec.index);
}

// Helper function for react-redux connect
function mappingsAreComplete(props, sheet) {
  const { mappings } = props;

  const confirmedColCount = mappings.collections[sheet.collection].mappings
    .filter((m) => m.confirmed)
    .map((m) => m.variable.map((v) => v.variableName))
    .reduce((a, b) => a.concat(b), [])
    .filter((x, idx, self) => self.indexOf(x) === idx)
    .length;

  return confirmedColCount + mappings.collections[sheet.collection].ignoredColumns.length === sheet.variables.length;
}

// Moves to react-redux connect
function transformProps(props) {
  const { sheets, activeCollection, mappings, archetype } = props;
  const collectionData = sheets.find((sheet) => sheet.collection === activeCollection);
  const { rows, variables } = collectionData;


  const confirmedCols = getConfirmedCols(props, variables);
  const { ignoredColumns } = mappings.collections[activeCollection];

  return {
    sheets: sheets,
    activeCollection: activeCollection,
    collectionTabs: sheets.map((sheet) => ({
      collectionName: sheet.collection,
      archetypeName: mappings.collections[sheet.collection].archetypeName,
      active: activeCollection === sheet.collection,
      complete: mappingsAreComplete(props, sheet)
    })),
    rows: rows.map((row) => row.map((cell, i) => ({
      value: cell.value,
      error: cell.error || null,
      ignored: ignoredColumns.indexOf(variables[i]) > -1
    }))),
    headers: variables.map((variable, i) => ({
      name: variable,
      isConfirmed: ignoredColumns.indexOf(i) < 0 && confirmedCols.indexOf(i) > -1,
      isIgnored: ignoredColumns.indexOf(variable) > -1
    })),
    archetypeFields: archetype[mappings.collections[activeCollection].archetypeName],
    availableArchetypes: Object.keys(mappings.collections).map((key) => mappings.collections[key].archetypeName),
    propertyMappings: mappings.collections[activeCollection].mappings,
    customPropertyMappings: mappings.collections[activeCollection].customProperties
  };
}

const actions = {
  onConfirmFieldMappings: action("confirming field mappings"),
  onRemoveCustomProperty: action("removing custom property"),
  onSetFieldMapping: action("setting field mapping"),
  onUnconfirmFieldMappings: action("unconfirming field mappings"),
  onIgnoreColumnToggle: action("toggling ignore on column"),
  onSelectCollection: action("selecting collection"),
  onAddCustomProperty: action("adding custom property"),
  onClearFieldMapping: action("clearing field mapping")
};


storiesOf('Connect data', module)
  .add('initially', () => (
    <ConnectData {...transformProps(initialData)} {...actions} />
  ))
  .add('ignore all location columns', () => (
    <ConnectData {...transformProps(ignoreLocations)} {...actions} />
  ))
  .add('locations is active', () => (
    <ConnectData {...transformProps(locationsActive)} {...actions} />
  ));

