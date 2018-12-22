// @ts-ignore
import StringChangeDetector from "@convergence/string-change-detector";

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
    const xStart = TextInputManager._transformIndexOnInsert(start, index, value);
    const xEnd = TextInputManager._transformIndexOnInsert(end, index, value);
    this._changeDetector.insertText(index, value);
    this._updateControl();
    this._setTextSelection(xStart, xEnd);
  }

  deleteText(index: number, length: number) {
    this._assertBound();
    const {start, end} = this._getSelection();
    const xStart = TextInputManager._transformIndexOnDelete(start, index, length);
    const xEnd = TextInputManager._transformIndexOnDelete(end, index, length);
    this._changeDetector.removeText(index, length);
    this._updateControl();
    this._setTextSelection(xStart, xEnd);
  }

  setText(value: string) {
    this._assertBound();
    this._changeDetector.setValue(value);
    this._updateControl();
    this._setTextSelection(0, 0);
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
    this._control.focus();
    this._control.setSelectionRange(start, end);
  }

  private static _transformIndexOnInsert(index: number, insertIndex: number, value: string): number {
      if (insertIndex <= index) {
        return index + value.length;
      }
      return index;
  }

  private static _transformIndexOnDelete(index: number, deleteIndex: number, length: number): number {
    if (index > deleteIndex) {
      return index - Math.min(index - deleteIndex, length);
    }
    return index;
  }
}
