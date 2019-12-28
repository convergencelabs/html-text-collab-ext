/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the HTML Text Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import {ISelectionRange} from "./ISelectionRange";
import {CollaboratorSelection} from "./CollaboratorSelection";
import {IndexUtils} from "./IndexUtils";
import {ICollaborativeSelectionManagerOptions} from "./ICollaborativeSelectionManagerOptions";

export type ISelectionCallback = (selection: ISelectionRange) => void;

/**
 * The CollaborativeSelectionManager controls the monitoring of local selection
 * / cursor positions and renders selections / cursors of collaborators. This
 * class will add an overlay to the DOM on top of the textarea to render
 * collaborators selections.
 */
export class CollaborativeSelectionManager {
  private readonly _collaborators: Map<string, CollaboratorSelection>;
  private readonly _textElement: HTMLTextAreaElement;
  private readonly _overlayContainer: HTMLDivElement;
  private readonly _scroller: HTMLDivElement;
  private readonly _onSelection: ISelectionCallback;
  private _selectionAnchor: number;
  private _selectionTarget: number;

  /**
   * Creates a new [[CollaborativeSelectionManager]].
   *
   * @param options The options that configure this instance.
   */
  constructor(options: ICollaborativeSelectionManagerOptions) {
    this._collaborators = new Map();
    this._textElement = options.control;

    // TODO handle the line height better. The issue here
    //  is that the textarea-caret library can't handle
    //  a non-number.
    const computed = window.getComputedStyle(this._textElement);
    if (computed.lineHeight === "normal") {
      throw new Error("Text areas must have a numeric line-height.");
    }

    this._onSelection = options.onSelectionChanged;

    this._selectionAnchor = this._textElement.selectionStart;
    this._selectionTarget = this._textElement.selectionEnd;

    this._overlayContainer = this._textElement.ownerDocument.createElement("div");
    this._overlayContainer.className = "text-collab-ext";
    this._textElement.parentElement.append(this._overlayContainer);

    this._scroller = this._textElement.ownerDocument.createElement("div");
    this._scroller.className = "text-collab-ext-scroller";
    this._overlayContainer.append(this._scroller);

    // Provide resize handling. After the mose down, we register for mouse
    // movement and check if we have resized. We then listen for a mouse up
    // to unregister.
    this._textElement.addEventListener("mousedown", () => {
      window.addEventListener("mousemove", this._onMouseMove);
    });

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", this._onMouseMove);
      this._checkResize();
    });

    this._textElement.addEventListener("scroll", () => this._updateScroller());

    this._textElement.addEventListener("keydown", this._checkSelection);
    this._textElement.addEventListener("click", this._checkSelection);
    this._textElement.addEventListener("focus", this._checkSelection);
    this._textElement.addEventListener("blur", this._checkSelection);

    this.onResize();
  }

  /**
   * Adds a remote collaborator to the textarea so that their cursor /
   * selection can be rendered.
   *
   * @param id A unique identifier for this collaborator.
   * @param label A text label to render over the cursor.
   * @param color The color to use for the cursor and selection.
   * @param selection The initial selection to render, if desired.
   *
   * @returns A [[CollaboratorSelection]] that can be used to control
   *   the selection / cursor for this collaborator
   */
  public addCollaborator(id: string, label: string, color: string, selection?: ISelectionRange): CollaboratorSelection {
    if (this._collaborators.has(id)) {
      throw new Error(`A collaborator with the specified id already exists: ${id}`);
    }

    const collaborator = new CollaboratorSelection(this._textElement, this._scroller, color, label, {margin: 5});
    this._collaborators.set(id, collaborator);

    if (selection !== undefined && selection !== null) {
      collaborator.setSelection(selection);
    }

    return collaborator;
  }

  /**
   * Get the [[CollaboratorSelection]] for the specified collaborator.
   *
   * @param id The id of the collaborator to get the selection of.
   *
   * returns A [[CollaboratorSelection]] that can be used to control
   *   the selection / cursor for this collaborator
   */
  public getCollaborator(id: string): CollaboratorSelection {
    return this._collaborators.get(id);
  }

  /**
   *
   * @param id The id of the collaborator to remove.
   */
  public removeCollaborator(id: string): void {
    const renderer = this._collaborators.get(id);
    if (renderer !== undefined) {
      renderer.clearSelection();
      this._collaborators.delete(id);
    } else {
      throw new Error(`Unknown collaborator: ${id}`);
    }
  }

  /**
   * Gets the local users selection.
   */
  public getSelection(): ISelectionRange {
    return {
      anchor: this._selectionAnchor,
      target: this._selectionTarget
    };
  }

  /**
   * Shows collaborators selections, if hidden.
   */
  public show(): void {
    this._overlayContainer.style.visibility = "visible";
  }

  /**
   * Hides the collaborators selections, if shown.
   */
  public hide(): void {
    this._overlayContainer.style.visibility = "hidden";
  }

  /**
   * Removes the collaborator selection rendering from the DOM.
   */
  public dispose(): void {
    this._overlayContainer.parentElement.removeChild(this._overlayContainer);
  }

  /**
   * Indicates that the textarea has been resized and the collaboration
   * overlay should be resized to match.
   */
  public onResize(): void {
    const top = this._textElement.offsetTop;
    const left = this._textElement.offsetLeft;
    const height = this._textElement.offsetHeight;
    const width = this._textElement.offsetWidth;

    this._overlayContainer.style.top = top + "px";
    this._overlayContainer.style.left = left + "px";
    this._overlayContainer.style.height = height + "px";
    this._overlayContainer.style.width = width + "px";
  }

  public updateSelectionsOnInsert(index: number, value: string): void {
    this._collaborators.forEach((collaborator) => {
      const selection = collaborator.getSelection();
      const anchor = IndexUtils.transformIndexOnInsert(selection.anchor, index, value);
      const target = IndexUtils.transformIndexOnInsert(selection.target, index, value);
      collaborator.setSelection({anchor, target});
    });
  }

  public updateSelectionsOnDelete(index: number, length: number): void {
    this._collaborators.forEach((collaborator) => {
      const selection = collaborator.getSelection();
      const anchor = IndexUtils.transformIndexOnDelete(selection.anchor, index, length);
      const target = IndexUtils.transformIndexOnDelete(selection.target, index, length);
      collaborator.setSelection({anchor, target});
    });
  }

  private _checkSelection = () => {
    setTimeout(() => {
      const changed = this._textElement.selectionStart !== this._selectionAnchor ||
        this._textElement.selectionEnd !== this._selectionTarget;
      if (changed) {
        if (this._selectionAnchor === this._textElement.selectionStart) {
          this._selectionAnchor = this._textElement.selectionStart;
          this._selectionTarget = this._textElement.selectionEnd;
        } else {
          this._selectionAnchor = this._textElement.selectionEnd;
          this._selectionTarget = this._textElement.selectionStart;
        }

        this._onSelection({
          anchor: this._selectionAnchor,
          target: this._selectionTarget
        });
      }
    }, 0);
  }

  private _onMouseMove = () => {
    this._checkResize();
    this._checkSelection();
  }

  private _checkResize = () => {
    if (this._textElement.offsetWidth !== this._overlayContainer.offsetWidth ||
      this._textElement.offsetHeight !== this._overlayContainer.offsetHeight ||
      this._textElement.offsetTop !== this._overlayContainer.offsetTop ||
      this._textElement.offsetLeft !== this._overlayContainer.offsetLeft) {
      this.onResize();
      this._collaborators.forEach(renderer => renderer.refresh());
    }
  }

  private _updateScroller(): void {
    this._scroller.style.top = (this._textElement.scrollTop * -1) + "px";
    this._scroller.style.left = (this._textElement.scrollLeft * -1) + "px";
  }
}