import type { Snippet } from 'svelte';

export type ModalRootProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    children: Snippet;
}

export type ModalTriggerProps = {
    children: Snippet;
    class: string;
}

export type ModalPortalProps = {
    children: Snippet;
}

export type ModalOverlayProps = {
    transition?: any;
    transitionConfig?: any;
    class: string;
}

export type ModalContentProps = {
    children: Snippet;
    transition?: any;
    transitionConfig?: any;
    class: string;
}

export type ModalTitleProps = {
    children: Snippet;
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    class: string;
}