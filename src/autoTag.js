const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'all', 'also', 'am', 'are', 'as', 'at', 'be', 'been', 'being',
  'can', 'could', 'did', 'do', 'does', 'done', 'each', 'few', 'had',
  'has', 'have', 'her', 'here', 'hers', 'him', 'his', 'how', 'its',
  'just', 'like', 'more', 'most', 'much', 'my', 'no', 'nor', 'not',
  'now', 'off', 'old', 'once', 'only', 'other', 'our', 'out', 'own',
  'per', 'say', 'says', 'she', 'should', 'some', 'such', 'than',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
  'this', 'too', 'under', 'upon', 'very', 'was', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'why', 'will', 'would',
  'you', 'your', 'is', 'it', 'its', 'that', 'this', 'we', 'he', 'she',
  'have', 'has', 'had', 'not', 'are', 'was', 'were', 'been', 'being',
  'get', 'got', 'make', 'made', 'may', 'might', 'shall', 'should',
  'could', 'would', 'need', 'dare', 'ought', 'used', 'let'
]);

export function extractKeywords(text, maxKeywords = 5) {
  if (!text || typeof text !== 'string') return [];
  const plainText = text.replace(/<[^>]*>/g, ' ');
  const words = plainText
    .toLowerCase()
    .replace(/[^a-z0-9\s#-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  const freq = {};
  let maxFreq = 0;
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
    if (freq[w] > maxFreq) maxFreq = freq[w];
  });
  return Object.entries(freq)
    .map(([word, count]) => ({ word, score: count / maxFreq }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxKeywords)
    .map(e => e.word);
}

export function suggestTags(note) {
  const keywords = extractKeywords(note?.content || '', 5);
  const existingTagSet = new Set(note?.tags || []);
  return keywords.filter(k => !existingTagSet.has(k));
}
