const textarea = $("#textarea");
const length = textarea.val().length;

const collaoratorId = "test";

const collabExt = new HtmlTextCollabExt.CollaborativeSelectionManager(textarea[0]);

const anchor = 40;
const target = 60;
const color = "#ff0000";

const collaborator = collabExt.createCollaborator(collaoratorId, "Test User", color, {anchor: anchor, target: target});

const selectionStartSlider = $("#selectionStartSlider");
const selectionStartVal = $("#selectionStartVal");
const selectionEndSlider = $("#selectionEndSlider");
const selectionEndVal = $("#selectionEndVal");
const collapseButton = $("#collapseButton");

const selectionColor = $("#collaboratorColor");
selectionColor.on("input", e => {
  collaborator.setColor(selectionColor.val());
});

selectionStartSlider.val(anchor);
selectionStartSlider.on("input", () => {
  selectionStartVal.val(selectionStartSlider.val());
  collapse(selectionStartVal.val());
  updateSelection();
});

selectionStartVal.val(anchor);
selectionStartVal.on("input", () => {
  selectionStartSlider.val(selectionStartVal.val());
  collapse(selectionStartVal.val());
  updateSelection();
});

selectionEndSlider.val(target);
selectionEndSlider.on("input", () => {
  selectionEndVal.val(selectionEndSlider.val());
  collapse(selectionEndVal.val());
  updateSelection();
});

selectionEndVal.val(target);
selectionEndVal.on("input", () => {
  selectionEndSlider.val(selectionEndVal.val());
  collapse(selectionEndVal.val());
  updateSelection();
});

collapseButton.on("click", () => {
  collapse(selectionEndVal.val());
  updateSelection();
});

function collapse(value) {
  if (collapseButton[0].checked) {
    selectionEndVal.val(value);
    selectionEndSlider.val(value);
    selectionStartVal.val(value);
    selectionStartSlider.val(value);
  }
}

function updateSelection() {
  selectionEndSlider.attr("max", length);
  selectionEndVal.attr("max", length);
  selectionStartSlider.attr("max", length);
  selectionStartVal.attr("max", length);
  collaborator.setSelection({anchor: selectionStartVal.val(), target: selectionEndVal.val()});
  collaborator.flashCursorToolTip(2);
}

updateSelection();
