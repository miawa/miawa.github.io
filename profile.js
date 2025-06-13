import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0';
const supabase = createClient(supabaseUrl, supabaseKey);

const originalFetch = window.fetch;
window.fetch = function (...args) {
  console.log('FETCH CALLED:', ...args);
  return originalFetch.apply(this, args);
};

// Get user ID from URL or fallback to localStorage
function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
}

async function getUsernamesForComments(comments) {
  const userIds = [...new Set(comments.map(c => c.user_id))]; // unique IDs

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching usernames:', error);
    return {};
  }

  // Map user_id => username for quick lookup
  const userMap = {};
  users.forEach(user => {
    userMap[user.id] = user.username;
  });

  return userMap;
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

 for (const post of posts) {
      const postEl = document.createElement('div');
      postEl.classList.add('post');

      // Post body
      const contentEl = document.createElement('p');
      contentEl.textContent = post.body;
      postEl.appendChild(contentEl);

      // Post image if exists
      if (post.media_url) {
        const imgEl = document.createElement('img');
        imgEl.src = post.media_url;
        imgEl.alt = 'Post image';
        imgEl.style.maxWidth = '100%';
        imgEl.style.marginTop = '8px';
        postEl.appendChild(imgEl);
      }

      // Post timestamp
      const dateEl = document.createElement('small');
      dateEl.textContent = new Date(post.created_at).toLocaleString();
      postEl.appendChild(dateEl);

        


      // Likes
      const likesCount = await getLikesCount(post.id);
  let likedByUser = await hasUserLiked(post.id);

  const likeBtn = document.createElement('button');
  likeBtn.textContent = likedByUser ? `❤️ ${likesCount}` : `🤍 ${likesCount}`;
  likeBtn.style.marginTop = '8px';
  likeBtn.onclick = async () => {
    if (likedByUser) {
      await unlikePost(post.id);
      likedByUser = false;
    } else {
      await likePost(post.id);
      likedByUser = true;
    }
    const newLikesCount = await getLikesCount(post.id);
    likeBtn.textContent = likedByUser ? `❤️ ${newLikesCount}` : `🤍 ${newLikesCount}`;
  };
  postEl.appendChild(likeBtn);

  // Comments section
  const comments = await getComments(post.id);
  const userMap = await getUsernamesForComments(comments);
  const commentsList = document.createElement('div');
  commentsList.style.marginTop = '8px';
  commentsList.style.borderTop = '1px solid #ccc';
  commentsList.style.paddingTop = '6px';

  

  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.style.fontSize = '0.9em';
    commentEl.style.marginBottom = '4px';
const userLink = document.createElement('a');
  userLink.href = `profile.html?user=${comment.user_id}`;
  userLink.textContent = userMap[comment.user_id] || comment.user_id;
  userLink.style.fontWeight = 'bold';
  userLink.style.marginRight = '4px';
  userLink.style.textDecoration = 'none';
  userLink.style.color = '#0077cc';

  const textSpan = document.createElement('span');
  textSpan.textContent = `: ${comment.text}`;

  commentEl.appendChild(userLink);
  commentEl.appendChild(textSpan);

    commentsList.appendChild(commentEl);

    
    
    
  });
  
  postEl.appendChild(commentsList);
  postsListEl.appendChild(postEl); // <--- Probably missing


// Add comment input
  const commentInput = document.createElement('input');
  commentInput.type = 'text';
  commentInput.placeholder = 'Add a comment...';
  commentInput.style.width = '80%';
  commentInput.style.marginTop = '6px';

  const commentBtn = document.createElement('button');
  commentBtn.textContent = 'Comment';
  commentBtn.style.marginLeft = '4px';

  commentBtn.onclick = async () => {
    if (commentInput.value.trim() !== '') {
      await addComment(post.id, commentInput.value.trim());
      commentInput.value = '';

      // Reload comments after adding new one
      const updatedComments = await getComments(post.id);
      commentsList.innerHTML = '';
      updatedComments.forEach(async (c) => {
  const commentEl = document.createElement('div');
  commentEl.style.fontSize = '0.9em';
  commentEl.style.marginBottom = '4px';

  const userLink = document.createElement('a');
  userLink.href = `profile.html?user=${c.user_id}`;
  userLink.textContent = c.user_id; // fallback before fetching username
  userLink.style.fontWeight = 'bold';
  userLink.style.marginRight = '4px';
  userLink.style.textDecoration = 'none';
  userLink.style.color = '#0077cc';

  // Fetch username
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('id', c.user_id)
    .single();

  if (!error && data?.username) {
    userLink.textContent = data.username;
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = `: ${c.text}`;

  commentEl.appendChild(userLink);
  commentEl.appendChild(textSpan);

  commentsList.appendChild(commentEl);
});
    }
  };

  const commentForm = document.createElement('div');
  commentForm.style.display = 'flex';
  commentForm.style.alignItems = 'center';
  commentForm.style.marginTop = '4px';

  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentBtn);

  postEl.appendChild(commentForm);

postsListEl.appendChild(postEl);
  postsListEl.appendChild(postEl);
    }


} 



  





 async function getLikesCount(postId) {
      const { data, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching likes count:', error);
      return 0;
    }
    return data.length;
  }

  async function hasUserLiked(postId) {
    const userId = localStorage.getItem('userId');
    console.log('hasUserLiked called with postId:', postId, 'userId:', userId); // <--- here, before the Supabase call
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

      if (error) {
  console.error('Error checking user like:', error);
  return false;
}

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user like:', error);
      return false;
    }
    return !!data;
  }

  async function likePost(postId) {
     console.log('getLikesCount called with postId:', postId);  // <--- log here
    const userId = localStorage.getItem('userId');
    const { error } = await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    if (error) console.error('Error liking post:', error);
  }

  async function unlikePost(postId) {
    const userId = localStorage.getItem('userId');
    const { data, error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) console.error('Error unliking post:', error);
  }

  async function getComments(postId) {
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, user_id, text, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    return data || [];
  }

   async function addComment(postId, commentText) {
    const userId = localStorage.getItem('userId');
    const { error } = await supabase.from('post_comments').insert([{
      post_id: postId,
      user_id: userId,
      text: commentText
    }]);
    if (error) console.error('Error adding comment:', error);
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


