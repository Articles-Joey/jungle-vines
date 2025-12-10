"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from 'components/constants/routes'

import ArticlesButton from '@/components/UI/Button';
// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
// import IsDev from '@/components/IsDev';
// import { ChromePicker } from 'react-color';
import { useSocketStore } from '@/hooks/useSocketStore';

// import GameScoreboard from 'components/Games/GameScoreboard'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

// const PrivateGameModal = dynamic(
//     () => import('app/(site)/community/games/four-frogs/components/PrivateGameModal'),
//     { ssr: false }
// )

const assets_src = 'games/Cannon/'

const game_key = 'jungle-vines'
const game_name = 'Jungle Vines'

export default function LobbyPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    useEffect(() => {

        setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        socket.on('game:death-race-landing-details', function (msg) {
            console.log('game:death-race-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:death-race-landing-details');
        };

    }, [])

    useEffect(() => {

        localStorage.setItem('game:four-frogs:rulesAnControls', showInfoModal)

    }, [showInfoModal])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:death-race-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:death-race-landing')
        };

    }, [socket.connected]);

    return (

        <div className="jungle-vines-landing-page">

            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            {/* {showPrivateGameModal &&
                <PrivateGameModal
                    show={showPrivateGameModal}
                    setShow={setShowPrivateGameModal}
                />
            } */}

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Jungle Vines/jungle-vines-thumbnail.webp`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div
                    className="card card-articles card-sm mb-3 mb-lg-0"
                    style={{ "width": "20rem" }}
                >

                    {/* <div style={{ position: 'relative', height: '200px' }}>
                        <Image
                            src={Logo}
                            alt=""
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div> */}

                    <div className='card-header d-flex align-items-center'>

                        <div className="flex-grow-1">

                            <div className="form-group articles mb-0">
                                <label htmlFor="nickname">Nickname</label>
                                {/* <SingleInput
                                    value={nickname}
                                    setValue={setNickname}
                                    noMargin
                                /> */}
                                <input
                                    type="text"
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter your nickname"
                                />
                            </div>

                            <div className='mt-1' style={{ fontSize: '0.8rem' }}>Visible to all players</div>

                        </div>
                    </div>

                    <div className="card-body">

                        <Link
                            prefetch={false}
                            href={{
                                pathname: `/play`
                            }}
                        >
                            <ArticlesButton
                                className={`w-100 mb-3`}
                                small
                            >
                                <i className="fas fa-play"></i>
                                Play Single Player
                            </ArticlesButton>
                        </Link>

                        <div className="fw-bold mb-1 small text-center">
                            {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} in the lobby.
                        </div>

                        <div className="servers">

                            {[1, 2, 3, 4].map(id => {

                                let lobbyLookup = lobbyDetails?.fourFrogsGlobalState?.games?.find(lobby =>
                                    parseInt(lobby.server_id) == id
                                )

                                return (
                                    <div key={id} className="server">

                                        <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                            <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                            <div className='mb-0'>{lobbyLookup?.players?.length || 0}/4</div>
                                        </div>

                                        <div className='d-flex justify-content-around w-100 mb-1'>
                                            {[1, 2, 3, 4].map(player_count => {

                                                let playerLookup = false

                                                if (lobbyLookup?.players?.length >= player_count) playerLookup = true

                                                return (
                                                    <div key={player_count} className="icon" style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        ...(playerLookup ? {
                                                            backgroundColor: 'black',
                                                        } : {
                                                            backgroundColor: 'gray',
                                                        }),
                                                        border: '1px solid black'
                                                    }}>

                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <Link
                                            className={``}
                                            prefetch={false}
                                            href={{
                                                pathname: `/play`,
                                                query: {
                                                    server: id
                                                }
                                            }}
                                        >
                                            <ArticlesButton
                                                className="px-5"
                                                small
                                            >
                                                Join
                                            </ArticlesButton>
                                        </Link>

                                    </div>
                                )
                            })}

                        </div>

                    </div>

                    <div className="card-footer d-flex flex-wrap justify-content-center">

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowSettingsModal(prev => !prev)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-info-square"></i>
                            Rules & Controls
                        </ArticlesButton>

                        {/* <Link href={'/'} className='w-50'>
                            <ArticlesButton
                                className={`w-100`}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fad fa-sign-out fa-rotate-180"></i>
                                Leave Game
                            </ArticlesButton>
                        </Link> */}

                        <Link
                            href={'https://github.com/Articles-Joey/jungle-vines'}
                            className='w-50'
                            target='_blank'
                            rel="noopener noreferrer"
                            prefetch={false}
                        >
                            <ArticlesButton
                                className={`w-100`}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fab fa-github"></i>
                                Github
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-users"></i>
                            Credits
                        </ArticlesButton>

                    </div>

                </div>

                {/* <GameScoreboard game="Death Race" /> */}

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>
        </div>
    );
}