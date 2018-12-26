import {ISelectionRange} from "./ISelectionRange";
import {CollaboratorSelection} from "./CollaboratorSelection";
import {IndexUtils} from "./IndexUtils";

export type ISelectionCallback = (selection: ISelectionRange) => void;

export interface ICollaborativeSelectionManagerOptions {
  control: HTMLTextAreaElement;
  onSelectionChanged: ISelectionCallback;
}

export class CollaborativeSelectionManager {
  private readonly _collaborators: Map<string, CollaboratorSelection>;
  private readonly _textElement: HTMLTextAreaElement;
  private readonly _overlayContainer: HTMLDivElement;
  private readonly _scroller: HTMLDivElement;
  private readonly _onSelection: ISelectionCallback;
  private _selectionAnchor: number;
  private _selectionTarget: number;

  constructor(options: ICollaborativeSelectionManagerOptions) {
    this._collaborators = new Map();
    this._textElement = options.control;

    // TODO handle the line height better. The issue here
    // is that the textarea-caret library can't handle
    // a non-number.
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

    this._updateOverlay();
  }

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

  public getCollaborator(id: string): CollaboratorSelection {
    return this._collaborators.get(id);
  }

  public removeCollaborator(id: string): void {
    const renderer = this._collaborators.get(id);
    if (renderer !== undefined) {
      renderer.clearSelection();
      this._collaborators.delete(id);
    } else {
      throw new Error(`Unknown collaborator: ${id}`);
    }
  }

  public getSelection(): ISelectionRange {
    return {
      anchor: this._selectionAnchor,
      target: this._selectionTarget
    };
  }

  public show(): void {
    this._overlayContainer.style.visibility = "visible";
  }

  public hide(): void {
    this._overlayContainer.style.visibility = "hidden";
  }

  public dispose(): void {
    this._overlayContainer.parentElement.removeChild(this._overlayContainer);
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
      this._textElement.offsetHeight !== this._overlayContainer.offsetHeight) {
      this._updateOverlay();
      this._collaborators.forEach(renderer => renderer.refresh());
    }
  }

  private _updateOverlay(): void {
    const top = this._textElement.offsetTop;
    const left = this._textElement.offsetLeft;
    const height = this._textElement.offsetHeight;
    const width = this._textElement.offsetWidth;

    this._overlayContainer.style.top = top + "px";
    this._overlayContainer.style.left = left + "px";
    this._overlayContainer.style.height = height + "px";
    this._overlayContainer.style.width = width + "px";
  }

  private _updateScroller(): void {
    this._scroller.style.top = (this._textElement.scrollTop * -1) + "px";
    this._scroller.style.left = (this._textElement.scrollLeft * -1) + "px";
  }
}