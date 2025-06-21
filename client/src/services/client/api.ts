import { useMutation, useQuery } from "@tanstack/react-query";
import { Position, ElectionPositions, VoteFormData } from "@/@types/db";
import { getPositions, getPosition, getActiveElection, voteCandidate } from "../server/api";

export const QUERY_KEYS = {
    get_positions: 'get_positions',
    get_position: 'get_position',
    get_active_election: 'get_active_election',
}

export const usePositions = () => useQuery({
    queryKey: [QUERY_KEYS.get_positions],
    queryFn: async () => getPositions(),
})

export const usePosition = (positionId: string) => useQuery({
    queryKey: [QUERY_KEYS.get_position, positionId],
    queryFn: async () => getPosition(positionId),
    enabled: !!positionId,
})

export const useActiveElection = () => useQuery({
    queryKey: [QUERY_KEYS.get_active_election],
    queryFn: async () => getActiveElection(),
})

export const useVoteCandidate = () => useMutation({
    mutationFn: async (voteData: VoteFormData) => voteCandidate(voteData),
})
