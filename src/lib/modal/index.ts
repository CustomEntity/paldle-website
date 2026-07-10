import Root from './components/Modal.svelte';
import Content from './components/ModalContent.svelte';
import Overlay from './components/ModalOverlay.svelte';
import Title from './components/ModalTitle.svelte';
import Trigger from './components/ModalTrigger.svelte';
import Portal from './components/ModalPortal.svelte';

export const Modal = {
    Root,
    Content,
    Overlay,
    Title,
    Trigger,
    Portal
} as const;

export type {
    ModalRootProps,
    ModalContentProps,
    ModalOverlayProps,
    ModalTitleProps,
    ModalTriggerProps,
    ModalPortalProps
} from './types';