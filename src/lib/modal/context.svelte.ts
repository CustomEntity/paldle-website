import {getContext, setContext} from 'svelte';

interface ModalContext {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnEscape: boolean;
    closeOnOutsideClick: boolean;
    setOpen: (value: boolean) => void;
}

const MODAL_CONTEXT = Symbol('modal');

export function setModalContext(config: Partial<ModalContext>) {
    let open = $state(false);
    let closeOnEscape = $state(true);
    let closeOnOutsideClick = $state(true);

    const context: ModalContext = {
        get open() {
            return open
        },
        get closeOnEscape() {
            return closeOnEscape
        },
        get closeOnOutsideClick() {
            return closeOnOutsideClick
        },
        setOpen: (value: boolean) => {
            if (open !== value) {
                config.onOpenChange?.(value);
                open = value;
            }
        },
        ...config
    };

    setContext(MODAL_CONTEXT, context);
    return context;
}

export function getModalContext() {
    return getContext<ModalContext>(MODAL_CONTEXT);
}