import { supabase } from './supabaseClient';

export interface AACCard {
    id: string;
    slug: string;
    label: string;
    category: string;
    emoji: string;
    image_path: string;
    created_at: string;
    cloudinaryUrl?: string;
}

const CLOUDINARY_CONFIG = {
    cloudName: 'dabbfycew',
    cacheVersion: 'v6'
} as const;

/**
 * Get Cloudinary URL from image path
 * @param imagePath Storage path (e.g. 'muru-cards/AAC-cards/illustration/Food/aac_apple.png')
 */
export const getCloudinaryUrl = (imagePath: string): string => {
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${imagePath}?${CLOUDINARY_CONFIG.cacheVersion}`;
};

/**
 * Fetch all AAC cards
 * @param category Optional category to filter
 */
export const fetchAACCards = async (category?: string): Promise<AACCard[]> => {
    let query = supabase
        .from('aac_cards')
        .select('*')
        .order('label', { ascending: true }); // Alphabetical order by label

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching AAC cards:', error);
        return [];
    }

    // Map to include full Cloudinary URL
    return (data || []).map(card => ({
        ...card,
        cloudinaryUrl: getCloudinaryUrl(card.image_path)
    }));
};
