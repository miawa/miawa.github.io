import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get user ID from URL or fallback to localStorage
function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
}

async function loadPosts(userId) {
  if (!userId) return;

  const postsListEl = document.getElementById('postsList');
  postsListEl.innerHTML = 'Loading posts...';

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, body, media_url, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    postsListEl.textContent = 'Failed to load posts.';
    return;
  }

  if (!posts || posts.length === 0) {
    postsListEl.textContent = 'No posts found.';
    return;
  }

  postsListEl.innerHTML = ''; // clear loading text

  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');

    // Post text content
    const bodyP = document.createElement('p');
    bodyP.textContent = post.body;
    postDiv.appendChild(bodyP);

    // Optional media (image/video)
    if (post.media_url) {
      const mediaEl = document.createElement('img'); // or video if you want to extend
      mediaEl.src = post.media_url;
      mediaEl.alt = 'Post media';
      mediaEl.style.maxWidth = '100%';
      postDiv.appendChild(mediaEl);
    }

    // Post date
    const dateP = document.createElement('p');
    dateP.textContent = new Date(post.created_at).toLocaleString();
    dateP.style.fontSize = '0.8rem';
    dateP.style.color = '#666';
    postDiv.appendChild(dateP);

    postsListEl.appendChild(postDiv);
  });
}

// Fetch user profile from profiles and users table
async function fetchUserProfile(userId) {
  if (!userId) {
    alert('No user ID specified');
    return;
  }

  const loadingOverlay = document.getElementById('loadingOverlay');

  loadingOverlay.style.visibility = 'visible';

  // Clear any existing background
  document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = '';
  document.body.style.backgroundPosition = '';
  document.body.style.backgroundRepeat = '';

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, bio, profile_picture_url, background_image_url')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    alert('Failed to load profile');
    loadingOverlay.style.visibility = 'hidden';
    return;
  }

  // Fetch user data (username)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('username')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
  }

  // Update UI elements
  document.getElementById('profilePicture').src = profile.profile_picture_url || 'default.jpg';
  document.getElementById('usernameDisplay').textContent = ` ${user?.username || 'Unknown'}`;
  document.getElementById('displayName').textContent = profile.display_name || 'Unnamed User';
  document.getElementById('bio').textContent = profile.bio || '';

  if (profile.background_image_url) {
    const img = new Image();
    img.src = profile.background_image_url;

    img.onload = () => {
      document.body.style.backgroundImage = `url(${profile.background_image_url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';

      loadingOverlay.style.visibility = 'hidden'; 
    };

    img.onerror = () => {
      console.warn('Failed to load background image');
      loadingOverlay.style.visibility = 'hidden';
    };
  } else {
    loadingOverlay.style.visibility = 'hidden';
  }
}

// Load friends for the profile user
async function loadFriends(userId) {

  if (!userId) return;

  const friendsListEl = document.getElementById('friendsList');

  // For the logged-in user id, you can get it from localStorage or pass it as a parameter
  const loggedInUserId = localStorage.getItem('userId');

  // Fetch friends where user is user_id or friend_id
  const { data: friendsData, error } = await supabase
    .from('friends')
    .select('user_id, friend_id')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching friends:', error);
    friendsListEl.textContent = 'Failed to load friends.';
    return;
  }

  if (!friendsData || friendsData.length === 0) {
    friendsListEl.textContent = 'No friends found.';
    return;
  }

  // Find friend IDs excluding current user
  const friendIds = friendsData.map(f => (f.user_id === userId ? f.friend_id : f.user_id));

  // Fetch friend profiles
  const { data: friendProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, profile_picture_url, display_name')
    .in('user_id', friendIds);

  if (profilesError) {
    console.error('Error fetching friend profiles:', profilesError);
    friendsListEl.textContent = 'Failed to load friend details.';
    return;
  }

  friendsListEl.innerHTML = ''; // Clear existing

  friendProfiles.forEach(friend => {
    const friendLink = document.createElement('a');

    if (friend.user_id === loggedInUserId) {
      friendLink.href = 'myspace.html';
    } else {
      friendLink.href = `profile.html?user=${friend.user_id}`;
    }

    friendLink.style.display = 'flex';
    friendLink.style.alignItems = 'center';
    friendLink.style.gap = '8px';
    friendLink.style.textDecoration = 'none';
    friendLink.style.color = '#333';

    const img = document.createElement('img');
    img.src = friend.profile_picture_url || 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';
    img.alt = `${friend.display_name}'s profile picture`;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = friend.display_name || 'Unnamed User';

    friendLink.appendChild(img);
    friendLink.appendChild(usernameSpan);

    friendsListEl.appendChild(friendLink);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const userId = getUserIdFromUrl() || localStorage.getItem('userId');
   console.log('DOM fully loaded and parsed');
  const friendsListEl = document.getElementById('friendsList');
  console.log('friendsListEl:', friendsListEl);
  if (!userId) {
    alert('No user ID found. Please log in.');
    window.location.href = 'login.html';
    return;
  }

  await fetchUserProfile(userId);
  await loadFriends(userId);
  await loadPosts(userId);  // <-- add this call here
});


