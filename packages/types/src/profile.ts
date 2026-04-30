export type Gender = 'male' | 'female' | 'other';

export type ProfileInput = {
  username: string;
  fullName: string;
  age: number;
  gender: Gender;
};

export type Profile = ProfileInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
