// page-flip (StPageFlip) ships no TypeScript types — minimal shim covering
// what we actually use.
declare module "page-flip" {
  export interface PageFlipEvent {
    data: unknown;
  }

  export interface PageFlipSettings {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    mobileScrollSupport?: boolean;
  }

  export class PageFlip {
    constructor(el: HTMLElement, settings: PageFlipSettings);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    on(event: "flip", handler: (e: PageFlipEvent) => void): void;
    getCurrentPageIndex(): number;
    flipNext(): void;
    destroy(): void;
  }
}
