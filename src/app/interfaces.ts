export interface User {
  id: string
  userId: number,
  email: string,
  name: string,
  lastname: string,
  type: UserType,
  gender: UserGender,
}

export type UserType = 'admin' | 'tester' | 'invitado' | 'usuario';
export type UserGender = 'femenino' | 'masculino';

export interface BuildingPicture {
  id: string,
  name: string,
  authorDocId: string,
  author: string,
  votes: string[], //id of each user
  date: Date,
  url: string
}