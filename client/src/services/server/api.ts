'use server'

import { PaginatedStackResponse, StackResponse } from "@/@types/generics";
import { stackbase } from "../server.entry";
import { ElectionPositions, Position, PositionCandidates, VoteFormData } from "@/@types/db";


export const getPositions = async (): Promise<PaginatedStackResponse<Position[]>> => {
  try {
    const { data } = await stackbase.get("/positions/");
    return data;
  } catch (error: any) {
    console.error("Error fetching positions:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching positions.",
      error: error?.response?.data,
        status: error?.response?.status || 500,
        data: [],
        count: 0,
        next: '',
        previous: '',
    };
  }
}

export const getPosition = async (positionId: string): Promise<StackResponse<PositionCandidates | null>> => {
    try {
        const { data } = await stackbase.get(`/positions/${positionId}/`);
        return data;
    } catch (error: any) {
        console.error("Error fetching position:", error);
        return {
        message: error?.response?.error?.detail || "An error occurred while fetching the position.",
        error: error?.response?.data,
        status: error?.response?.status || 500,
        data: null,
        };
    }
}

export const getActiveElection = async (): Promise<StackResponse<ElectionPositions | null>> => {
  try {
    const { data } = await stackbase.get("/elections/active/");
    return data;
  } catch (error: any) {
    console.error("Error fetching active election:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the active election.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const voteCandidate = async (voteData: VoteFormData): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.post(`/votes/`, voteData);
    return data;
  } catch (error: any) {
    console.error("Error voting for candidate:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while voting for the candidate.",
      error: error?.response?.data?.error,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getElections = async (): Promise<PaginatedStackResponse<ElectionPositions[]>> => {
  try {
    const { data } = await stackbase.get("/elections/");
    return data;
  } catch (error: any) {
    console.error("Error fetching elections:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching elections.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: [],
      count: 0,
      next: '',
      previous: '',
    };
  }
}

export const getElection = async (electionId: string): Promise<StackResponse<ElectionPositions | null>> => {
  try {
    const { data } = await stackbase.get(`/elections/${electionId}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching election:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the election.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getJustConcludedElectionResults = async (): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get("/elections/last-concluded/");
    return data;
  } catch (error: any) {
    console.error("Error fetching active election results:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the last concluded election results.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}


export const getElectionResults = async (electionId: string): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get(`/elections/${electionId}/results/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching election results:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching the election results.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}

export const getRecentWinners = async (): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.get("/elections/recent-winners/");
    return data;
  } catch (error: any) {
    console.error("Error fetching recent winners:", error);
    return {
      message: error?.response?.error?.detail || "An error occurred while fetching recent winners.",
      error: error?.response?.data,
      status: error?.response?.status || 500,
      data: null,
    };
  }
}