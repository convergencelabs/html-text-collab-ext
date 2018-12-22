import {ISelectionRange} from "./ISelectionRange";
import {ISelectionRow} from "./ISelectionRow";
import {SelectionComputer} from "./SelectionComputer";

// @ts-ignore
import getCaretCoordinates from "textarea-caret";

interface ISelectionData {
  element: HTMLDivElement;
  rowData: ISelectionRow;
}

export interface ICollaboratorSelectionOptions {
  margin?: number;
}

export class CollaboratorSelection {
  private readonly _rows: ISelectionData[];
  private readonly _cursorElement: HTMLDivElement;
  private readonly _tooltipElement: HTMLDivElement;
  private readonly _textInput: HTMLTextAreaElement;
  private readonly _container: HTMLDivElement;

  private _color: string;
  private _selection: { start: number, end: number } | null;
  private _cursor: number | null;
  private _label: string;
  private readonly _margin: number;
  private _tooltipTimeout: any;

  constructor(
    textInput: HTMLTextAreaElement,
    overlayContainer: HTMLDivElement,
    color: string,
    label: string,
    options: ICollaboratorSelectionOptions) {
    this._label = label;
    this._textInput = textInput;
    this._color = color;
    this._cursor = null;
    this._selection = null;
    this._rows = [];
    this._container = overlayContainer;

    options = options || {};

    this._margin = options.margin || 5;

    this._tooltipTimeout = null;

    this._cursorElement = this._container.ownerDocument.createElement("div");
    this._cursorElement.className = "collaborator-cursor";
    this._cursorElement.style.backgroundColor = this._color;

    this._tooltipElement = this._container.ownerDocument.createElement("div");
    this._tooltipElement.innerHTML = label;
    this._tooltipElement.className = "collaborator-cursor-tooltip";
    this._tooltipElement.style.backgroundColor = this._color;

    this.hideCursorTooltip();

    this.refresh();
  }

  public showSelection(): void {
    this._rows.forEach(row => {
      row.element.style.visibility = "visible";
    });
  }

  public hideSelection(): void {
    this._rows.forEach(row => {
      row.element.style.visibility = "hidden";
    });
  }

  public showCursor(): void {
    this._cursorElement.style.visibility = "visible";
  }

  public hideCursor(): void {
    this._cursorElement.style.visibility = "hidden";
  }

  public showCursorToolTip(): void {
    this._clearToolTipTimeout();
    this._tooltipElement.style.opacity = "1";
  }

  public flashCursorToolTip(duration: number): void {
    this.showCursorToolTip();
    this._clearToolTipTimeout();
    this._tooltipTimeout = setTimeout(() => this.hideCursorTooltip(), duration * 1000);
  }

  public hideCursorTooltip(): void {
    this._clearToolTipTimeout();
    this._tooltipElement.style.opacity = "0";
  }

  private _clearToolTipTimeout(): void {
    if (this._tooltipTimeout !== null) {
      clearTimeout(this._tooltipTimeout);
      this._tooltipTimeout = null;
    }
  }

  public setColor(color: string): void {
    this._color = color;
    this._rows.forEach(row => {
      row.element.style.background = this._color;
    });

    this._cursorElement.style.background = this._color;
    this._tooltipElement.style.background = this._color;
  }

  public setSelection(selection: ISelectionRange | null): void {

    if (selection === null) {
      this._cursor = null;
      this._selection = null;
    } else {
      this._cursor = selection.target;

      const start = Number(selection.anchor);
      const end = Number(selection.target);

      if (start > end) {
        this._selection = {start: end, end: start};
      } else {
        this._selection = {start: start, end: end};
      }

      this.refresh();
    }
  }

  public clearSelection(): void {
    this.setSelection(null);
  }

  public refresh(): void {
    this._updateCursor();
    this._updateSelection();
  }

