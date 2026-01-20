"use client"
import { useEffect, useContext, useState, Suspense } from 'react';

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
import { useStore } from '@/hooks/useStore';
import ScoreCard from '@/components/UI/ScoreCard';

// import GameScoreboard from 'components/Games/GameScoreboard'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

// const PrivateGameModal = dynamic(
//     () => import('app/(site)/community/games/four-frogs/components/PrivateGameModal'),
//     { ssr: false }
// )

import GameScoreboard from '@articles-media/articles-dev-box/GameScoreboard';
import Ad from '@articles-media/articles-dev-box/Ad';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import { PieMenu } from '@articles-media/articles-gamepad-helper';

const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);

const game_key = 'jungle-vines'
const game_name = 'Jungle Vines'

export default function LobbyPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        "3042"
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    // const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)
    const darkMode = useStore((state) => state.darkMode)
    const nickname = useStore((state) => state.nickname);
    const setNickname = useStore((state) => state.setNickname);
    const _hasHydrated = useStore((state) => state._hasHydrated);
    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled);

    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal);
    const showInfoModal = useStore((state) => state.showInfoModal);
    const setShowInfoModal = useStore((state) => state.setShowInfoModal);
    const setShowCreditsModal = useStore((state) => state.setShowCreditsModal);

    const setRandomNickname = () => {
        const randomNicknames = [
            "JungleJumper",
            "VineSwinger",
            "TarzanTitan",
            "MonkeyMaster",
            "BananaBoss",
            "CanopyKing",
            "TreeTopTrekker",
            "WildWalker",
            "ForestPhantom",
            "RopeRanger",
            "LeafLeaper",
            "PrimatePro",
            "SafariScout",
            "GorillaGlider",
            "ChimpChamp",
            "AmazonAce",
            "RainforestRacer",
            "BranchBounder",
            "TropicalTraveler",
            "SavageSwinger"
        ];

        const randomIndex = Math.floor(Math.random() * randomNicknames.length);
        setNickname(randomNicknames[randomIndex]);
    }

    // Only do once so user can set name from nothing without retriggering
    const [initialRandomName, setInitialRandomName] = useState(false)
    useEffect(() => {

        // console.log("nickname", nickname)
        // console.log("rehydrated", _hasHydrated)

        if (!nickname && _hasHydrated && !initialRandomName) {
            console.log("No nickname set, set a random!")
            setRandomNickname()
            setInitialRandomName(true)
        }

    }, [nickname, _hasHydrated])

    // const [showInfoModal, setShowInfoModal] = useState(false)


    const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    useEffect(() => {

        // setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

        // if (userReduxState._id) {
        //     console.log("Is user")
        // }

        socket.on('game:jungle-vines-landing-details', function (msg) {
            console.log('game:jungle-vines-landing-details', msg)

            if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
                setLobbyDetails(msg)
            }
        });

        return () => {
            socket.off('game:jungle-vines-landing-details');
        };

    }, [])

    useEffect(() => {

        localStorage.setItem('game:jungle-vines:rulesAnControls', showInfoModal)

    }, [showInfoModal])

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', 'game:jungle-vines-landing');
        }

        return function cleanup() {
            socket.emit('leave-room', 'game:jungle-vines-landing')
        };

    }, [socket.connected]);

    return (

        <div className="jungle-vines-landing-page">

            <Suspense>
                <PieMenu
                    options={[
                        {
                            label: 'Settings',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowSettingsModal(prev => !prev)
                            }
                        },
                        {
                            label: 'Go Back',
                            icon: 'fad fa-cog',
                            callback: () => {
                                window.history.back()
                            }
                        },
                        {
                            label: 'Credits',
                            icon: 'fad fa-cog',
                            callback: () => {
                                setShowCreditsModal(true)
                            }
                        },
                        {
                            label: 'Game Launcher',
                            icon: 'fad fa-cog',
                            callback: () => {
                                window.location.href = 'https://games.articles.media';
                            }
                        }
                    ]}
                    onFinish={(event) => {
                        console.log("Event", event)
                        if (event.callback) {
                            event.callback()
                        }
                    }}
                />
            </Suspense>

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

            <div className="container d-flex flex-column justify-content-center align-items-center">

                <div
                    style={{ "width": "20rem" }}
                >

                    <div className='hero'>

                        <div
                            className='d-flex justify-content-center mb-0'
                        >
                            <img className='hero-icon' src={"/img/icon.png"}></img>
                        </div>

                        <div className='hero-title stick-regular'>
                            {game_name}
                        </div>

                    </div>

                    {maxDistanceTraveled ?
                        <div
                            className='mb-3'
                        >
                            <ScoreCard />
                        </div>
                        :
                        null
                    }

                    <div
                        className="card card-articles card-sm mb-3"
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
                                    <div className='d-flex'>
                                        <input
                                            type="text"
                                            id="nickname"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            className="form-control"
                                            placeholder="Enter your nickname"
                                        />
                                        <ArticlesButton
                                            className=''
                                            small
                                            onClick={setRandomNickname}
                                        >
                                            <i className="fad fa-redo"></i>
                                        </ArticlesButton>
                                    </div>
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
                                className=''
                            >
                                <ArticlesButton
                                    className={`w-100 mb-2`}
                                // small
                                >
                                    <i className="fas fa-play me-2"></i>
                                    Play Single Player
                                </ArticlesButton>
                            </Link>

                            <ArticlesButton
                                className={`w-100`}
                                // small
                                disabled
                            >
                                <i className="fas fa-users me-2"></i>
                                Multiplayer Coming Soon!
                            </ArticlesButton>

                            <div className='d-none mt-3'>
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
                                    setShowInfoModal(true)
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
                                    setShowCreditsModal(true)
                                }}
                            >
                                <i className="fad fa-users"></i>
                                Credits
                            </ArticlesButton>

                        </div>

                    </div>

                    <ReturnToLauncherButton />
                </div>

                {/* <GameScoreboard game="Death Race" /> */}

                {/* <Ad section={"Games"} section_id={game_name} /> */}

                <GameScoreboard
                    game={game_name}
                    style="Default"
                    darkMode={darkMode ? true : false}
                />

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={game_name}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

            </div>
        </div>
    );
}