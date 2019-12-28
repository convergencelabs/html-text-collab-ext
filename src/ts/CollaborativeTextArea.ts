/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import {CollaborativeSelectionManager} from "./CollaborativeSelectionManager";
import {TextInputManager} from "./TextInputManager";
import {ISelectionRange} from "./ISelectionRange";
import {ICollaborativeTextAreaOptions} from "./ICollaboratieTextAreaOptions";


/**
 * Adapts a plain HTMLTextAreaElement to add collaborative editing
 * capabilities. This class will add an overlay HTMLDivElement on
 * top of the HTMLTextAreaElement to render cursors and selection
 * of collaborators. This class also adds convenience API to
 * mutate the text area value and to get events / callbacks when
 * the value is changed by the user. Mutation methods and mutation
 * events are granular describing exactly how the value was changed.
 */
export class CollaborativeTextArea {
  private readonly _selectionManager: CollaborativeSelectionManager;
  private readonly _inputManager: TextInputManager;

  /**
   * Creates a new [[CollaborativeTextArea]].
   *
   * @param options The options to configure this instance.
   */
  constructor(options: ICollaborativeTextAreaOptions) {
    if (!options) {
      throw new Error("options must be defined.");
    }

    if (!options.control) {
      throw new Error("options.control must be defined.");
    }

    const control = options.control;
    const insertCallback = options.onInsert;
    const deleteCallback = options.onDelete;

    const onInsert = (index: number, value: string) => {
      this._selectionManager.updateSelectionsOnInsert(index, value);
      if (insertCallback) {
        insertCallback(index, value);
      }
    };

    const onDelete = (index: number, length: number) => {
      this._selectionManager.updateSelectionsOnDelete(index, length);
      if (deleteCallback) {
        deleteCallback(index, length);
      }
    };

    const onSelectionChanged = options.onSelectionChanged !== undefined ?
      options.onSelectionChanged : (_: ISelectionRange) => {
        // No-op
      };

    this._inputManager = new TextInputManager({control, onInsert, onDelete});
    this._selectionManager = new CollaborativeSelectionManager({control, onSelectionChanged});
  }

  /**
   * Inserts text into the textarea.
   *
   * @param index The index at which to insert the text.
   * @param value The text to insert.
   */
  public insertText(index: number, value: string): void {
    this._inputManager.insertText(index, value);
    this._selectionManager.updateSelectionsOnInsert(index, value);
  }

  /**
   * Deletes text from the textarea.
   * @param index The index at which to remove text.
   * @param length The number of characters to remove.
   */
  public deleteText(index: number, length: number): void {
    this._inputManager.deleteText(index, length);
    this._selectionManager.updateSelectionsOnDelete(index, length);
  }

  /**
   * Sets the entire value of the textarea.
   *
   * @param value The value to set.
   */
  public setText(value: string): void {
    this._inputManager.setText(value);
  }

  /**
   * Gets the current text of the textarea.
   */
  public getText(): string {
    return this._inputManager.getText();
  }

  /**
   * Gets the selection manager that controls local and collaborator
   * selections.
   */
  public selectionManager(): CollaborativeSelectionManager {
    return this._selectionManager;
  }

  /**
   * Indicates that the textarea has been resized and the collaboration
   * overlay should be resized to match.
   */
  public onResize(): void {
    this._selectionManager.onResize();
  }
}