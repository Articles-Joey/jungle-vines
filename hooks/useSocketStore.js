import { createWithEqualityFn as create } from 'zustand/traditional'
import { io } from "socket.io-client";

import zustandSocketStoreSlice from '@articles-media/articles-dev-box/zustandSocketStoreSlice';

export const useSocketStore = create((set, get) => ({
    ...zustandSocketStoreSlice(set, get, io),
}));