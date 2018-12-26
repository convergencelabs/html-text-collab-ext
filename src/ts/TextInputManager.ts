// @ts-ignore
import StringChangeDetector from "@convergence/string-change-detector";
import {IndexUtils} from "./IndexUtils";

export interface ITextInputManagerOptions {
  control: HTMLTextAreaElement;
  onInsert: (index: number, value: string) => void;
  onDelete: (index: number, length: number) => void;
}

export class TextInputManager {

  private readonly _control: HTMLTextAreaElement;
  private readonly _onLocalInsert: (index: number, value: string) => void;
  private readonly _onLocalDelete: (index: number, length: number) => void;
  private _changeDetector: StringChangeDetector;

  /**
   *
   * @param options
   */
  constructor(options: ITextInputManagerOptions) {
    this._control = options.control;
    this._onLocalInsert = options.onInsert;
    this._onLocalDelete = options.onDelete;
    this._changeDetector = null;

    this.bind();
  }

  bind(): void {
    this._changeDetector = new StringChangeDetector({
      value: this._control.value,
      onInsert: this._onLocalInsert,
      onRemove: this._onLocalDelete
    });

    this._control.addEventListener("input", this._onLocalInput);
  }

  unbind(): void {
    this._control.removeEventListener("input", this._onLocalInput);
    this._changeDetector = null;
  }

  insertText(index: number, value: string): void {
    this._assertBound();
    const {start, end} = this._getSelection();
    const xStart = IndexUtils.transformIndexOnInsert(start, index, value);
    const xEnd = IndexUtils.transformIndexOnInsert(end, index, value);
    this._changeDetector.insertText(index, value);
    this._updateControl();
    this._setTextSelection(xStart, xEnd);
  }

  deleteText(index: number, length: number): void {
    this._assertBound();
    const {start, end} = this._getSelection();
    const xStart = IndexUtils.transformIndexOnDelete(start, index, length);
    const xEnd = IndexUtils.transformIndexOnDelete(end, index, length);
    this._changeDetector.removeText(index, length);
    this._updateControl();
    this._setTextSelection(xStart, xEnd);
  }

  setText(value: string): void {
    this._assertBound();
    this._changeDetector.setValue(value);
    this._updateControl();
    this._setTextSelection(0, 0);
  }

  getText(): string {
    return this._control.value;
  }

  private _updateControl(): void {
    this._control.value = this._changeDetector.getValue();
  }

  private _onLocalInput = () => {
    this._changeDetector.processNewValue(this._control.value);
  }

  private _assertBound(): void {
    if (this._changeDetector === null) {
      throw new Error("The TextInputManager is not bound.");
    }
  }

  private _getSelection(): {start: number, end: number} {
    return {'start': this._control.selectionStart, 'end': this._control.selectionEnd};
  }

  private _setTextSelection(start: number, end: number): void {
    // this._control.focus();
    this._control.setSelectionRange(start, end);
  }
}
