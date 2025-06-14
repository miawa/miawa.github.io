import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fctswjvfkyolhiyzhusb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHN3anZma3lvbGhpeXpodXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3ODI2MiwiZXhwIjoyMDY1MTU0MjYyfQ.CAsDZEtYPa9e1hKmufSsofDkAXC1AFLeEk2bN50Gad0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get user ID from URL or fallback to localStorage
function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user');
}

async function init() {
  let userId = getUserIdFromUrl();

  if (!userId) {
    // fallback if no user param in URL
    userId = localStorage.getItem('userId');
    if (!userId) {
      alert('No user ID found. Please log in.');
      window.location.href = 'login.html';
      return;
    }

      const userId = localStorage.getItem('userId');
        console.log('init() - userId:', userId);  // Log userId here
        if (!userId) {
          alert('No user ID found. Please log in.');
          window.location.href = 'login.html';
          return;
        }

         document.getElementById('postsContainer').style.display = 'block';

        await fetchUserProfile(userId);
        await loadFriends(userId);
        await loadPosts(userId);

        setupTabs();

        const tabsContainer = document.getElementById('postTabs');
 const postsContainer = document.getElementById('postsContainer');
        const fab = document.getElementById('fab');
  const fabOptions = document.getElementById('fabOptions');
  const postForm = document.getElementById('postForm');
  const postText = document.getElementById('postText');
  const postImageInput = document.getElementById('postImageInput');
  let selectedImageFile = null;

   // Show text post form
        newTextPostBtn.addEventListener('click', () => {
          postText.style.display = 'block';
          postImageInput.style.display = 'none';
          postImageInput.value = null;
          postForm.style.display = 'block';
          fabOptions.style.display = 'none';
        });

        // Show image post form
        newImagePostBtn.addEventListener('click', () => {
          postText.style.display = 'none';
          postText.value = '';
          postImageInput.style.display = 'block';
          postForm.style.display = 'block';
          fabOptions.style.display = 'none';
        });

  



    await loadPosts(userId); // refresh posts
  }

  console.log('init() - loading profile for userId:', userId);

  document.getElementById('postsContainer').style.display = 'block';

  await fetchUserProfile(userId);
  await loadFriends(userId);
  await loadPosts(userId);

  setupTabs();


}

document.addEventListener("DOMContentLoaded", () => {
  init();
});

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
    const { error } = await supabase.from('comments').insert([{
      post_id: postId,
      user_id: userId,
      text: commentText
    }]);
    if (error) console.error('Error adding comment:', error);
  }

     async function fetchUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('fetchUserProfile() - profile data:', data);

    // Update profile picture if available
    if (data.profile_picture_url) {
      document.getElementById('profilePicture').src = data.profile_picture_url;
    } else {
      // fallback picture
      document.getElementById('profilePicture').src = 'default.jpg';
    }

    // Update display name if available
    if (data.display_name) {
      document.getElementById('usernameDisplay').textContent = data.display_name;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
}
      const friendsListEl = document.getElementById("friendsList");

  async function loadFriends(userId) {
    console.log('Loading friends for userId:', userId);

    

  const friendsListEl = document.getElementById("friendsList");

  // Fetch friend relationships where userId is user_id or friend_id
  const { data: friendsData, error: friendsError } = await supabase
  .from('friends')
  .select('user_id, friend_id')
  .or(`user_id.eq.${userId},friend_id.eq.${userId}`);




    console.log('friendsData:', friendsData, 'friendsError:', friendsError);
    

  if (friendsError) {
    console.error('Error fetching friends:', friendsError);
    friendsListEl.textContent = 'Failed to load friends.';
    return;
  }

  if (!friendsData || friendsData.length === 0) {
  console.log('No friends found for user:', userId);
  friendsListEl.textContent = 'No friends found.';
  return;
}
  console.log('loadFriends() - friendsData:', friendsData, 'friendsError:', friendsError);

  // Determine friend IDs (exclude self)
  const friendIds = friendsData.map(f => (f.user_id === userId ? f.friend_id : f.user_id));
   console.log('loadFriends() - friendIds:', friendIds);

  // Fetch friend profiles from 'users' table
  const { data: friendProfiles, error: profilesError } = await supabase
    .from('users')
    .select('id, username')
    .in('id', friendIds);

  if (profilesError) {
    console.error('Error fetching friend profiles:', profilesError);
    friendsListEl.textContent = 'Failed to load friend details.';
    return;
  }
  console.log('loadFriends() - friendProfiles:', friendProfiles);

  friendsListEl.innerHTML = ''; // Clear previous

  friendProfiles.forEach(friend => {
    const friendLink = document.createElement('a');
    friendLink.href = `profile.html?user=${friend.id}`;
    friendLink.style.display = 'flex';
    friendLink.style.alignItems = 'center';
    friendLink.style.gap = '8px';
    friendLink.style.textDecoration = 'none';
    friendLink.style.color = '#333';

    const img = document.createElement('img');
    img.src = friend.profile_picture_url || 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';
    img.alt = `${friend.display_name || friend.username || 'User'}'s profile picture`;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = friend.display_name || friend.username || 'Unnamed User';

    friendLink.appendChild(img);
    friendLink.appendChild(usernameSpan);

    friendsListEl.appendChild(friendLink);
  });
}



      
 async function loadPosts(userId) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, body, media_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      postsContainer.textContent = 'Failed to load posts.';
      return;
    }

    if (!posts || posts.length === 0) {
      postsContainer.textContent = 'No posts yet.';
      return;
    }

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
  const commentsList = document.createElement('div');
  commentsList.style.marginTop = '8px';
  commentsList.style.borderTop = '1px solid #ccc';
  commentsList.style.paddingTop = '6px';

  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.textContent = comment.text;
    commentEl.style.fontSize = '0.9em';
    commentEl.style.marginBottom = '4px';
    commentsList.appendChild(commentEl);
  });

  postEl.appendChild(commentsList);

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
      updatedComments.forEach(c => {
        const cEl = document.createElement('div');
        cEl.textContent = c.text;
        cEl.style.fontSize = '0.9em';
        cEl.style.marginBottom = '4px';
        commentsList.appendChild(cEl);
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

postsContainer.appendChild(postEl);
  postsContainer.appendChild(postEl);
    }
  }

   // Setup tab switching
     function setupTabs() {
  const tabsContainer = document.getElementById('postTabs');
  if (!tabsContainer) {
    console.warn('No #postTabs element found');
    return;
  }

  tabsContainer.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('tab')) return;

    const clickedTab = event.target;
    if (clickedTab.classList.contains('active')) {
      // Tab already active, do nothing
      return;
    }

    // Remove active class from all tabs
    document.querySelectorAll('#postTabs .tab').forEach(tab => tab.classList.remove('active'));

    // Add active class to clicked tab
    clickedTab.classList.add('active');

    const selectedTab = clickedTab.getAttribute('data-tab');

    if (selectedTab === 'posts') {
      postsContainer.style.display = 'block';
      await loadPosts(userId);
    } else {
      postsContainer.style.display = 'none';
      // Handle other tabs here if needed
    }
  });
}


    
  setupTabs();

        await fetchUserProfile(userId);
        await loadFriends(userId);
        await loadPosts(userId); // ✅ CALLING loadPosts() here
      

      

      document.addEventListener("DOMContentLoaded", () => {
  init();
});
   