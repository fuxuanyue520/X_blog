export function getWordCount(content: string) {
	// Simple word count: remove whitespace and count characters for CJK, or words for Latin
	// This is a rough estimate suitable for mixed content
	const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML tags if any
	return cleanContent.length;
}
