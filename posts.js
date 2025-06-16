

       export async function getLikesCount(postId) {
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

  export async function hasUserLiked(postId) {
   // const userId = localStorage.getItem('userId');
   // console.log('hasUserLiked called with postId:', postId, 'userId:', userId); // <--- here, before the Supabase call
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

  export async function likePost(postId) {
     console.log('getLikesCount called with postId:', postId);  // <--- log here
   // const userId = localStorage.getItem('userId');
    const { error } = await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    if (error) console.error('Error liking post:', error);
  }

  export async function unlikePost(postId) {
   // const userId = localStorage.getItem('userId');
    const { data, error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) console.error('Error unliking post:', error);
  }

 export  async function getComments(postId) {
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

  export async function addComment(postId, commentText) {
   // const userId = localStorage.getItem('userId');
    const { error } = await supabase.from('post_comments').insert([{
      post_id: postId,
      user_id: userId,
      text: commentText
    }]);
    if (error) console.error('Error adding comment:', error);
  }


  
export async function getCommentsCount(postId) {
  const { data, error, count } = await supabase
    .from('post_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) throw error;
  return count;
}




      


export async function openImagePostForm() {
  const postForm = document.getElementById('postForm');
  const textInput = document.getElementById('postText');
  const postImageInput = document.getElementById('postImageInput');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');

  // Reset form values
  textInput.value = '';
  postImageInput.value = '';
  imagePreviewContainer.innerHTML = '';

  // Call setupImagePreview here to attach event listener
 

  // Show the form
  postForm.style.display = 'block';
  
    setupImageCropper();

}


 export async function loadPosts(userId) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    postsContainer.innerHTML = '';

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, body, media_url, created_at, user_id, user:users(username)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      postsContainer.textContent = 'Failed to load posts.';
      return;
    }

    const userIds = [...new Set(posts.map(post => post.user_id))];

const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id, profile_picture_url')
  .in('user_id', userIds);
  const profilePicMap = {};
profiles.forEach(profile => {
  profilePicMap[profile.user_id] = profile.profile_picture_url;
});

    if (!posts || posts.length === 0) {
      postsContainer.textContent = 'No posts yet.';
      return;
    }

    for (const post of posts) {
      const postEl = document.createElement('div');
      postEl.classList.add('post');
// --- USERNAME DISPLAY (above post) ---
    let usernameEl = document.createElement('div');
    usernameEl.textContent = post.user.username || 'Unknown User';
    usernameEl.classList.add('username');
    

  // create image element
const profilePic = document.createElement('img');

// Set src to the profile picture URL or default if missing
const defaultProfilePicUrl = 'default-profile.jpg'; // your default pic URL
profilePic.src = profilePicMap[post.user_id] || defaultProfilePicUrl;


profilePic.alt = `${post.user.username}'s profile picture`;
  profilePic.classList.add('profile-pic');


// Now create a container div for username and profile pic
const userInfo = document.createElement('div');
userInfo.style.display = 'flex';
userInfo.style.alignItems = 'center';

// Append the profile pic and username to the container
userInfo.appendChild(profilePic);
displayUsernameWithVerification(userId);

const {data: users} = await supabase



usernameEl = await createUsernameWithVerification(post.user_id);
userInfo.appendChild(usernameEl); //this is the username for the post

// Append userInfo container to post element
postEl.appendChild(userInfo);
   

      // Post body
      const contentEl = document.createElement('p');
      contentEl.textContent = post.body;
      contentEl.classList.add('post-text');
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

    // --- "..." BUTTON (top right) ---
    const moreBtn = document.createElement('button');
    moreBtn.textContent = '...';
    moreBtn.style.position = 'absolute';
    moreBtn.style.top = '8px';
    moreBtn.style.right = '8px';
    moreBtn.style.background = 'transparent';
    moreBtn.style.border = 'none';
    moreBtn.style.fontSize = '1.2em';
    moreBtn.style.cursor = 'pointer';
    moreBtn.style.color = 'black';
moreBtn.style.fontSize = '1.2em';
moreBtn.style.cursor = 'pointer';

    postEl.style.position = 'relative';

    // Dropdown container for options
    const dropdown = document.createElement('div');
    dropdown.style.position = 'absolute';
    dropdown.style.top = '30px';
    dropdown.style.right = '8px';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.padding = '5px 10px';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '100';


      const dropdownList = document.createElement('ul');
dropdownList.style.listStyle = 'none';      // Remove default bullets
dropdownList.style.padding = '0';           // Remove default padding
dropdownList.style.margin = '0';            // Remove default margin

const deleteItem = document.createElement('li');
deleteItem.textContent = 'Delete';
deleteItem.style.padding = '8px 12px';
deleteItem.style.cursor = 'pointer';
deleteItem.style.color = 'red';
deleteItem.onclick = async () => {
  if (confirm('Are you sure you want to delete this post?')) {
    await deletePost(post.id);
    await loadPosts(userId);
  }
};

const editItem = document.createElement('li');
editItem.textContent = 'Edit post';
editItem.style.padding = '8px 12px';
editItem.style.cursor = 'pointer';
editItem.style.color = 'black';
editItem.onclick = () => {
  console.log('Edit clicked');
};

const pinPost = document.createElement('li');
pinPost.textContent = 'Pin post';
pinPost.style.padding = '8px 12px';
pinPost.style.cursor = 'pointer';
pinPost.style.color = 'black';
editItem.onclick = () => {
  console.log('Edit clicked');
};

const updatePost = document.createElement('li');
updatePost.textContent = 'Update Post';
updatePost.style.padding = '8px 12px';
updatePost.style.cursor = 'pointer';
updatePost.style.color = 'black';
updatePost.onclick = () => {
  
};

const postToFeed = document.createElement('li');
postToFeed.textContent = 'Send to feed';
postToFeed.style.padding = '8px 12px';
postToFeed.style.cursor = 'pointer';
postToFeed.style.color = 'black';
postToFeed.onclick = () => {
  console.log("feed clicked");
 sendPostToFeed(post.id);
  
};

// Optional: hover effect for better UX
[deleteItem, editItem].forEach(item => {
  item.onmouseover = () => item.style.backgroundColor = '#f0f0f0';
  item.onmouseout = () => item.style.backgroundColor = 'transparent';
});

dropdownList.appendChild(pinPost);
dropdownList.appendChild(editItem);
dropdownList.appendChild(updatePost);
dropdownList.appendChild(postToFeed);
dropdownList.appendChild(deleteItem);

dropdown.appendChild(dropdownList);

// Toggle dropdown visibility on moreBtn click
moreBtn.onclick = () => {
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
};
    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
      if (!postEl.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    postEl.appendChild(moreBtn);
    postEl.appendChild(dropdown);


      // Likes
      const likesCount = await getLikesCount(post.id);
  let likedByUser = await hasUserLiked(post.id);

 // New text-like clickable element
const likeText = document.createElement('span');
likeText.textContent = likedByUser ? `❤️ ${likesCount}` : `🤍 ${likesCount}`;
likeText.style.marginTop = '8px';
likeText.style.cursor = 'pointer';          // Makes it look clickable
likeText.style.userSelect = 'none';         // Optional: disables text selection on click
likeText.style.fontSize = '1.1em';          // Slightly larger text for emphasis

likeText.onclick = async () => {
  if (likedByUser) {
    await unlikePost(post.id);
    likedByUser = false;
  } else {
    await likePost(post.id);
    likedByUser = true;
  }
  const newLikesCount = await getLikesCount(post.id);
  likeText.textContent = likedByUser ? `❤️ ${newLikesCount}` : `🤍 ${newLikesCount}`;
};
postEl.appendChild(likeText);

  // Comments section
  const comments = await getComments(post.id);
const commentCount = document.createElement('span');
commentCount.textContent = ` ${comments.length}`; // Initial count


  const commentsList = document.createElement('div');
  commentsList.style.marginTop = '8px';
  commentsList.style.borderTop = '1px solid #ccc';
  commentsList.style.paddingTop = '6px';
  commentsList.style.display = 'none';

  comments.forEach(comment => {
    const commentEl = document.createElement('div');
    commentEl.textContent = comment.text;
    commentEl.style.fontSize = '0.9em';
    commentEl.style.marginBottom = '4px';
    commentsList.appendChild(commentEl);
  });

  

  // Create the comment toggle button


// Comment form (hidden initially)
const commentForm = document.createElement('div');
commentForm.style.display = 'none'; // Hidden initially
commentForm.style.marginTop = '6px';
//commentForm.style.display = 'flex';
commentForm.style.alignItems = 'center';

const commentsCount = await getCommentsCount(post.id);

const commentToggleEmoji = document.createElement('span');
commentToggleEmoji.textContent = `💬 ${commentsCount}`;
commentToggleEmoji.style.cursor = 'pointer';
commentToggleEmoji.style.marginLeft = '12px';
commentToggleEmoji.style.fontSize = '1.3em';
commentToggleEmoji.style.userSelect = 'none';

  // Add comment input
  const commentInput = document.createElement('input');
commentInput.type = 'text';
commentInput.placeholder = 'Add a comment...';
commentInput.style.flex = '1';

const commentBtn = document.createElement('button');
commentBtn.textContent = 'Post';
commentBtn.style.marginLeft = '6px';
postEl.appendChild(commentToggleEmoji);
postEl.appendChild(commentsList);
commentForm.appendChild(commentInput);
commentForm.appendChild(commentBtn);
postEl.appendChild(commentForm);



commentToggleEmoji.onclick = () => {
  const isVisible = commentsList.style.display === 'block';
  commentsList.style.display = isVisible ? 'none' : 'block';
  commentForm.style.display = isVisible ? 'none' : 'flex';
};



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
       // ✅ Refresh comment count after adding
       
   
    commentToggleEmoji.textContent = `💬 ${newCommentsCount}`;
       commentCount.textContent = ` ${updatedComments.length}`;
    }
  };
 
postEl.appendChild(commentForm);
  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentBtn);

  postEl.appendChild(commentForm);

  postsContainer.appendChild(postEl);
    }
  }
