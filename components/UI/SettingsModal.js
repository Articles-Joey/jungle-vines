import { useState } from "react";

import { Modal, Form } from "react-bootstrap"

import ArticlesButton from "@/components/UI/Button";
import { useStore } from "@/hooks/useStore";

export default function SettingsModal({
    show,
    setShow,
}) {

    const [showModal, setShowModal] = useState(true)

    const [lightboxData, setLightboxData] = useState(null)

    const [tab, setTab] = useState('Controls')

    const audioSettings = useStore(state => state.audioSettings)
    const setAudioSettings = useStore(state => state.setAudioSettings)

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal"
                size='md'
                show={showModal}
                // To much jumping with little content for now
                // centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Settings</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className='p-2'>
                        {[
                            'Controls',
                            'Audio',
                            'Chat'
                        ].map(item =>
                            <ArticlesButton
                                key={item}
                                active={tab == item}
                                onClick={() => { setTab(item) }}
                            >
                                {item}
                            </ArticlesButton>
                        )}
                    </div>

                    <hr className="my-0" />

                    <div className="p-2">
                        {tab == 'Controls' &&
                            <div>
                                {[
                                    {
                                        action: 'Move Left',
                                        defaultKeyboardKey: 'A'
                                    },
                                    {
                                        action: 'Move Right',
                                        defaultKeyboardKey: 'D'
                                    },
                                    {
                                        action: 'Move Up on Vine',
                                        defaultKeyboardKey: 'W'
                                    },
                                    {
                                        action: 'Move Down on Vine',
                                        defaultKeyboardKey: 'S'
                                    },
                                    {
                                        action: 'Jump',
                                        defaultKeyboardKey: 'Space'
                                    },
                                ].map(obj =>
                                    <div key={obj.action}>
                                        <div className="flex-header border-bottom pb-1 mb-1">

                                            <div>
                                                <div>{obj.action}</div>
                                                {obj.emote && <div className="span badge bg-dark border">Emote</div>}
                                            </div>

                                            <div>

                                                <div className="badge badge-hover border bg-articles me-1">{obj.defaultKeyboardKey}</div>

                                                <ArticlesButton
                                                    className=""
                                                    small
                                                >
                                                    Change Key
                                                </ArticlesButton>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                        {tab == 'Audio' &&
                            <div className="p-2">
                                <>
                                    <div className="mb-4">
                                        <div className="mb-0">Audio</div>
                                        <div>
                                            <ArticlesButton
                                                className=""
                                                small
                                                active={!audioSettings.enabled}
                                                onClick={() => setAudioSettings({
                                                    ...audioSettings,
                                                    enabled: !audioSettings.enabled
                                                })}
                                            >
                                                Disabled
                                            </ArticlesButton>
                                            <ArticlesButton
                                                className=""
                                                small
                                                active={audioSettings.enabled}
                                                onClick={() => setAudioSettings({
                                                    ...audioSettings,
                                                    enabled: !audioSettings.enabled
                                                })}
                                            >
                                                Enabled
                                            </ArticlesButton>
                                        </div>
                                    </div>

                                    <Form.Label className="mb-0">Game Volume</Form.Label>
                                    <Form.Range
                                        value={audioSettings.soundEffectsVolume}
                                        onChange={(e) => setAudioSettings({ 
                                            ...audioSettings,
                                            soundEffectsVolume: e.target.value 
                                        })}
                                    />
                                    <Form.Label className="mb-0">Music Volume</Form.Label>
                                    <Form.Range
                                        value={audioSettings.backgroundMusicVolume}
                                        onChange={(e) => setAudioSettings({ 
                                            ...audioSettings,
                                            backgroundMusicVolume: e.target.value 
                                        })}
                                    />
                                </>
                            </div>
                        }
                        {tab == 'Chat' &&
                            <>
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat panel"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Censor chat"
                                />
                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Game chat speech bubbles"
                                />
                            </>
                        }
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    {/* <div></div> */}


                    <div>

                        <ArticlesButton
                            variant="outline-dark"
                            onClick={() => {
                                setShow(false)
                            }}
                        >
                            Close
                        </ArticlesButton>

                        <ArticlesButton
                            variant="outline-danger ms-3"
                            onClick={() => {
                                setShow(false)
                            }}
                        >
                            Reset
                        </ArticlesButton>

                    </div>


                    {/* <ArticlesButton variant="success" onClick={() => setValue(false)}>
                    Save
                </ArticlesButton> */}

                </Modal.Footer>

            </Modal>
        </>
    )

}