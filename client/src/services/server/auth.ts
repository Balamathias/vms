'use server'

import { ChangePasswordCredentials, CurrentUserResponse, LoginCredentials, LoginResponse, TokenPair, Student as User } from "@/@types/db"
import { cookies } from "next/headers"
import { setCookies, status as STATUS } from "@/lib/utils"
import { stackbase } from "../server.entry"
import { StackResponse } from "@/@types/generics"
// import { redis } from "@/lib/redis"

/**
 * `await getUser()` - Get the currently logged in user based on the cookie session.
 */
export async function getUser(): Promise<CurrentUserResponse> {
  try {
    const { data } = await stackbase.get("/auth/me/")
    return data
  } catch (error: any) {
    return {
        message: error?.response?.error?.detail || error?.response?.data?.detail,
        error: error?.response?.data,
    }
  }
}

/**
 * 
 * @param username - User's username which must be unique to every user.
 * @returns User | null
 */
export async function getProfile(username: string) {
  try {

    // const profile = await redis.get(`profile:${username}`)

    const { data } = await stackbase.get(`/profile/${username}/`)
    return data as User
  } catch (error: any) {
    console.error(error)
    return null
  }
}

/**
 * 
 * @param email - user's email
 * @param password - user's password
 * @returns 
 */
export async function login({ matric_number, password }: LoginCredentials): Promise<StackResponse<TokenPair | null>> {
  try {
    const { data, status } = await stackbase.post("/auth/login/", { matric_number, password })
    const response = data as LoginResponse

    if (status === STATUS.HTTP_200_SUCCESSFUL) {
      (await cookies()).set("token", response?.data?.access as string);
      (await cookies()).set("refresh_token", response?.data?.refresh as string);
      return {
        data: response.data || null,
        status: status,
        message: "Log in successful",
        error: null
      }
    } else {
      return {
        data: null,
        message: "An unknown error has occurred.",
        status: status,
        error: { detail: "An unknown error has occurred." }
      }
    }

  } catch (error: any) {
    const status = error?.response?.status;
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error has occurred.";
    return {
      data: null,
      message: detail,
      status,
      error: { detail }
    }
  }
}

export async function changePassword({ matric_number, old_password, new_password, date_of_birth }: ChangePasswordCredentials): Promise<StackResponse<{ message: string } | null>> {
  try {
    const { data, status } = await stackbase.post("/auth/change-password/", { matric_number, old_password, new_password, date_of_birth, confirm_password: new_password })

    return data as StackResponse<{ message: string } | null>
  } catch (error: any) {
    const status = error?.response?.status;
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "An unknown error has occurred.";
    return {
      data: null,
      message: detail,
      status,
      error: { detail }
    }
  }
}

/**
 * @description Log a user out - blacklists tokens on the backend.
 * @returns status response
 */
export async function logout(): Promise<StackResponse<{ message: string } | null>> {

  const cookie = await cookies()

  try {
    const { data, status } = await stackbase.post("/auth/logout/", { refresh: cookie.get("refresh_token")?.value })

    if (status === STATUS.HTTP_205_RESET_CONTENT) {
      cookie.delete("token")
      cookie.delete("refresh_token")
      return {
        data: { message: "Logged out successfully" },
        status: STATUS.HTTP_205_RESET_CONTENT,
        message: "Logged out successfully",
        error: null
      }
    } else {
      return {
        data: null,
        status: status,
        message: "An unknown error has occurred.",
        error: { detail: "An unknown error has occurred." }
      }
    }

  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}

/** * @description Refresh JWT token using the refresh token stored in cookies.
 * @returns new access token or null
 */
export async function refreshToken() {

  const cookie = await cookies()

  try {
    // Use the correct cookie key set during login: "refresh_token"
    const refresh = cookie.get("refresh_token")?.value
    if (!refresh) {
      return null
    }

    const { data } = await stackbase.post("/auth/refresh/", { refresh })
    if (data?.access) {
      cookie.set("token", data.access)
    }

    return data as any

  } catch (error: any) {
    console.error(error)
    return null
  }
}

/**
 * @param input - Partially update a user's info including:
 * `first_name, last_name and avatar`,
 * @returns 
 */
export async function updateUser(input: Partial<User>): Promise<StackResponse<User | null>> {
  try {
    const { data, status } = await stackbase.put(`/auth/update-user/`, input)

    if (data) {
      return {
        data: data as User,
        status: status,
        message: "User updated successfully",
        error: null
      }
    }

    else return {
      data: null,
      status: status,
      message: "An unknown error has occurred.",
      error: { detail: "An unknown error has occurred." }
    }
  } catch (error: any) {
    return {
      data: null,
      message: error?.response?.data?.message || error?.response?.data?.detail,
      status: error?.status,
      error: error?.response?.data
    }
  }
}
