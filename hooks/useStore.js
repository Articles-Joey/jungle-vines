import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create()(
  persist(
    (set, get) => ({

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },

      darkMode: null,
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),
      setDarkMode: (newValue) => set({ darkMode: newValue }),

      nickname: '',
      setNickname: (newValue) => set({ nickname: newValue }),

      lastDistanceTraveled: 0,
      setLastDistanceTraveled: (newValue) => set({ lastDistanceTraveled: newValue }),
      maxDistanceTraveled: 0,
      setMaxDistanceTraveled: (newValue) => set({ maxDistanceTraveled: newValue }),

      showSettingsModal: false,
      setShowSettingsModal: (newValue) => set({ showSettingsModal: newValue }),

      showInfoModal: false,
      setShowInfoModal: (newValue) => set({ showInfoModal: newValue }),

      audioSettings: {
        enabled: true,
        backgroundMusicVolume: 100,
        soundEffectsVolume: 100,
      },
      setAudioSettings: (newValue) => set({ audioSettings: newValue }),
      audioMuted: false,
      setAudioMuted: (newValue) => set({ audioMuted: newValue }),

    }),
    {
      name: 'jungle-vines-store', // name of the item in the storage (must be unique)
      // version: 3,
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['showSettingsModal'].includes(key)),
        ),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)