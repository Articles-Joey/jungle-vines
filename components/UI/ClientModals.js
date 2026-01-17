"use client"

import dynamic from 'next/dynamic'

import { useStore } from "@/hooks/useStore";

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const CreditsModal = dynamic(
    () => import('@/components/UI/CreditsModal'),
    { ssr: false }
)

export default function ClientModals() {

    const showSettingsModal = useStore((state) => state.showSettingsModal);
    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);

    const showInfoModal = useStore((state) => state.showInfoModal);
    const setShowInfoModal = useStore((state) => state.setShowInfoModal);

    const showCreditsModal = useStore((state) => state.showCreditsModal);
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);

    return (
        <>
            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }
            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }
            {showCreditsModal &&
                <CreditsModal
                    show={showCreditsModal}
                    setShow={setShowCreditsModal}
                />
            }
        </>
    )
}