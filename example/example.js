const textarea1 = $("#textarea1")[0];
textarea1.value = TEXT_DATA;
textarea1.selectionStart = 0;
textarea1.selectionEnd = 0;

const textarea2 = $("#textarea2")[0];
textarea2.value = TEXT_DATA;
textarea2.selectionStart = 0;
textarea2.selectionEnd = 0;

const editor1 = new HtmlTextCollabExt.CollaborativeTextEditor({
  control: textarea1,
  onInsert: (index, value) => {
    editor2.insertText(index, value);
  },
  onDelete: (index, length) => {
    editor2.deleteText(index, length);
  },
  onSelectionChanged: (selection) => {
    collaborator1.setSelection(selection);
    collaborator1.flashCursorToolTip(2);
  }
});

const editor2 = new HtmlTextCollabExt.CollaborativeTextEditor({
  control: textarea2,
  onInsert: (index, value) => {
    editor1.insertText(index, value);
  },
  onDelete: (index, length) => {
    editor1.deleteText(index, length);
  },
  onSelectionChanged: (selection) => {
    collaborator2.setSelection(selection);
    collaborator2.flashCursorToolTip(2);
  }
});

const collaborator2 = editor1.selectionManager().addCollaborator("user2", "User 2", "blue");
const collaborator1 = editor2.selectionManager().addCollaborator("user1", "User 1", "red");