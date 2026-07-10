import {browser} from "$app/environment";

export type BaseGameStats = {
    wins: number;
    average_tries: number;
    one_shots: number;
    current_streak: number;
    best_streak: number;
    last_won_game_id: number;
    tries_per_day: {
        [date: string]: number;
    };
}

export type BaseGameData<T> = {
    game: number;
    stats: BaseGameStats;
    tries: T[];
}

function createGameData<T, D extends BaseGameData<T>>(
    name: string,
    defaultValue: D
) {
    let data = $state(JSON.parse(browser ? window.localStorage.getItem(name) ?? 'null' : 'null') || defaultValue) as D;

    if (browser) {
        checkAndResetStreak();
    }

    $effect(() => {
        if (browser) {
            window.localStorage.setItem(name, JSON.stringify($state.snapshot(data)));
        }
    });

    function resetTries(newGame: number) {
        data.game = newGame;
        data.tries = [];
    }

    function addTry(id: T) {
        data.tries.push(id);
    }

    function checkAndResetStreak() {
        if (data.stats.last_won_game_id === 0) return;

        if (data.game > data.stats.last_won_game_id + 1) {
            data.stats.current_streak = 0;
        }
    }

    function win() {
        data.stats.wins++;
        data.stats.last_won_game_id = data.game;
        data.stats.current_streak++;
        data.stats.best_streak = Math.max(data.stats.best_streak, data.stats.current_streak);
        if (data.tries.length === 1) {
            data.stats.one_shots++;
        }
        data.stats.average_tries = (data.stats.average_tries * (data.stats.wins - 1) + data.tries.length) / data.stats.wins;
        data.stats.tries_per_day[new Date().toISOString().split('T')[0]] = data.tries.length;
    }

    return {
        get tries() {
            return data.tries;
        },
        get game() {
            return data.game;
        },
        get data() {
            return data;
        },
        resetTries,
        addTry,
        win,
    };
}

export {
    createGameData,
};