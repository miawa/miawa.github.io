
import { supabase } from './supabaseClient.js'; 

export async function fetchUserProfile(userId) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return null;
        }
        console.log('fetchUserProfile() - user data:', data);  // Log user profile data

       


        // Update profile picture on page if available
        if (data.profile_picture_url) {
          document.getElementById('profilePicture').src = data.profile_picture_url;
        }
        if (data.username) {
  document.getElementById('usernameDisplay').textContent = `${data.username}`;
}
        return data;
      }