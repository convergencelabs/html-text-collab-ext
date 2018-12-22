## HTML Text Collaborative Extensions
[![Build Status](https://travis-ci.org/convergencelabs/html-text-collab-ext.svg?branch=master)](https://travis-ci.org/convergencelabs/html-text-collab-ext)

A set of utilities that enables real time collaboration within normal HTML Text Elements.

## Installation

Install package with NPM and add it to your development dependencies:

```npm install --save-dev @convergence/html-text-collab-ext```

## Usage

### HTML
```html
<html>
  <body>
    <textarea id="example"></textarea>
  </body>
</html>
```

### CollaborativeSelectionManager
The CollaborativeSelectionManager class allows the consumer to render remote cursors and selections within a text control.


```javascript
const textarea = document.getElementById("example");
const selectionManager = new HtmlTextCollabExt.CollaborativeSelectionManager(textarea);

const collaborator = selectionManager.createCollaborator("test", "Test User", "red", {anchor: 10, target: 20});

collaborator.setSelection({anchor: 5, target: 10});

collaborator.flashCursorToolTip(2);

selectionManager.removeCollaborator("test");
```

### TextInputManager
A utility to help to get granular text editing events and to inject remote events without disrupting local operations.

```javascript
const textarea = document.getElementById("example");
const inputManager = new HtmlTextCollabExt.TextInputManager({
  constrol: textarea,
  onInsert: (index, value) => console.log("Text Inserted: ", index, value);
  onDelete: (index, length) => console.log("Text Deleted: ", index, value);
});

inputManager.insertText(4, "test");

inputManager.deleteText(4, 5);

inputManager.setText("new text");
```
