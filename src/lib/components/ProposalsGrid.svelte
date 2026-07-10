<script lang="ts">
    import type {Proposal} from "../../routes/skin/+page.server";

    interface Props {
        proposals: Proposal[];
        answerPosition: number;
        tries: number[];
        answer: Cosmetic;
        onAnswer: (answer: Proposal) => void;
    }

    let {
        proposals: originalProposals,
        answerPosition,
        answer,
        tries,
        onAnswer,
    }: Props = $props();

    const answerAsProposal: Proposal = {
        id: answer.id,
        marvelrivals_id: answer.marvelrivals_id,
        name: answer.name,
        media: answer.media
    };

    const proposals = [...originalProposals];
    proposals.splice(answerPosition, 0, answerAsProposal);
</script>

<label
        for="proposals-grid"
        class="text-white font-refrigerator-deluxe text-2xl">
    CHOOSE AN ANSWER BELOW
</label>
<div
        id="proposals-grid"
        class="grid grid-cols-2 gap-2.5 w-full">
    {#each proposals as proposal, i}
        <button
                onclick={() => onAnswer(proposal)}
                class="flex justify-center items-center font-refrigerator-deluxe text-white uppercase px-2 py-2 {
               tries.includes(proposal.id) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }"
        >
            {proposal.name}
        </button>
    {/each}
</div>

<style>
    #proposals-grid button {
        background: linear-gradient(180deg, rgba(128, 174, 226, 0.5) 0%, rgba(128, 174, 226, 0.2) 100%);
        border: 2px solid #80AEE2
    }

    #proposals-grid button:not(.opacity-30):hover {
        border: 2px solid #FFF548;
        background: linear-gradient(180deg, rgba(255, 245, 72, 0.5) 0%, rgba(255, 245, 72, 0.2) 100%);
    }
</style>