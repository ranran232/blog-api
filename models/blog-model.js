const { db } = require('../firebase.js');
const COLLECTION_NAME = 'pages';

class Blog {
  // for featured
static async getLatestBlog(website_id) {
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('status', '==', 'published')
    .where('website_id', '==', website_id)
    .orderBy('createdAt', 'desc')
    .limit(1) // Only fetch one
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}


  // Get latest N blogs per category filtered by website_id
static async getLatestPerCategory(website_id, limit = 6, skipId = null) {
  const REQUIRED_CATEGORIES = [
    "culture",
    "dating",
    "psychology",
    "travel",
    "realities",
    "our-process",
  ];

  const snapshot = await db.collection(COLLECTION_NAME)
    .where("status", "==", "published")
    .where('website_id', '==', website_id)
    .orderBy("createdAt", "desc")
    .get();

  const result = {};
  REQUIRED_CATEGORIES.forEach(cat => result[cat] = []);

  snapshot.docs.forEach(doc => {
    if (doc.id === skipId) return; 

    const data = doc.data();
    const cat = data.category;

    if (REQUIRED_CATEGORIES.includes(cat) && result[cat].length < limit) {
      result[cat].push({ id: doc.id, ...data });
    }
  });

  return result;
}
}

module.exports = Blog;
