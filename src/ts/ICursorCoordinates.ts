/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

/**
 * Represents the coordinates of the cursor within the textarea.
 */
export interface ICursorCoordinates {
  /**
   * The distance in pixels from the top of the textarea.
   */
  top: number;

  /**
   * The distance in pixels from the left of the textarea.
   */
  left: number;

  /**
   * The height in pixels of the cursor.
   */
  height: number;
}
