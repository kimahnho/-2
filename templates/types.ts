import { DesignElement } from '../types';
import React from 'react';

export type TemplateCategory = 'all' | 'emotion' | 'cognitive' | 'social' | 'aac';

export interface TemplateDefinition {
    id: string;
    name: string;
    description?: string;
    category?: TemplateCategory;
    thumbnail: string;

    // For Static Templates
    elements?: DesignElement[];

    // For Dynamic Templates
    isDynamic?: boolean;
    ConfigComponent?: React.FC<{
        onApply: (elements: DesignElement[], orientation: 'portrait' | 'landscape') => void;
        onClose: () => void;
        onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
    }>;
}
