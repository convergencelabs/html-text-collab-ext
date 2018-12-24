import {CollaborativeSelectionManager, ISelectionCallback} from "./CollaborativeSelectionManager";
import {TextInputManager} from "./TextInputManager";
import {ISelectionRange} from "./ISelectionRange";

export interface ICollaborativeTextAreaOptions {
  control: HTMLTextAreaElement;
  onInsert: (index: number, value: string) => void;
  onDelete: (index: number, length: number) => void;
  onSelectionChanged: ISelectionCallback;
}

export class CollaborativeTextEditor {
  private readonly _selectionManager: CollaborativeSelectionManager;
  private readonly _inputManager: TextInputManager;

  constructor(options: ICollaborativeTextAreaOptions) {
    if (!options) {
      throw new Error("options must be defined.");
    }

    if (!options.control) {
      throw new Error("options.control must be defined.");
    }

    const control = options.control;
    const onInsert = options.onInsert !== undefined ?
      options.onInsert : (index: number, value: string) => {
      };
    const onDelete = options.onDelete !== undefined ?
      options.onDelete : (index: number, length: number) => {
      };
    const onSelectionChanged = options.onSelectionChanged !== undefined ?
      options.onSelectionChanged : (selection: ISelectionRange) => {
      };

    this._inputManager = new TextInputManager({control, onInsert, onDelete});
    this._selectionManager = new CollaborativeSelectionManager({control, onSelectionChanged});
  }

  public insertText(index: number, value: string): void {
    this._inputManager.insertText(index, value);
  }

  public deleteText(index: number, length: number): void {
    this._inputManager.deleteText(index, length);
  }

  public setText(value: string): void {
    this._inputManager.setText(value);
  }

  public getText(): string {
    return this._inputManager.getText();
  }

  public selectionManager(): CollaborativeSelectionManager {
    return this._selectionManager;
  }
}