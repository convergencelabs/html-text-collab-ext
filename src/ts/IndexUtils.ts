/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

export class IndexUtils {
  public static transformIndexOnInsert(index: number, insertIndex: number, value: string): number {
    if (insertIndex <= index) {
      return index + value.length;
    }
    return index;
  }

  public static transformIndexOnDelete(index: number, deleteIndex: number, length: number): number {
    if (index > deleteIndex) {
      return index - Math.min(index - deleteIndex, length);
    }
    return index;
  }
}