  private _updateCursor(): void {
    if (this._cursor === null && this._container.contains(this._cursorElement)) {
      this._container.removeChild(this._cursorElement);
      this._container.removeChild(this._tooltipElement);
    } else {
      if (!this._cursorElement.parentElement) {
        this._container.append(this._cursorElement);
        this._container.append(this._tooltipElement);
      }

      const cursorCoords = getCaretCoordinates(this._textInput, this._cursor);

      this._cursorElement.style.height = cursorCoords.height + "px";
      this._cursorElement.style.top = cursorCoords.top + "px";
      const cursorLeft = (cursorCoords.left - this._cursorElement.offsetWidth / 2);
      this._cursorElement.style.left = cursorLeft + "px";

      let toolTipTop = cursorCoords.top - this._tooltipElement.offsetHeight;
      if (toolTipTop + this._container.offsetTop < this._margin) {
        toolTipTop = cursorCoords.top + cursorCoords.height;
      }

      let toolTipLeft = cursorLeft;
      if (toolTipLeft + this._tooltipElement.offsetWidth > this._container.offsetWidth - this._margin) {
        toolTipLeft = cursorLeft + this._cursorElement.offsetWidth - this._tooltipElement.offsetWidth;
      }

      this._tooltipElement.style.top = toolTipTop + "px";
      this._tooltipElement.style.left = toolTipLeft + "px";
    }
  }

  private _updateSelection(): void {
    if (this._selection === null) {
      this._rows.forEach(row => row.element.parentElement.removeChild(row.element));
      this._rows.splice(0, this._rows.length);
    } else {
      const newRows = SelectionComputer.calculateSelection(this._textInput, this._selection.start, this._selection.end);

      // Adjust size of rows as needed
      const delta = newRows.length - this._rows.length;

      if (delta > 0) {
        if (this._rows.length === 0 || this._rowsEqual(newRows[0], this._rows[0].rowData)) {
          this._addNewRows(delta, true);
        } else {
          this._addNewRows(delta, false);
        }
      } else if (delta < 0) {
        let removed = null;
        if (this._rowsEqual(newRows[0], this._rows[0].rowData)) {
          // Take from the target.
          removed = this._rows.splice(this._rows.length - 1 + delta, delta * -1);
        } else {
          removed = this._rows.splice(0, delta * -1);
        }

        removed.forEach(row => row.element.parentElement.removeChild(row.element));
      }

      // Now compare each row and see if we need an update.
      newRows.forEach((newRowData: ISelectionRow, index: number) => {
        const row = this._rows[index];
        this._updateRow(newRowData, row);
      });
    }
  }

  private _addNewRows(count: number, append: boolean): void {
    for (let i = 0; i < count; i++) {
      const element = this._container.ownerDocument.createElement("div");
      element.style.position = "absolute";
      element.style.backgroundColor = this._color;
      element.style.opacity = "0.25";
      this._container.append(element);
      const rowData = {height: 0, width: 0, top: 0, left: 0};
      const newRow: ISelectionData = {
        element,
        rowData
      };

      if (append) {
        this._rows.push(newRow);
      } else {
        this._rows.unshift(newRow);
      }
    }
  }

  private _rowsEqual(a: ISelectionRow, b: ISelectionRow): boolean {
    return a.height === b.height &&
      a.width === b.width &&
      a.top === b.top &&
      a.left === b.left;
  }

  private _updateRow(newRowData: ISelectionRow, row: ISelectionData): void {
    if (newRowData.height !== row.rowData.height) {
      row.rowData.height = newRowData.height;
      row.element.style.height = `${newRowData.height}px`;
    }

    if (newRowData.width !== row.rowData.width) {
      row.rowData.width = newRowData.width;
      row.element.style.width = `${newRowData.width}px`;
    }

    if (newRowData.top !== row.rowData.top) {
      row.rowData.top = newRowData.top;
      row.element.style.top = `${newRowData.top}px`;
    }

    if (newRowData.left !== row.rowData.left) {
      row.rowData.left = newRowData.left;
      row.element.style.left = `${newRowData.left}px`;
    }
  }
}