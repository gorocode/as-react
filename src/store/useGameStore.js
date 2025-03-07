import { create } from "zustand";
import { createPlayer } from "../api/api";

export const useGameStore = create((set) => ({
	player: null,
	selectedAction: null, 
	gameMode: "choices",
	battleEnd: null,
	gameInit: async (name, userId) => {
		try {
			const data = await createPlayer(name, userId);
			set({ player: data });
		} catch (error) {
			throw error;
		}
	},
	gameResume: async (player) => {
		set({ player: player });
	},
	updatePlayer: (newPlayer) => set({ player: newPlayer }),
	setSelectedAction: (action) => set({ selectedAction: action }),
	setGameMode: (mode) => set({ gameMode: mode }),
	setBattleEnd: (boolean) => set({ battleEnd: boolean }),
}));
