// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

export const usePlayersStore = create((set) => ({

    players: [],
    setPlayers: (newValue) => {
        set((prev) => ({
            players: newValue
        }))
    },
    winner: false,
    setWinner: (newValue) => {
        set((prev) => ({
            winner: newValue
        }))
    },
    setPlayer: (player_id, newValue) => {
        set((prev) => ({
            players: prev.players.map(player => 
                player.player_index === player_id ? { ...player, ...newValue } : player
            )
        }))
    },
    populatePlayers: (newValue) => {

        let newPlayers = Array.from({ length: 25 }, (player_obj, player_i) => {
            return {
                ...(player_i == 0 && {
                    realPlayer: true
                }),
                player_index: player_i,
                x: 0,
                y: (player_i * 3)
            };
        });

        console.log("newPlayers", newPlayers)

        set((prev) => ({
            players: newPlayers
        }))

    },

    serverGameState: {},
    setServerGameState: (newValue) => {
        set((prev) => ({
            serverGameState: newValue
        }))
    },

    serverRoomPlayers: [],
    setServerRoomPlayers: (newValue) => {
        set((prev) => ({
            serverRoomPlayers: newValue
        }))
    },

}))