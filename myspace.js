import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('No user ID found. Please log in.');
    window.location.href = 'login.html';
    return;
  }

  const profileImage = document.getElementById("profilePicture");
  const displayNameEl = document.getElementById("displayName");
  const bioEl = document.getElementById("bio");
  const fileInput = document.getElementById("fileInput");
  const changeProfileBtn = document.getElementById("changeButton");
  const profileBackground = document.getElementById('profileBackground');
  const backgroundFileInput = document.getElementById('backgroundFileInput');
  const changeBackgroundBtn = document.getElementById('changeBackgroundButton');
 // const editProfileBtn = document.getElementById('editProfileBtn');

  // Hide change buttons initially
  changeProfileBtn.style.display = 'none';
  changeBackgroundBtn.style.display = 'none';

  // Fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('profile_picture_url, display_name, bio, background_image_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    alert('Failed to load profile info.');
    return;
  }

  if (profile) {
    profileImage.src = profile.profile_picture_url || 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';
    displayNameEl.textContent = profile.display_name || 'No display name set';
    bioEl.textContent = profile.bio || 'No bio set';

    if (profile.background_image_url) {
      document.body.style.backgroundImage = `url(${profile.background_image_url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    }
  }

  // Toggle visibility of change buttons when editProfileBtn clicked
 // editProfileBtn.addEventListener('click', () => {
 //   const areButtonsVisible = changeProfileBtn.style.display === 'block';

 //   if (areButtonsVisible) {
 //     changeProfileBtn.style.display = 'none';
  //    changeBackgroundBtn.style.display = 'none';
 //   } else {
 //     changeProfileBtn.style.display = 'block';
 //     changeBackgroundBtn.style.display = 'block';
 //   }
 // });

  // Profile picture change logic (unchanged)
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);
  newFileInput.addEventListener("change", async () => {
    console.log("fileInput change event fired");
    // your code
  });

  changeProfileBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    console.log("fileInput change event fired");
    const file = fileInput.files[0];
    if (!file) return;
    if (!confirm("Are you sure you want to change your profile picture?")) {
      fileInput.value = "";
      return;
    }

    profileImage.src = URL.createObjectURL(file);

    const fileExt = file.name.split('.').pop();
    const fileName = `profile.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      return;
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    if (urlError) {
      alert('Failed to get public URL: ' + urlError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture_url: publicUrlData.publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      alert('Failed to update profile picture URL: ' + updateError.message);
      return;
    }

    alert('Profile picture updated!');
  });

  // Background image change logic (unchanged)
  changeBackgroundBtn.addEventListener('click', () => backgroundFileInput.click());

  backgroundFileInput.addEventListener('change', async () => {
    const file = backgroundFileInput.files[0];
    if (!file) return;
    if (!confirm("Are you sure you want to change your background image?")) {
      backgroundFileInput.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';

    const fileExt = file.name.split('.').pop();
    const fileName = `background.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let { error: uploadError } = await supabase.storage
      .from('profile-backgrounds')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      return;
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from('profile-backgrounds')
      .getPublicUrl(filePath);

    if (urlError) {
      alert('Failed to get public URL: ' + urlError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ background_image_url: publicUrlData.publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      alert('Failed to update background image URL: ' + updateError.message);
      return;
    }

    alert('Background updated!');
  });

  // TODO: Call your loadFriends(userId) here if you have it in this file
});