import generateWeeklyMapSeed from '@/util/generateWeeklyMapSeed';
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

      debugMode: false,
      setDebugMode: (newValue) => set({ debugMode: newValue }),

      seed: '3',
      // TOODO: Uncomment this to use the weekly seed or conditionally set it based on arcadeMode
      // seed: generateWeeklyMapSeed(),
      setSeed: (newValue) => set({ seed: newValue }),

      // Side Scroll, First Person, Third Person, Orbit
      cameraControlMethod: 'Side Scroll',
      setCameraControlMethod: (newValue) => set({ cameraControlMethod: newValue }),

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

      showCreditsModal: false,
      setShowCreditsModal: (newValue) => set({ showCreditsModal: newValue }),

      audioSettings: {
        enabled: true,
        backgroundMusicVolume: 50,
        soundEffectsVolume: 50,
      },
      setAudioSettings: (newValue) => set({ audioSettings: newValue }),
      audioMuted: false,
      setAudioMuted: (newValue) => set({ audioMuted: newValue }),

    }),
    {
      name: 'jungle-vines-store', // name of the item in the storage (must be unique)
      version: 4,
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['showSettingsModal', 'seed'].includes(key)),
        ),
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    },
  ),
)