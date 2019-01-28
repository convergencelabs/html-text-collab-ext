## HTML Text Collaborative Extensions
[![Build Status](https://travis-ci.org/convergencelabs/html-text-collab-ext.svg?branch=master)](https://travis-ci.org/convergencelabs/html-text-collab-ext)

A set of utilities that enhances a normal HTML `<textarea>` element with collaborative editing capabilities. The enhanced `<textarea>` is able to render the cursor and selection of other collaborators. A tooltip with the collaborator's username can be flashed when remote edits are made. The utility also allows for non-disruptive modification of the `<textarea>` where the local user's selection and cursor are not impacted by changes to the `<textarea>`contents.

# Demo
The animation below shows the basic functionality provided by this library.

![demo graphic](./assets/shared-cursors-and-selections.gif "Shared Cursors and Selections")

You can see a live demo [here](https://examples.convergence.io/collaborative-textarea/) ([Convergence](https://convergence.io) does the real-time sync).  The code for it can be found [here](https://github.com/convergencelabs/javascript-examples/tree/master/src/collaborative-textarea).


## Installation

Install package with NPM and add it to your development dependencies:

```npm install --save-dev @convergence/html-text-collab-ext```

## Example Usage

### HTML
```html
<html>
  <body>
    <textarea id="example">
    Some example text to edit.
    </textarea>
  </body>
</html>
```

### JavaScript
```javascript
const textarea = document.getElementById("example");
const textEditor = new HtmlTextCollabExt.CollaborativeTextEditor({
  control: textarea,
  onInsert: (index, value) => console.log(`"${value}" was inserted at index ${index}`,
  onDelete: (index, length) => console.log(`"${length}" characters were deleted at index ${index}`,
  onSelectionChanged: (selection) => console.log(`selection was changed to ${JSON.stringify(selection)}`)
}

//
// Selection Management
//
const selectionManager = textEditor.selectionManager();

const collaborator = selectionManager.createCollaborator(
  "test", "Test User", "red", {anchor: 10, target: 20});
collaborator.setSelection({anchor: 5, target: 10});
collaborator.flashCursorToolTip(2);

selectionManager.removeCollaborator("test");

//
// Text Modification
//

// Insert text at index 10
textEditor.insertText(10, "Inserted Text");

// Delete 5 charachters at index 10
textEditor.deleteText(10, 5);

// Set the entire value.
textEditor.setText("New textarea value");
```

## Development

- Use `npm install` to install requried dependencies.
- Use `npm run dist` to build the distribution package.
- Use `npm start` to start the example application.

