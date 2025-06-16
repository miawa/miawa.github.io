import supabase from './supabaseClient.js';

console.log ("draggable element loaded")



// Upload file to Supabase Storage, return public URL
const container = document.getElementById('drag-container');


export async function uploadDraggableImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('draggable-images')
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('draggable-images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Save or update draggable image info in DB
export async function saveDraggableImage(imageUrl, positionTop, positionLeft) {
 const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('User not logged in');
    return;
  }

  try {
    const { error: insertError } = await supabase
      .from('profile_draggable_images')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        position_top: positionTop,
        position_left: positionLeft,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting draggable image:', insertError);
    } else {
      console.log('Draggable image saved successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}


export async function loadDraggableImages() {
const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('User not logged in');
    return;
  }

  const { data, error } = await supabase
    .from('profile_draggable_images')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved draggable images:', error);
    return;
  }

  if (data && data.length > 0) {
    data.forEach(imageData => {
      loadSingleImage(imageData.image_url, imageData.position_top, imageData.position_left);
    });
  }
}


export async function loadSingleImage(imageUrl, posTop = 100, posLeft = 100) {
  // Check if image already exists, remove if so (optional)
  

  // Create img element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.position = 'absolute';
  img.style.top = posTop + '%';
  img.style.left = posLeft + '%';
  img.style.width = '150px';
  img.style.height = '150px';
  img.style.cursor = 'move';
  img.style.zIndex = '9999';
  img.id = `draggableImage-${Date.now()}-${Math.random().toString(36).substring(2)}`;


  document.body.appendChild(img);

  // Drag functionality
  let isDragging = false;
  let offsetX, offsetY;

  img.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - img.offsetLeft;
    offsetY = e.clientY - img.offsetTop;
    img.style.transition = 'none'; // disable transition while dragging
  });

  window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  img.style.transition = '';

  // Calculate and save new position in %
  const newTopPercent = (img.offsetTop / window.innerHeight) * 100;
  const newLeftPercent = (img.offsetLeft / window.innerWidth) * 100;

  // Call save function with new % positions
  saveDraggableImage(img.src, newTopPercent, newLeftPercent);
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  img.style.left = (e.clientX - offsetX) + 'px';
  img.style.top = (e.clientY - offsetY) + 'px';
  img.style.top = (posTop / 100) * window.innerHeight + 'px';
img.style.left = (posLeft / 100) * window.innerWidth + 'px';
});
}
