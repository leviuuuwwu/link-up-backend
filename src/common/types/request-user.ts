// Tipos base para el usuario que viaja en req.user (JWT)
export type Role = 'ADMIN' | 'USER';

export type RequestUser = {
  id: string;
  role: Role;
  email?: string;
};
