import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialAudioSettings = {
  enabled: true,
  game_volume: 50,
  music_volume: 50,
}

export const useAudioStore = create()(
  persist(
    (set, get) => ({

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },

      audioSettings: initialAudioSettings,
      setAudioSettings: (newValue) => set({ audioSettings: newValue }),
      resetAudioSettings: () => set({
        audioSettings: initialAudioSettings
      }),

      playSound: (src, options = {}) => {
        const { enabled, game_volume } = get().audioSettings;
        if (!enabled) return;
        const audio = new Audio(src);
        audio.volume = game_volume / 100;
        audio.play();
      }

    }),
    {
      name: 'audio-store', // name of the item in the storage (must be unique)
      version: 1,
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
      partialize: (state) => ({
        audioSettings: state.audioSettings,
      }),
    },
  ),
)