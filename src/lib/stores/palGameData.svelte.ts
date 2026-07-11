import { type BaseGameData, createGameData } from '$lib/stores/baseGameData.svelte';

// Each mode keeps its own stats/streak/guesses under its own localStorage key.
export type PalGameData = BaseGameData<number>;

const defaultValue = (): PalGameData => ({
	game: 0,
	stats: {
		wins: 0,
		average_tries: 0,
		one_shots: 0,
		current_streak: 0,
		best_streak: 0,
		last_won_game_id: 0,
		tries_per_day: {}
	},
	tries: []
});

type Store = ReturnType<typeof createGameData<number, PalGameData>>;
const instances: Record<string, Store> = {};

function useMode(key: string): Store {
	if (!instances[key]) instances[key] = createGameData<number, PalGameData>(key, defaultValue());
	return instances[key];
}

export const useClassicGameData = () => useMode('paldle_classic');
export const useDescriptionGameData = () => useMode('paldle_description');
export const useSilhouetteGameData = () => useMode('paldle_silhouette');
export const useSoundGameData = () => useMode('paldle_sound');
