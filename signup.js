document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageEl = document.getElementById('message');
  const defaultProfilePicUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';

  if (!username || !password) {
    messageEl.textContent = 'Please fill in both fields.';
    return;
  }

  messageEl.textContent = 'Signing up...';

  try {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const defaultEmail = 'noemail@domain.com';

    const { data: userDataArray, error: userError } = await supabase
      .from('users')
      .insert([{ username, email: defaultEmail, password_hash }])
      .select();

    if (userError || !userDataArray || userDataArray.length === 0) {
      console.error('User insert error:', userError);
      messageEl.textContent = 'Sign up failed: ' + (userError?.message || 'Unknown error');
      return;
    }

    // ⚠️ FIXED HERE: Use [0] because .select() returns an array
    const userId = userDataArray[0].id;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        user_id: userId,
        profile_picture_url: defaultProfilePicUrl,
        display_name: username,
        bio: '',
        location: ''
      }]);

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      messageEl.textContent = 'Profile creation failed: ' + profileError.message;
      return;
    }

    localStorage.setItem('userId', userId);

    messageEl.textContent = 'Sign up successful! You can now log in.';
  console.log("Redirecting to profilesetup.html");
window.location.href = 'profilesetup.html';
  } catch (err) {
    messageEl.textContent = 'Error: ' + err.message;
  }
});
