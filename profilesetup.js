import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0'; // Replace with your key
const supabase = createClient(supabaseUrl, supabaseKey);

const defaultProfilePicUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';

const userId = localStorage.getItem('userId');
const profileForm = document.getElementById('profileForm');
const messageEl = document.getElementById('message');
const profilePictureInput = document.getElementById('profilePictureInput');

if (!userId) {
  alert('No user found. Please sign up or log in.');
  window.location.href = 'signup.html';
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageEl.textContent = 'Saving profile...';

  const displayName = document.getElementById('displayName').value.trim() || null;
  const bio = document.getElementById('bio').value.trim() || null;
  const file = profilePictureInput.files[0];

  let profile_picture_url = defaultProfilePicUrl;

  try {
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        messageEl.textContent = 'Failed to upload image: ' + uploadError.message;
        return;
      }

      const { data: publicUrlData, error: urlError } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      if (urlError) {
        messageEl.textContent = 'Failed to get public URL: ' + urlError.message;
        return;
      }

      profile_picture_url = publicUrlData.publicUrl;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{
        user_id: userId,
        display_name: displayName,
        bio,
        location: null,
        profile_picture_url,
      }]);

    if (profileError) {
      messageEl.textContent = 'Failed to save profile: ' + profileError.message;
      return;
    }

    messageEl.textContent = 'Profile saved! Redirecting to homepage...';
    setTimeout(() => {
      window.location.href = 'myspace.html'; // Your homepage after profile setup
    }, 1500);

  } catch (err) {
    messageEl.textContent = 'Unexpected error: ' + err.message;
  }
});

// Skip button handler
document.getElementById('skipButton').addEventListener('click', async () => {
  messageEl.textContent = 'Skipping profile setup...';

  try {
    const { error: skipError } = await supabase
      .from('profiles')
      .upsert([{
        user_id: userId,
        display_name: null,
        bio: null,
        location: null,
        profile_picture_url: defaultProfilePicUrl,
       
      }]);

    if (skipError) {
      messageEl.textContent = 'Failed to skip profile setup: ' + skipError.message;
      return;
    }

    messageEl.textContent = 'Profile setup skipped. Redirecting...';
    setTimeout(() => {
      window.location.href = 'myspace.html';
    }, 1000);

  } catch (err) {
    messageEl.textContent = 'Unexpected error: ' + err.message;
  }
});
