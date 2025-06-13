document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageEl = document.getElementById('message');

  if (!username || !password) {
    messageEl.textContent = 'Please fill in both fields.';
    return;
  }

  messageEl.textContent = 'Logging in...';

  try {
    // Fetch user by username
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      messageEl.textContent = 'User not found.';
      return;
    }

    // Compare password using bcryptjs
    const isValid = bcrypt.compareSync(password, data.password_hash);

    if (!isValid) {
      messageEl.textContent = 'Invalid password.';
      return;
    }

    messageEl.textContent = 'Login successful! Welcome, ' + data.username;
    
   window.location.href = 'mainpage.html';

  } catch (err) {
    messageEl.textContent = 'Error: ' + err.message;
  }
});