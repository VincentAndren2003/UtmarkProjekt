export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  Map: undefined;
  ProfileUpsert: { from: 'CreateAccount' | 'Profile' } | undefined;
};
