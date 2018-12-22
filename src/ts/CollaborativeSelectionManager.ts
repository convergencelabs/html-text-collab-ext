import {ISelectionRange} from "./ISelectionRange";
import {CollaboratorSelection} from "./CollaboratorSelection";

export class CollaborativeSelectionManager {
  private readonly _collaborators: Map<string, CollaboratorSelection>;
  private readonly _textElement: HTMLTextAreaElement;
  private readonly _overlayContainer: HTMLDivElement;
  private readonly _scroller: HTMLDivElement;

  constructor(textElement: HTMLTextAreaElement) {
    this._collaborators = new Map();
    this._textElement = textElement;

    this._overlayContainer = textElement.ownerDocument.createElement("div");
    this._overlayContainer.className = "text-collab-ext";
    textElement.parentElement.append(this._overlayContainer);

    this._scroller = textElement.ownerDocument.createElement("div");
    this._scroller.className = "text-collab-ext-scroller";
    this._overlayContainer.append(this._scroller);

    // Provide resize handling. After the mose down, we register for mouse
    // movement and check if we have resized. We then listen for a mouse up
    // to unregister.
    textElement.addEventListener("mousedown", e => {
      window.addEventListener("mousemove", this._checkResize);
    });

    window.addEventListener("mouseup", e => {
      window.removeEventListener("mousemove", this._checkResize);
      this._checkResize();
    });

    textElement.addEventListener("scroll", (e) => this._updateScroller());

    this._updateOverlay();
  }

  public createCollaborator(id: string, label: string, color: string, selection?: ISelectionRange): CollaboratorSelection {
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
    renderer.clearSelection();

    this._collaborators.delete(id);
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