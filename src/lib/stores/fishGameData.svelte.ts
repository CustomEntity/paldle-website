import { type BaseGameData, createGameData } from "$lib/stores/baseGameData.svelte";

type FishId = number;
export type FishGameData = BaseGameData<FishId> & {};

const defaultValue: FishGameData = {
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
    tries: [],
};

let instance: ReturnType<typeof createGameData> | null = null;

export function useFishGameData() {
    if (!instance) {
        instance = createGameData('fish_data', defaultValue);
    }
    return instance;
}
