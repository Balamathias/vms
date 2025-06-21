import { useMutation, useQuery } from "@tanstack/react-query";
import { Student as User } from "@/@types/db";
import { getUser, login, logout, updateUser } from "../server/auth";

export const QUERY_KEYS = {
  get_user: 'get_user',
  update_user: 'update_user',
  get_cookies: 'get_cookies',
  get_profile: 'get_profile',
  register: 'register',
}


export const useUser = () => useQuery({
  queryKey: [QUERY_KEYS.get_user],
  queryFn: async () => getUser(),
})

export const useLogin = () => useMutation({
  mutationKey: ['login'],
  mutationFn: async ({ matric_number, password }: { matric_number: string, password: string }) => login({ matric_number, password }),
  onSuccess: (data) => {
    if (data.error) {
      throw new Error(data.message)
    }
  },
})

export const useLogout = () => useMutation({
  mutationKey: ['logout'],
  mutationFn: logout,
})

export const useUpdateUser = () => useMutation({
  mutationFn: (data: Partial<User>) => updateUser(data),
  mutationKey: [QUERY_KEYS.update_user]
})
