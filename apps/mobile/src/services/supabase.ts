import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_SEC_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUpWithEmail = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const signInWithEmail = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

// Function to fill out profile or and update profile (upsert)
export const upsertMyProfile = async (profile: ProfileInput) => {
  // Function takes profile as argument, ProfileInput ensures object shape is correct ex username, fullname, age and gender

  const {
    data: { user }, // user is the current user
    error: userError, // error is the error message
  } = await supabase.auth.getUser(); // Asking supabase for current user

  // return value is either an an auth user or null and usererror or null there aswell

  if (userError || !user) {
    // If userError exists or and user is null then ..
    return { data: null, error: userError || new Error('User not found') };
  }

  return supabase.from('profiles').upsert(
    // Upsert is a combo of update and insert. if row already exists then update, if not then insert
    {
      id: user.id, // Most important, links auth to profile. Makes profile belong to current logged in user
      username: profile.username,
      full_name: profile.fullname,
      age: profile.age,
      gender: profile.gender,
      updated_at: new Date().toISOString(), // isostring gives supabase a formated timestamp
    },
    { onConflict: 'id' } // tells supabase to use id as the primary key and if row already exists then update, if not then insert
  );

  // getmyprofile function needs to be added in order to have a update profile screen i guess
  // need to first get all the profule data and then use the upsertprofile function to update the profile
};

export const getMyProfile = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: userError || new Error('User not found') };
  }
  return supabase.from('profiles').select('*').eq('id', user.id).single();
};
