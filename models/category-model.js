// models/Article.js
const { db } = require('../firebase.js');
const COLLECTION_NAME = "pages";

class Article {
  /**
   * Fetch articles by category with pagination
   * @param {string} website_id - Website to filter
   * @param {string} category - Category to filter
   * @param {number} limit - Max number of articles per page
   * @param {DocumentSnapshot|null} startAfterDoc - Firestore pagination cursor
   * @returns { items: [], nextPageToken: DocumentSnapshot|null }
   */
static async getByCategory(website_id, category, limit = 6, startAfterDoc = null) {
  // Fetch LIMIT + 1 to compensate for filtered items like 'index'
  let query = db.collection(COLLECTION_NAME)
    .where("status", "==", "published")
    .where("website_id", "==", website_id)
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .limit(limit + 1);  // ← Fetch extra

  if (startAfterDoc) {
    query = query.startAfter(startAfterDoc);
  }

  const snapshot = await query.get();

  // Convert docs
  const rawItems = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Filter out index
  const filtered = rawItems.filter(item => item.slug !== "index");

  // Always return exactly `limit` items max
  const items = filtered.slice(0, limit);

  // Cursor from Firestore, not filtered array
  const nextPageToken =
    snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { items, nextPageToken };
}


  /**
   * Convert a document ID into a Firestore DocumentSnapshot
   * Needed for pagination with startAfter
   * @param {string} id
   * @returns {DocumentSnapshot}
   */
  static async getDocSnapshotById(id) {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    return await docRef.get();
  }
  static async getTotalCount(website_id, category) {
  const snapshot = await db.collection(COLLECTION_NAME)
    .where("status", "==", "published")
    .where("website_id", "==", website_id)
    .where("category", "==", category)
    .get();

  return snapshot.size;
}

}



module.exports = Article;
