document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageEl = document.getElementById('message');

  if (!username || !password) {
    messageEl.textContent = 'Please fill in both fields.';
    return;
  }

  messageEl.textContent = 'Signing up...';

  try {
    // bcrypt is globally available here
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password_hash }])
      .select();

    if (error) {
      messageEl.textContent = `Sign up failed: ${error.message}`;
      return;
    }

    messageEl.textContent = 'Sign up successful! You can now log in.';
  } catch (err) {
    messageEl.textContent = 'Error: ' + err.message;
  }
});