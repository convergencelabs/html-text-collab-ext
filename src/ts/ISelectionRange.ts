/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

/**
 * A selection range describe in the linear index address space of
 * the text in the textarea.
 */
export interface ISelectionRange {
  /**
   * The index of the anchor of the selection.
   */
  anchor: number;

  /**
   * The index of the target of the selection. This is
   * where the cursor will be.
   */
  target: number;
}
