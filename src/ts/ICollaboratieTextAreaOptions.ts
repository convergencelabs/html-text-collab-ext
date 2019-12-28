/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import {ISelectionCallback} from "./CollaborativeSelectionManager";

/**
 * Represents the options that can be passed to the
 * CollaborativeTextArea class.
 */
export interface ICollaborativeTextAreaOptions {
  /**
   * The HTML TextArea to adapt for collaborative editing.
   */
  control: HTMLTextAreaElement;

  /**
   * A callback to call when text is inserted into the textarea.
   *
   * @param index The index at which the text was inserted.
   * @param value The text that was inserted.
   */
  onInsert: (index: number, value: string) => void;

  /**
   * A callback to call when text is removed from the textarea.
   * @param index The index at which the text was removed.
   *
   * @param length The length of the text that was removed.
   */
  onDelete: (index: number, length: number) => void;

  /**
   * A callback that will be called when the local users selection /
   * cursor position has changed.
   */
  onSelectionChanged: ISelectionCallback;
}
