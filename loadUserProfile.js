import supabase from './supabaseClient.js';

  
  
  //  const stats = await getUserStats(userId);
export async function getUserStats(userId) {
 // const userId = localStorage.getItem('userId');
  const { data, error } = await supabase
    .rpc('get_user_profile_stats', { input_user_id: userId });

  if (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  // data will be an array with one object: [{ user_id, friends_count, followers_count, posts_count }]
  return data[0]; // return the single result
  
}

export async function displayUserStats(stats) {
  // Example: update your UI with the stats
  if (!stats) return;

  document.getElementById('friendsCount').textContent = stats.friends_count;
  document.getElementById('followersCount').textContent = stats.followers_count;
  document.getElementById('postsCount').textContent = stats.posts_count;
}


      const friendsListEl = document.getElementById("friendsList");

 export async function loadFriends(userId) {
  // console.log('Loading friends for userId:', userId);

  const friendsListEl = document.getElementById("friendsList");

  const { data, error } = await supabase
    .from('friends')
    .select(`
      id,
      user_id,
      friend_id,
      user:users!friends_user_id_fkey(id, username, profiles(profile_picture_url)),
      friend:users!friends_friend_id_fkey(id, username, profiles(profile_picture_url))
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching friends:', error);
    friendsListEl.textContent = 'Failed to load friends.';
    return;
  }

  if (!data || data.length === 0) {
   // console.log('No friends found for user:', userId);
    friendsListEl.textContent = 'No friends found.';
    return;
  }

  //('Friend data:', data);

  friendsListEl.innerHTML = ''; // Clear previous content

  data.forEach(item => {
    // Determine *who the friend is*, depending on whether I am user_id or friend_id
    const isUser = item.user_id === userId;
    const friend = isUser ? item.friend : item.user;

    const profilePic = friend.profiles?.profile_picture_url || 'https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/standardProfile.jpg';

    const friendLink = document.createElement('a');
    friendLink.href = `profile.html?user=${friend.id}`;
    friendLink.style.display = 'flex';
    friendLink.style.alignItems = 'center';
    friendLink.style.gap = '8px';
    friendLink.style.textDecoration = 'none';
    friendLink.style.color = '#333';

    const img = document.createElement('img');
    img.src = profilePic;
    img.alt = `${friend.username}'s profile picture`;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = friend.username;
    //usernameSpan = await createUsernameWithVerification(friend.id);
   // createUsernameWithVerification(friend.id);
    friendLink.appendChild(img);
    friendLink.appendChild(usernameSpan);
    friendsListEl.appendChild(friendLink);
  });
}

export async function displayUsernameWithVerification(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, verified')
    .eq('id', userId)
    .single(); // Get only this user's data

  if (error) {
    console.error("Error fetching user:", error);
    return;
  }

  const usernameEl = document.createElement("span");
  usernameEl.classList.add("username");
  usernameEl.textContent = data.username;

  if (data.verified === true) {
   // console.log("user verified")
    const verifiedIcon = document.createElement("img");
    verifiedIcon.src = "https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/verified.png";
    verifiedIcon.alt = "Verified";
    verifiedIcon.style.width = "16px";
    verifiedIcon.style.height = "16px";
    verifiedIcon.style.marginLeft = "5px";
    verifiedIcon.style.verticalAlign = "middle";
    usernameEl.appendChild(verifiedIcon);
  }

  const userInfo = document.getElementById("usernameDisplay"); // Assuming you display the username here
  userInfo.innerHTML = ''; // Clear previous content
  userInfo.appendChild(usernameEl);
}

export async function createUsernameWithVerification(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, verified')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user:", error);
    const fallback = document.createElement("span");
    fallback.textContent = "Unknown User";
    return fallback;
  }

  const usernameEl = document.createElement("span");
  usernameEl.classList.add("username");
  usernameEl.textContent = data.username;

  if (data.verified) {
    const verifiedIcon = document.createElement("img");
    verifiedIcon.src = "https://fctswjvfkyolhiyzhusb.supabase.co/storage/v1/object/public/profile-pictures/verified.png";
    verifiedIcon.alt = "Verified";
    verifiedIcon.style.width = "16px";
    verifiedIcon.style.height = "16px";
    verifiedIcon.style.marginLeft = "5px";
    verifiedIcon.style.verticalAlign = "middle";
    usernameEl.appendChild(verifiedIcon);
  }

  return usernameEl;
}

export async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('post-images') // Make sure this bucket exists in your Supabase project
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Return the public URL of the uploaded image
  return `${supabaseUrl}/storage/v1/object/public/post-images/${fileName}`;
}

export async function setupImagePreview (){

    const postImageInput = document.getElementById('postImageInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');

postImageInput.addEventListener('change', () => {
  imagePreviewContainer.innerHTML = ''; // Clear previous preview

  const file = postImageInput.files[0];
  if (file) {
    // Only show if file is an image
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '200px';
      img.style.borderRadius = '8px';
      img.style.objectFit = 'contain';
      img.alt = 'Image preview';

      // Use FileReader to show preview
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
        imagePreviewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      imagePreviewContainer.textContent = 'Selected file is not an image.';
    }
  }
});
}

export async function deletePost(postId) {
  try {
    // Step 1: Fetch the post to get the image path
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('media_url')  // <-- assuming your column is called 'image_path'
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    const mediaUrl = post?.media_url;

    // TEMPORARY: Future feature, queue deletion before deletion (currently unused)
    // await supabase.from('deletionQueue').insert([{ post_id: postId, image_path: imagePath, created_at: new Date() }]);

    // Step 2: Delete the post from the database
    const { error: deletePostError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deletePostError) throw deletePostError;

    // Step 3: Delete the image from storage if it exists
   if (mediaUrl) {
      // Extract the file path relative to the bucket
      const filePath = mediaUrl.split('/post-images/')[1]; // ✅ consistent name
      console.log('filePath to delete:', filePath); // ✅ consistent name

console.log([filePath]);
      const { error: deleteImageError } = await supabase
        .storage
        .from('post-images')
        .remove([filePath]);

      if (deleteImageError) throw deleteImageError;
    }

    alert('Post and associated image deleted!');
  } catch (error) {
    console.error('Deletion failed:', error.message || error);
  alert(`Failed to delete post or its image: ${error.message || error}`);
  }
}


