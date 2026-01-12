export type User = {
  email: string;
  password: string;
  role: string;
};

export function getUsers(): User[] {
  try {
    return JSON.parse(process.env.USERS || '[]') as User[];
  } catch {
    return [];
  }
}

export function authenticate(email: string, password: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.email === email && u.password === password) || undefined;
}