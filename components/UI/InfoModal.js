import { useEffect, useState, useRef } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

// import ViewUserModal from "@/components/UI/ViewUserModal"

// import BasicLoading from "@/components/loading/BasicLoading";

// import powerups from "app/(site)/community/games/four-frogs/components/powerups";

// import games from "../constants/games";
const games = []

// import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";
import { useModalNavigation } from "@/hooks/useModalNavigation";

import B from "@articles-media/articles-gamepad-helper/dist/img/Xbox UI/B.svg";
import { useStore } from "@/hooks/useStore";

export default function InfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    const darkMode = useStore(state => state.darkMode)

    const elementsRef = useRef([]);
    useModalNavigation(elementsRef, () => setShowModal(false));

    return (
        <>

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Catching Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className="ratio ratio-16x9">
                        {darkMode ?
                            <img src={"img/preview.webp"}></img>
                            :
                            <img src={"img/preview.webp"}></img>
                        }
                    </div>

                    <div className="p-3">
                        Catch the falling food and avoid the falling anvils. Enemies will also walk around trying to get in your way.
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton
                        ref={el => elementsRef.current[0] = el}
                        variant="outline-dark"
                        onClick={() => {
                            setShow(false)
                        }}
                        className="d-flex align-items-center"
                    >
                        <img src={B.src} className="controller-only me-1" alt="Close" />
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>

        </>
    )

}