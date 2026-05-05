"use client"
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';

import { useStore } from '@/hooks/useStore';

import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import ToontownModeHandler from '@articles-media/articles-dev-box/ToontownModeHandler';

export default function LayoutClient({ children }) {

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
            <ToontownModeHandler 
                useStore={useStore}
            />
        </>
    );
}
