/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

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

  public insertText(index: number, value: string): void {
    this._inputManager.insertText(index, value);
    this._selectionManager.updateSelectionsOnInsert(index, value);
  }

  public deleteText(index: number, length: number): void {
    this._inputManager.deleteText(index, length);
    this._selectionManager.updateSelectionsOnDelete(index, length);
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