# MurTree Component

**MurTree** is a versatile JavaScript select tree component designed for various selection needs, from simple single selection to complex hierarchical tree structures. It supports customization, extensibility, and interactive features like search, placeholders, and integration with external APIs.

---

## Table of Contents

- [MurTree Component](#murtree-component)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Initialization](#initialization)
  - [Options](#options)
    - [General Options](#general-options)
    - [Tree Behavior](#tree-behavior)
    - [Search and Filtering](#search-and-filtering)
    - [Buttons and Actions](#buttons-and-actions)
    - [API Integration](#api-integration)
    - [Event Callbacks](#event-callbacks)
  - [Methods](#methods)
    - [Usage Examples for Methods](#usage-examples-for-methods)
  - [Example Usage](#example-usage)
  - [Advanced Customization](#advanced-customization)
    - [Filtering Data](#filtering-data)
    - [Buttons](#buttons)
  - [FAQs](#faqs)
    - [1. How do I disable specific nodes?](#1-how-do-i-disable-specific-nodes)
    - [2. How can I localize the component?](#2-how-can-i-localize-the-component)
    - [3. Can I dynamically filter API response data?](#3-can-i-dynamically-filter-api-response-data)

---

## Installation

To include **MurTree** in your project:

1. Download the `MurTree` script and CSS file.
2. Add the following lines to your HTML file:

```html
<link rel="stylesheet" href="path/to/murTree.css">
<script src="path/to/murTree.js"></script>
```

## Initialization

To initialize the **MurTree** component, create a new instance of the `MurTree` class and pass the required configuration options as an object. At a minimum, you must specify the `targetElementId` where the component will be rendered.

```javascript
const MurTreeInstance = new MurTree({
    targetElementId: 'uniqueElementId', // Replace with the actual target element ID
    mode: 'singleSelect', // Selection mode
    lang: 'en', // Language
    // Add additional options as needed
});
```

## Options

MurTree supports the following configuration options:

### General Options

| Option                | Type       | Default  | Description                                                                                           |
|-----------------------|------------|----------|-------------------------------------------------------------------------------------------------------|
| `targetElementId`     | `string`   | `null`   | The ID of the element where the component will be rendered. **Required**.                            |
| `mode`                | `string`   | `null`   | Selection mode: `singleSelect`, `multiSelect`, `tree`, `singleSelectableTree`, or `multiSelectableTree`. |
| `lang`                | `string`   | `'en'`   | Language for localization. Supported values: `'tr'`, `'en'`, `'ar'`, `'de'`, `'uz-ki'`, `'uz-la'`, `'ru'`. |
| `placeHolder`         | `string`   | `null`   | Placeholder text displayed in the component.                                                         |
| `inputName`           | `string`   | `null`   | The name for the input field, useful for form submission.                                             |

---

### Tree Behavior

| Option                | Type       | Default  | Description                                                                                           |
|-----------------------|------------|----------|-------------------------------------------------------------------------------------------------------|
| `openAll`             | `boolean`  | `false`  | Expands all nodes when the tree is rendered.                                                         |
| `checkedValues`       | `array`    | `[]`     | Preselected values in the tree.                                                                      |
| `disabledValues`      | `array`    | `[]`     | Values to disable in the tree.                                                                       |
| `notShowDsbldCheckbox`| `boolean`  | `false`  | Hides checkboxes for disabled items when set to `true`.                                              |
| `noDataIcon`          | `boolean`  | `false`  | Displays an icon when no data is available.                                                          |

---

### Search and Filtering

| Option                | Type       | Default  | Description                                                                                           |
|-----------------------|------------|----------|-------------------------------------------------------------------------------------------------------|
| `searchInput`         | `boolean`  | `false`  | Enables a search bar to filter tree nodes.                                                           |
| `getValues`           | `string`   | `'onlyChecked'` | Determines the type of data to return:                                                               |
|                       |            |          | - `onlyChecked`: Returns only selected values.                                                       |
|                       |            |          | - `withChildren`: Returns selected values and their children.                                        |
|                       |            |          | - `withCheckedChildren`: Returns selected values and their children, marking checked children.       |
| `responseFilter`      | `function` | `null`   | A custom filter for processing API response data.                                                    |

---

### Buttons and Actions

| Option                | Type       | Default  | Description                                                                                           |
|-----------------------|------------|----------|-------------------------------------------------------------------------------------------------------|
| `show`                | `object`   | `null`   | Adds a **Show** button. Executes the specified function with the given data columns.                 |
| `edit`                | `object`   | `null`   | Adds an **Edit** button. Executes the specified function with the given data columns.                |
| `delete`              | `object`   | `null`   | Adds a **Delete** button. Executes the specified function with the given data columns.               |

---

### API Integration

| Option                | Type       | Default  | Description                                                                                           |
|-----------------------|------------|----------|-------------------------------------------------------------------------------------------------------|
| `dataRequest`         | `object`   | `null`   | Configuration for fetching data from an API:                                                         |
|                       |            |          | - `url`: The endpoint for the API request.                                                           |
|                       |            |          | - `method`: HTTP method (`GET`, `POST`, etc.).                                                       |
|                       |            |          | - `data`: Request payload.                                                                           |
| `columnDefs`          | `object`   | `null`   | Defines tree data structure:                                                                         |
|                       |            |          | - `id`: Unique identifier for nodes.                                                                |
|                       |            |          | - `name`: Array of column names for display.                                                        |
|                       |            |          | - `dataType`: Tree structure type (`allTogether` or `intertwined`).                                  |
|                       |            |          | - `dataConnection`: Defines parent-child relationships.                                              |

---

### Event Callbacks

| Option                | Type       | Description                                                                                           |
|-----------------------|------------|-------------------------------------------------------------------------------------------------------|
| `onSelect`            | `function` | Callback executed when an item is selected. Receives selected values.                                |
| `unSelected`          | `function` | Callback executed when an item is deselected. Receives current values.                               |

---

By configuring these options, you can fully customize the behavior and appearance of the **MurTree** component.

## Methods

MurTree provides the following utility methods for interacting with the component:

| Method                          | Description                                                                                                         |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `isNull()`                      | Checks if any data is selected. Returns `true` if no data is selected, otherwise returns `false`.                   |
| `isInvalid()`                   | Checks if the current state is invalid. Returns `true` if invalid, otherwise returns `false`.                       |
| `changeInvalidState(state)`     | Manually sets the validity state. Accepts a boolean (`true` for invalid, `false` for valid).                         |
| `reload()`                      | Reloads the component and refreshes the tree data.                                                                 |
| `getSelectedValues()`           | Returns the currently selected values as an array.                                                                 |

### Usage Examples for Methods

```javascript
// Check if no data is selected
console.log(MurTreeInstance.isNull()); // true or false

// Check if the component is in an invalid state
console.log(MurTreeInstance.isInvalid()); // true or false

// Change the invalid state manually
MurTreeInstance.changeInvalidState(true); // Set the state to invalid

// Reload the component data
MurTreeInstance.reload();

// Get the selected values
const selectedValues = MurTreeInstance.getSelectedValues();
console.log(selectedValues); // Array of selected values
```


---

## Example Usage

Here’s an example configuration to demonstrate the flexibility of the MurTree component:

```javascript
const MurTreeInstance = new MurTree({
    targetElementId: 'treeContainer', // ID of the target element
    mode: 'multiSelectableTree',     // Mode of the component
    openAll: true,                   // Expand all tree nodes by default
    searchInput: true,               // Enable search bar
    placeHolder: 'Please select an item', // Placeholder text
    checkedValues: [1, 2],           // Preselect items with IDs 1 and 2
    disabledValues: [3],             // Disable the item with ID 3
    dataRequest: {
        url: '/api/get-tree-data',   // API endpoint to fetch tree data
        method: 'GET',               // HTTP method
        data: { parentId: 0 }        // Payload for the API request
    },
    columnDefs: {
        id: 'id',                    // ID column name
        name: ['label', 'altLabel'], // Display names
        dataType: 'intertwined',     // Data type for hierarchical connection
        dataConnection: 'children'   // Key for nested children
    },
    onSelect: function(selectedVals) {
        console.log('Selected Values:', selectedVals); // Log selected values
    },
    responseFilter: function(response) {
        return response.filter(item => item.id !== 5); // Filter out items with ID 5
    }
});
```
---


## Advanced Customization

### Filtering Data
You can filter the data received from an API request using the `responseFilter` option. This function takes the response data as input and returns a filtered version of the data.

Example:
```javascript
responseFilter: function(data) {
    return data.filter(item => item.active === true);
}
```

### Buttons
Configure custom buttons with `show`, `edit`, and `delete` options:

Example:
```javascript
show: {
    functionName: 'customShowHandler',
    dataColumn: ['id', 'name']
}
```

---

## FAQs

### 1. How do I disable specific nodes?
To disable specific nodes in the tree, use the `disabledValues` option. Simply provide an array of IDs that should be disabled.

Example:
```javascript
disabledValues: [3, 4]
```

### 2. How can I localize the component?
The lang option lets you set the language for the component. Supported languages include `'tr'`, `'en'`, `'ar'`, `'de'`, `'uz-ki'`, `'uz-la'`, and `'ru'`.

Example:
```javascript
lang: 'tr'
```

### 3. Can I dynamically filter API response data?
Yes, you can use the `responseFilter` option to manipulate API response data before rendering it in the tree.

Example:
```javascript
responseFilter: function(data) {
    return data.filter(item => item.status === 'active');
}
```

---
